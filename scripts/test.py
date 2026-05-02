#!/usr/bin/env python3
"""Moss & Tea — Pre-Deploy Validation Suite"""
import os, sys, re, subprocess, json

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(SITE_DIR, "public")
DEPLOY_URL = "https://mossandtea.lazar-99d.workers.dev"
PASS, FAIL, WARN = 0, 0, 0

def check(name, passed, warn=False):
    global PASS, FAIL, WARN
    icon = "✓" if passed else ("⚠" if warn else "✗")
    color = "\033[0;32m" if passed else ("\033[1;33m" if warn else "\033[0;31m")
    print(f"  {color}{icon}\033[0m {name}")
    if passed: PASS += 1
    elif warn: WARN += 1
    else: FAIL += 1

def file_exists(path):
    return os.path.isfile(os.path.join(SITE_DIR, path))

def public_file_exists(path):
    return os.path.isfile(os.path.join(PUBLIC_DIR, path))

def grep_file(path, pattern):
    f = os.path.join(SITE_DIR, path)
    if not os.path.isfile(f): return False
    with open(f) as fh: return bool(re.search(pattern, fh.read()))

print("\n═══════════════════════════════════════")
print("  Moss & Tea — Pre-Deploy Validation")
print("═══════════════════════════════════════\n")

# === 0. Build deployable public assets ===
print("🏗️  Public Build")
build = subprocess.run(["npm", "run", "build"],
                       cwd=SITE_DIR, capture_output=True, text=True)
check("npm run build", build.returncode == 0)
if build.returncode != 0:
    print(build.stderr or build.stdout)
print()

# === 1. Static Files ===
print("📁 Static Files")
required_files = [
    "index.html", "css/style.css", "css/motion.css", "js/main.js",
    "admin/index.html", "admin/css/admin.css", "admin/js/admin.js",
    "admin/js/alpine.min.js", "admin/js/supabase.min.js",
    "hermitage/index.html", "hermitage/css/hermitage.css", "hermitage/js/hermitage.js",
    "portal/index.html",
    "telegram-console/index.html", "telegram-console/style.css", "telegram-console/app.js",
    "worker.js", "wrangler.toml"
]
for f in required_files:
    check(f"  {f} exists", file_exists(f))

public_required = [
    "index.html", "css/style.css", "css/motion.css", "js/main.js",
    "admin/index.html", "admin/css/admin.css", "admin/js/admin.js",
    "admin/js/alpine.min.js", "admin/js/supabase.min.js",
    "hermitage/index.html", "hermitage/css/hermitage.css", "hermitage/js/hermitage.js",
    "portal/index.html",
    "telegram-console/index.html", "telegram-console/style.css", "telegram-console/app.js",
]
for f in public_required:
    check(f"  public/{f} exists", public_file_exists(f))
for blocked in ["supabase/config.toml", "scripts/deploy.sh", "worker.js", "wrangler.toml", ".env"]:
    check(f"  public/{blocked} absent", not public_file_exists(blocked))
print()

# === 2. HTML Structure ===
print("📝 HTML Structure")
for html in ["public/index.html", "public/admin/index.html", "public/hermitage/index.html", "public/portal/index.html"]:
    if file_exists(html):
        p = os.path.join(SITE_DIR, html)
        with open(p) as f:
            content = f.read()
        check(f"{html}: DOCTYPE", "<!DOCTYPE html>" in content)
        check(f"{html}: </html>", "</html>" in content)
        # Balanced script tags
        opens = content.count("<script")
        closes = content.count("</script>")
        check(f"{html}: script tags balanced ({opens}/{closes})", opens == closes)
        # CDN check — warn if external CDN scripts (should be local bundles)
        cdn_matches = re.findall(r'<script[^>]+src="https?://[^"]+\.(js|min\.js)"', content)
        if cdn_matches:
            check(f"{html}: uses external CDN scripts: {cdn_matches}", False, warn=True)
        else:
            check(f"{html}: all scripts are local", True)
