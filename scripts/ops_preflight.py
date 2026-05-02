#!/usr/bin/env python3
"""Moss & Tea deploy capability preflight.

This script is intentionally safe for Telegram/Codex output: it reports whether
secrets exist, never the secret values.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OPS_ENV = Path.home() / ".hermes" / "workspaces" / "mossandtea.env"
DEFAULT_WORKER_URL = "https://mossandtea.lazar-99d.workers.dev"
DEFAULT_PUBLIC_URL = "https://mossandtea.com"
SECRET_KEYS = {
    "CLOUDFLARE_API_TOKEN",
    "CF_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CF_ACCOUNT_ID",
}


def load_env_file(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            env[key] = value
    return env


def merged_env() -> tuple[dict[str, str], Path, bool]:
    env_path = Path(os.getenv("MOSSANDTEA_OPS_ENV", str(DEFAULT_OPS_ENV))).expanduser()
    file_env = load_env_file(env_path)
    env = dict(os.environ)
    env.update(file_env)
    return env, env_path, env_path.exists()


def command_result(command: list[str], env: dict[str, str], timeout: int = 10) -> tuple[bool, str]:
    try:
        completed = subprocess.run(
            command,
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except FileNotFoundError:
        return False, "not found"
    except subprocess.TimeoutExpired:
        return False, "timed out"
    output = (completed.stdout or completed.stderr or "").strip().splitlines()
    detail = output[0].strip() if output else f"exit {completed.returncode}"
    return completed.returncode == 0, redact(detail)


def redact(text: str) -> str:
    out = text
    for key in SECRET_KEYS:
        value = os.getenv(key)
        if value:
            out = out.replace(value, "<redacted>")
    return out


def host_from_url(url: str) -> str:
    return url.split("://", 1)[-1].split("/", 1)[0].split(":", 1)[0]


def check_dns(url: str) -> tuple[bool, str]:
    host = host_from_url(url)
    try:
        socket.getaddrinfo(host, 443)
        return True, host
    except socket.gaierror as exc:
        return False, f"{host}: {exc}"


def check_http(url: str, expected: set[int] | None = None) -> tuple[bool, str]:
    expected = expected or {200}
    try:
        req = urllib.request.Request(url, method="GET", headers={"User-Agent": "mossandtea-ops-preflight"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            status = int(resp.status)
        return status in expected, f"HTTP {status}"
    except urllib.error.HTTPError as exc:
        return exc.code in expected, f"HTTP {exc.code}"
    except Exception as exc:
        return False, str(exc)


def check_cloudflare_api(env: dict[str, str]) -> tuple[bool, str]:
    token = env.get("CLOUDFLARE_API_TOKEN") or env.get("CF_API_TOKEN") or ""
    if token:
        try:
            req = urllib.request.Request(
                "https://api.cloudflare.com/client/v4/user/tokens/verify",
                headers={"Authorization": f"Bearer {token}", "User-Agent": "mossandtea-ops-preflight"},
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            if data.get("success"):
                return True, "API token verified"
            return False, "API token rejected"
        except urllib.error.HTTPError as exc:
            return False, f"API token verify failed: HTTP {exc.code}"
        except Exception as exc:
            return False, f"API token verify failed: {exc}"

    ok, detail = command_result(["wrangler", "whoami"], env, timeout=15)
    if ok:
        return True, "wrangler login available"
    return False, f"no Cloudflare API token and wrangler auth unavailable ({detail})"


def status_item(name: str, ok: bool, detail: str, required: bool = True) -> dict[str, Any]:
    return {"name": name, "ok": ok, "detail": detail, "required": required}


def collect() -> dict[str, Any]:
    env, env_path, env_file_exists = merged_env()
    worker_url = env.get("WORKER_URL", DEFAULT_WORKER_URL).rstrip("/")
    public_url = env.get("PUBLIC_UI_URL", DEFAULT_PUBLIC_URL).rstrip("/")
    token_present = bool(env.get("CLOUDFLARE_API_TOKEN") or env.get("CF_API_TOKEN"))
    account_present = bool(env.get("CLOUDFLARE_ACCOUNT_ID") or env.get("CF_ACCOUNT_ID"))

    checks: list[dict[str, Any]] = []

    checks.append(status_item("ops env file", env_file_exists, str(env_path), required=False))

    for command in ["node", "npm", "wrangler"]:
        path = shutil.which(command, path=env.get("PATH"))
        checks.append(status_item(command, bool(path), path or "not found"))

    ok, detail = command_result(["node", "--version"], env)
    checks.append(status_item("node runtime", ok, detail))

    ok, detail = command_result(["wrangler", "--version"], env)
    checks.append(status_item("wrangler runtime", ok, detail))

    checks.append(status_item("Cloudflare API token", token_present, "present" if token_present else "missing", required=False))
    checks.append(status_item("Cloudflare account id", account_present, "present" if account_present else "missing", required=False))

    ok, detail = check_cloudflare_api(env)
    checks.append(status_item("Cloudflare auth", ok, detail))

    for label, url in [("worker DNS", worker_url), ("custom domain DNS", public_url)]:
        ok, detail = check_dns(url)
        checks.append(status_item(label, ok, detail))

    for label, url in [("worker HTTP", worker_url), ("custom domain HTTP", public_url)]:
        ok, detail = check_http(url)
        checks.append(status_item(label, ok, detail))

    ok, detail = command_result(["npm", "test"], env, timeout=45)
    checks.append(status_item("npm test", ok, detail))

    ready = all(item["ok"] for item in checks if item["required"])
    return {
        "workspace": str(ROOT),
        "worker_url": worker_url,
        "public_url": public_url,
        "ops_env": str(env_path),
        "ops_env_exists": env_file_exists,
        "deploy_ready": ready,
        "checks": checks,
    }


def render_text(report: dict[str, Any]) -> str:
    lines = [
        "Moss & Tea deploy preflight",
        f"Workspace: {report['workspace']}",
        f"Worker: {report['worker_url']}",
        f"Public: {report['public_url']}",
        f"Deploy ready: {'yes' if report['deploy_ready'] else 'no'}",
        "",
        "Checks:",
    ]
    for item in report["checks"]:
        icon = "OK" if item["ok"] else ("WARN" if not item["required"] else "BLOCKED")
        lines.append(f"- {icon}: {item['name']} - {item['detail']}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    args = parser.parse_args()
    report = collect()
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print(render_text(report))
    return 0 if report["deploy_ready"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
