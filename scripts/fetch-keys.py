#!/usr/bin/env python3
"""Fetch Supabase project API keys."""
import json, urllib.request, sys

TOKEN = sys.argv[1]
PROJECT_REF = sys.argv[2]

req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys",
    headers={"Authorization": f"Bearer {TOKEN}"}
)
resp = urllib.request.urlopen(req)
data = json.load(resp)

for entry in data:
    name = entry.get("name", "?")
    key = entry.get("api_key", "")
    if name == "anon":
        print(f"SUPABASE_ANON_KEY={key}")
    elif name == "service_role":
        print(f"SUPABASE_SERVICE_KEY={key}")

print(f"SUPABASE_URL=https://{PROJECT_REF}.supabase.co")
