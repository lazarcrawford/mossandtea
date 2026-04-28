#!/usr/bin/env python3
"""Upload sample images from local files to Supabase Storage."""
import json, urllib.request, os, sys

SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zm1zdGxud25mamtvY3BvcmR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMxMDQ1MCwiZXhwIjoyMDkyODg2NDUwfQ.op3plZBbFa7FCdZ8kxwLIN-31V-FTbjmx45mxnsgoyY'
BASE = 'https://ixfmstlnwnfjkocpordu.supabase.co/rest/v1'
STORAGE_BASE = 'https://ixfmstlnwnfjkocpordu.supabase.co/storage/v1/object/project-files'
HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def api_post(table, data):
    req = urllib.request.Request(
        f'{BASE}/{table}',
        data=json.dumps(data).encode(),
        headers=HEADERS,
        method='POST'
    )
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.code} — {e.read().decode()[:200]}")
        return None

def api_get(table, params=''):
    req = urllib.request.Request(
        f'{BASE}/{table}?{params}',
        headers={k: v for k, v in HEADERS.items() if k != 'Content-Type'},
        method='GET'
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

# Get project IDs
projects = api_get('projects', 'select=id,title')
proj_map = {p['title']: p['id'] for p in projects}
print("Projects:", json.dumps({k[:30]: v[:8] for k, v in proj_map.items()}, indent=2))

# Map images to projects (using local files)
IMAGE_DIR = os.path.expanduser('~/sites/mossandtea/images/irina')

image_map = {
    "Golden Hour Portrait Session": [
        "Makenna13.jpg",
        "Makenna09S.jpg",
        "G3A5407B.jpg",   # hero portrait used on site
    ],
    "Editorial Portrait Study": [
        "Braina10.jpg",
        "Braina05.jpg",
    ],
    "Fashion Editorial — Spring Collection": [
        "Ganna08.jpg",
        "G3A5499.jpg",
    ],
    "NHMLA Architecture & Events": [
        "nhmla02.jpg",
        "nhmla03.jpg",
        "nhmla04.jpg",
    ],
    "Ecuador River Landscape Series": [
        "cenit_river01.jpg",
        "cenit_12B.jpg",
        "cenit_21B.jpg",
        "cenit_28.jpg",
    ],
}

file_count = 0
for project_title, images in image_map.items():
    pid = proj_map.get(project_title)
    if not pid:
        print(f"  ✗ Project not found: {project_title}")
        continue
    
    for filename in images:
        filepath = os.path.join(IMAGE_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  ✗ File not found: {filepath}")
            continue
        
        try:
            with open(filepath, 'rb') as f:
                img_data = f.read()
            
            file_size = len(img_data)
            key = f"projects/{pid}/{filename}"
            
            # Upload to Supabase Storage
            upload_req = urllib.request.Request(
                f'{STORAGE_BASE}/{key}',
                data=img_data,
                headers={
                    'apikey': SERVICE_KEY,
                    'Authorization': f'Bearer {SERVICE_KEY}',
                    'Content-Type': 'image/jpeg',
                },
                method='POST'
            )
            upload_resp = urllib.request.urlopen(upload_req)
            print(f"  ✓ Uploaded {filename} ({file_size//1024}KB) -> {key}")
            
            # Record in project_files table
            file_record = {
                "project_id": pid,
                "filename": filename,
                "original_name": filename,
                "mime_type": "image/jpeg",
                "file_size": file_size,
                "r2_key": key,
                "uploaded_by": "admin"
            }
            result = api_post('project_files', file_record)
            if result:
                print(f"    ✓ DB record created")
                file_count += 1
            
        except Exception as e:
            print(f"  ✗ Failed {filename}: {str(e)[:150]}")

print(f"\n=== DONE: {file_count} files uploaded and recorded ===")