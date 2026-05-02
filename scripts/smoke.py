#!/usr/bin/env python3
"""Smoke test — checks deployed site responds correctly. Uses curl to avoid Cloudflare blocks."""
import subprocess, sys, json

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://mossandtea.lazar-99d.workers.dev"

TESTS = [
    ("Main page",       BASE_URL + "/",                        200),
    ("Admin panel",     BASE_URL + "/admin/",                  200),
    ("Health API",      BASE_URL + "/api/health",              200),
    ("Main CSS",        BASE_URL + "/css/style.css",           200),
    ("Motion CSS",      BASE_URL + "/css/motion.css",          200),
    ("Main JS",         BASE_URL + "/js/main.js",              200),
    ("Admin CSS",       BASE_URL + "/admin/css/admin.css",     200),
    ("Admin JS",        BASE_URL + "/admin/js/admin.js",       200),
    ("Admin HTML",      BASE_URL + "/admin/index.html",        200),
    ("Supabase config blocked", BASE_URL + "/supabase/config.toml", 404),
    ("Deploy script blocked",   BASE_URL + "/scripts/deploy.sh",   404),
]

passed = 0
failed = 0

print(f"\n🔥 Smoke Testing: {BASE_URL}\n")

for name, url, expected in TESTS:
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
             "--connect-timeout", "10", "-L", url],
            capture_output=True, text=True, timeout=15
        )
        status = int(result.stdout.strip() or 0)
    except Exception as e:
        print(f"  ⚠ {name:25s}  ERROR — {e}")
        continue

    if status == expected:
        print(f"  ✓ {name:25s}  {status}")
        passed += 1
    else:
        print(f"  ✗ {name:25s}  got {status}, expected {expected}")
        failed += 1

print(f"\n{'='*50}")
print(f"  {passed} passed, {failed} failed")
print(f"{'='*50}")

if failed:
    sys.exit(1)
