#!/usr/bin/env python3
"""Moss & Tea — Pre-Deploy Validation Suite"""
import os, sys, re, subprocess, json

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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

def grep_file(path, pattern):
    f = os.path.join(SITE_DIR, path)
    if not os.path.isfile(f): return False
    with open(f) as fh: return bool(re.search(pattern, fh.read()))

print("\n═══════════════════════════════════════")
print("  Moss & Tea — Pre-Deploy Validation")
print("═══════════════════════════════════════\n")

# === 1. Static Files ===
print("📁 Static Files")
required_files = [
    "index.html", "css/style.css", "css/motion.css", "js/main.js",
    "admin/index.html", "admin/css/admin.css", "admin/js/admin.js",
    "admin/js/alpine.min.js", "admin/js/supabase.min.js",
    "api-worker.js", "wrangler.toml"
]
for f in required_files:
    check(f"  {f} exists", file_exists(f))
print()

# === 2. HTML Structure ===
print("📝 HTML Structure")
for html in ["index.html", "admin/index.html"]:
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
for js in ["js/main.js", "admin/js/admin.js", "api-worker.js"]:
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

# Check .wranglerignore doesn't exclude the worker
if file_exists(".wranglerignore"):
    with open(os.path.join(SITE_DIR, ".wranglerignore")) as f:
        ignored = f.read()
    check("api-worker.js NOT in .wranglerignore", "api-worker.js" not in ignored)
print()

# === 5. CSS sanity ===
print("🎨 CSS")
for css in ["css/style.css", "admin/css/admin.css"]:
    if file_exists(css):
        with open(os.path.join(SITE_DIR, css)) as f:
            c = f.read()
        check(f"{css}: has body selector", "body" in c or "body{" in c.replace(" ", ""))
        check(f"{css}: has CSS variables", ":root" in c or "--" in c)
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