print()

# === 3. JS Syntax ===
print("🔍 JavaScript")
for js in ["js/main.js", "admin/js/admin.js", "hermitage/js/hermitage.js", "telegram-console/app.js", "worker.js"]:
    if file_exists(js):
        result = subprocess.run(["node", "--check", os.path.join(SITE_DIR, js)],
                                capture_output=True, text=True)
        check(f"{js} syntax", result.returncode == 0)
print()

# === 4. Config ===
print("🔌 Configuration")
js_path = os.path.join(SITE_DIR, "admin/js/admin.js")
if os.path.isfile(js_path):
    with open(js_path) as f:
        js = f.read()
    check("SUPABASE_URL configured", "ixfmstlnwnfjkocpordu.supabase.co" in js)
    check("SUPABASE_ANON_KEY configured", "eyJhbG" in js)
    check("No placeholder keys", "YOUR-PROJECT" not in js and "your-anon-key" not in js)

# Worker config
if file_exists("wrangler.toml"):
    check("wrangler.toml has name field", grep_file("wrangler.toml", r'^\s*name\s*='))
    check("wrangler.toml assets directory is public", grep_file("wrangler.toml", r'directory\s*=\s*"public"'))

# Check .wranglerignore keeps local/private artifacts out if assets ever change
if file_exists(".wranglerignore"):
    with open(os.path.join(SITE_DIR, ".wranglerignore")) as f:
        ignored = f.read()
    check(".env in .wranglerignore", ".env" in ignored.split("\n"))
print()

# === 5. CSS sanity ===
print("🎨 CSS")
for css in ["css/style.css", "css/motion.css", "admin/css/admin.css", "hermitage/css/hermitage.css"]:
    if file_exists(css):
        with open(os.path.join(SITE_DIR, css)) as f:
            c = f.read()
        if css != "css/motion.css":
            check(f"{css}: has body selector", "body" in c or "body{" in c.replace(" ", ""))
        check(f"{css}: has CSS variables", ":root" in c or "--" in c)
        check(f"{css}: no shell heredoc artifacts", "LIGHTboxEOF" not in c and "echo " not in c)
print()

# === 6. Portal security assertions ===
print("🔐 Portal Security")
for migration in ["supabase/migrations/00006_client_portal.sql"]:
    check(f"{migration} exists", file_exists(migration))
check("worker disables legacy file proxy", grep_file("worker.js", r"File proxy is disabled") and not grep_file("worker.js", r"ENABLE_PUBLIC_FILE_PROXY"))
check("worker redirects /portal to /hermitage", grep_file("worker.js", r"/portal") and grep_file("worker.js", r"/hermitage/"))
if file_exists("supabase/migrations/00006_client_portal.sql"):
    check("00006 drops authenticated_read storage policy", grep_file("supabase/migrations/00006_client_portal.sql", r'DROP POLICY IF EXISTS "authenticated_read"'))
    check("00006 uses customer_users access model", grep_file("supabase/migrations/00006_client_portal.sql", r"customer_users") and grep_file("supabase/migrations/00006_client_portal.sql", r"can_access_project"))
    check("00006 gates storage through project_files", grep_file("supabase/migrations/00006_client_portal.sql", r"customer_storage_read_visible_project_files"))
print()

# === Summary ===
print("═══════════════════════════════════════")
print(f"  \033[0;32m{PASS} passed\033[0m, \033[0;31m{FAIL} failed\033[0m, \033[1;33m{WARN} warnings\033[0m")
print("═══════════════════════════════════════")

if FAIL:
    print(f"\n\033[0;31m❌ {FAIL} checks failed. Fix before deploying.\033[0m")
    sys.exit(1)
elif WARN:
    print(f"\n\033[1;33m⚠ Warnings exist — deploy ok but check them.\033[0m")
    sys.exit(0)
else:
    print(f"\n\033[0;32m✅ All checks passed. Ready to deploy!\033[0m")
    sys.exit(0)
