#!/usr/bin/env python3
"""Seed Moss & Tea CRM with sample data based on Irina's portfolio."""
import json, urllib.request, os

SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zm1zdGxud25mamtvY3BvcmR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMxMDQ1MCwiZXhwIjoyMDkyODg2NDUwfQ.op3plZBbFa7FCdZ8kxwLIN-31V-FTbjmx45mxnsgoyY'
BASE = 'https://ixfmstlnwnfjkocpordu.supabase.co/rest/v1'
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

# =============================================
# 1. SAMPLE CUSTOMERS
# =============================================
print("=== Seeding customers ===")
customers = [
    {
        "email": "makenna.stone@email.com",
        "first_name": "Makenna",
        "last_name": "Stone",
        "phone": "(310) 555-0142",
        "instagram": "@makenna.stone",
        "address": "Santa Monica, CA",
        "notes": "Portrait & family session. Found us through Instagram. Loves golden hour light."
    },
    {
        "email": "briana.okafor@email.com",
        "first_name": "Briana",
        "last_name": "Okafor",
        "phone": "(323) 555-0289",
        "instagram": "@briana.okafor",
        "address": "Los Angeles, CA",
        "notes": "Portrait study session. Editorial style. Prefers moody tones."
    },
    {
        "email": "ganna.koval@email.com",
        "first_name": "Ganna",
        "last_name": "Koval",
        "phone": "(212) 555-0193",
        "instagram": "@ganna.koval",
        "address": "Brooklyn, NY",
        "notes": "Editorial fashion portrait. Referred by a stylist. High-energy creative."
    },
    {
        "email": "nlmla.events@email.com",
        "first_name": "Sandra",
        "last_name": "Chen",
        "phone": "(213) 555-0371",
        "instagram": "@sandrac.creates",
        "address": "Downtown LA, CA",
        "notes": "NHMLA architectural/commercial shoot. Museum event coverage."
    },
    {
        "email": "cenittravel@email.com",
        "first_name": "Carlos",
        "last_name": "Rivera",
        "phone": "(415) 555-0428",
        "instagram": "@cenit.river",
        "address": "San Francisco, CA",
        "notes": "Travel & landscape photography. Ecuador river series. Drone + ground combo."
    }
]

customer_ids = {}
for c in customers:
    result = api_post('customers', c)
    if result:
        cid = result[0]['id'] if isinstance(result, list) else result['id']
        customer_ids[c['first_name']] = cid
        print(f"  ✓ {c['first_name']} {c['last_name']} — {cid}")
    else:
        print(f"  ✗ Failed: {c['first_name']}")

# =============================================
# 2. SAMPLE PROJECTS
# =============================================
print("\n=== Seeding projects ===")
projects = [
    {
        "customer_id": customer_ids.get('Makenna', ''),
        "title": "Golden Hour Portrait Session",
        "description": "Outdoor portrait session at Santa Monica beach during golden hour. Natural light, flowing dresses, candid moments.",
        "status": "delivered",
        "shoot_date": "2026-02-14",
        "delivery_date": "2026-03-01",
        "location": "Santa Monica Beach, CA",
        "price_cents": 85000,
        "deposit_cents": 42500,
        "deposit_paid": True,
        "balance_paid": True,
        "notes": "Client loved the images — posted 8 to Instagram within an hour of delivery."
    },
    {
        "customer_id": customer_ids.get('Briana', ''),
        "title": "Editorial Portrait Study",
        "description": "Studio portrait series with dramatic lighting. Moody editorial aesthetic with deep shadows and rich skin tones.",
        "status": "editing",
        "shoot_date": "2026-04-05",
        "delivery_date": None,
        "location": "Home Studio, LA",
        "price_cents": 120000,
        "deposit_cents": 60000,
        "deposit_paid": True,
        "balance_paid": False,
        "notes": "Need to finish retouching 12 selects. Client wants moody crop on 3 shots."
    },
    {
        "customer_id": customer_ids.get('Ganna', ''),
        "title": "Fashion Editorial — Spring Collection",
        "description": "High-energy fashion shoot for spring editorial. Manhattan loft location. Three outfit changes, bold colors.",
        "status": "shoot_complete",
        "shoot_date": "2026-04-20",
        "delivery_date": None,
        "location": "Manhattan Loft, NY",
        "price_cents": 250000,
        "deposit_cents": 125000,
        "deposit_paid": True,
        "balance_paid": False,
        "notes": "Stylist provided wardrobe. 200+ raw selects. Client wants 30 finals."
    },
    {
        "customer_id": customer_ids.get('Sandra', ''),
        "title": "NHMLA Architecture & Events",
        "description": "Architectural detail shots and event coverage at the Natural History Museum of Los Angeles. Commercial usage license.",
        "status": "booked",
        "shoot_date": "2026-05-15",
        "delivery_date": None,
        "location": "NHMLA, Exposition Park, LA",
        "price_cents": 350000,
        "deposit_cents": 175000,
        "deposit_paid": True,
        "balance_paid": False,
        "notes": "Museum requires credential check day-of. Contact: events@nhmla.org"
    },
    {
        "customer_id": customer_ids.get('Carlos', ''),
        "title": "Ecuador River Landscape Series",
        "description": "Travel landscape series documenting the Río Cenit in Ecuador. Aerial drone footage + ground-level compositions.",
        "status": "delivered",
        "shoot_date": "2026-01-10",
        "delivery_date": "2026-02-15",
        "location": "Río Cenit, Ecuador",
        "price_cents": 150000,
        "deposit_cents": 75000,
        "deposit_paid": True,
        "balance_paid": True,
        "notes": "12-print series delivered. Client licensed 4 images for tourism board campaign."
    }
]

project_ids = {}
for p in projects:
    # Remove None values
    p_clean = {k: v for k, v in p.items() if v is not None}
    result = api_post('projects', p_clean)
    if result:
        pid = result[0]['id'] if isinstance(result, list) else result['id']
        project_ids[p['title'][:20]] = pid
        print(f"  ✓ {p['title'][:50]} — {p['status']}")
    else:
        print(f"  ✗ Failed: {p['title'][:50]}")

# Get full project list with titles for file linking
print("\n=== Fetching project IDs ===")
all_projects = api_get('projects', 'select=id,title')
proj_map = {p['title']: p['id'] for p in all_projects}
for title, pid in proj_map.items():
    print(f"  {title}: {pid}")

# =============================================
# 3. SAMPLE PAYMENTS
# =============================================
print("\n=== Seeding payments ===")
payments = [
    # Makenna — fully paid
    {"project_id": proj_map.get("Golden Hour Portrait Session", ""), "amount_cents": 42500, "method": "venmo", "notes": "Deposit", "paid_at": "2026-02-01T10:00:00Z"},
    {"project_id": proj_map.get("Golden Hour Portrait Session", ""), "amount_cents": 42500, "method": "venmo", "notes": "Final payment", "paid_at": "2026-03-01T14:30:00Z"},
    # Briana — deposit only
    {"project_id": proj_map.get("Editorial Portrait Study", ""), "amount_cents": 60000, "method": "card", "notes": "Deposit via Stripe", "paid_at": "2026-03-28T09:00:00Z"},
    # Ganna — deposit only
    {"project_id": proj_map.get("Fashion Editorial — Spring Collection", ""), "amount_cents": 125000, "method": "bank_transfer", "notes": "Wire transfer", "paid_at": "2026-04-10T11:00:00Z"},
    # Sandra — deposit only
    {"project_id": proj_map.get("NHMLA Architecture & Events", ""), "amount_cents": 175000, "method": "card", "notes": "Museum PO deposit", "paid_at": "2026-04-25T16:00:00Z"},
    # Carlos — fully paid
    {"project_id": proj_map.get("Ecuador River Landscape Series", ""), "amount_cents": 75000, "method": "zelle", "notes": "Deposit", "paid_at": "2025-12-15T10:00:00Z"},
    {"project_id": proj_map.get("Ecuador River Landscape Series", ""), "amount_cents": 75000, "method": "zelle", "notes": "Balance + licensing bonus", "paid_at": "2026-02-20T10:00:00Z"},
]

for pay in payments:
    if not pay['project_id']:
        continue
    result = api_post('payments', pay)
    if result:
        print(f"  ✓ ${pay['amount_cents']/100:.0f} — {pay['method']} — {pay['notes']}")
    else:
        print(f"  ✗ Failed payment")

# =============================================
# 4. SAMPLE FILES (via Supabase Storage)
# =============================================
print("\n=== Uploading sample images to Storage ===")

# The images on the site that correspond to our sample projects
image_map = {
    "Golden Hour Portrait Session": [
        ("https://mossandtea.com/images/irina/Makenna13.jpg", "Makenna13.jpg"),
        ("https://mossandtea.com/images/irina/Makenna09S.jpg", "Makenna09S.jpg"),
    ],
    "Editorial Portrait Study": [
        ("https://mossandtea.com/images/irina/Braina10.jpg", "Braina10.jpg"),
    ],
    "Fashion Editorial — Spring Collection": [
        ("https://mossandtea.com/images/irina/Ganna08.jpg", "Ganna08.jpg"),
    ],
    "NHMLA Architecture & Events": [
        ("https://mossandtea.com/images/irina/nhmla02.jpg", "nhmla02.jpg"),
    ],
    "Ecuador River Landscape Series": [
        ("https://mossandtea.com/images/irina/cenit_river01.jpg", "cenit_river01.jpg"),
    ],
    "Golden Hour Portrait Session": [
        ("https://mossandtea.com/images/irina/G3A5499.jpg", "G3A5499_editorial.jpg"),
        ("https://mossandtea.com/images/irina/G3A5407B.jpg", "G3A5407B_hero.jpg"),
    ],
}

# Download and upload images to Supabase Storage
import tempfile

file_records = []
for project_title, images in image_map.items():
    pid = proj_map.get(project_title)
    if not pid:
        print(f"  ✗ Project not found: {project_title}")
        continue
    
    for url, filename in images:
        try:
            # Download image
            print(f"  Downloading {filename}...")
            dl_req = urllib.request.Request(url)
            dl_resp = urllib.request.urlopen(dl_req)
            img_data = dl_resp.read()
            content_type = dl_resp.headers.get('Content-Type', 'image/jpeg')
            
            # Upload to Supabase Storage
            key = f"projects/{pid}/{filename}"
            upload_req = urllib.request.Request(
                f'https://ixfmstlnwnfjkocpordu.supabase.co/storage/v1/object/project-files/{key}',
                data=img_data,
                headers={
                    'apikey': SERVICE_KEY,
                    'Authorization': f'Bearer {SERVICE_KEY}',
                    'Content-Type': content_type,
                },
                method='POST'
            )
            upload_resp = urllib.request.urlopen(upload_req)
            upload_result = json.loads(upload_resp.read())
            print(f"  ✓ Uploaded {filename} -> {key}")
            
            # Record in project_files table
            file_record = {
                "project_id": pid,
                "filename": filename,
                "original_name": filename,
                "mime_type": content_type,
                "file_size": len(img_data),
                "r2_key": key,
                "uploaded_by": "admin"
            }
            result = api_post('project_files', file_record)
            if result:
                fid = result[0]['id'] if isinstance(result, list) else result['id']
                file_records.append(fid)
                print(f"    ✓ DB record: {fid}")
            
        except Exception as e:
            print(f"  ✗ Failed {filename}: {str(e)[:100]}")

# =============================================
# 5. SAMPLE CONTRACT
# =============================================
print("\n=== Seeding contract ===")
# We can't create a real PDF, but we can create a contract record
contract = {
    "project_id": proj_map.get("NHMLA Architecture & Events", ""),
    "title": "NHMLA Commercial Photography Agreement",
    "r2_key": "contracts/placeholder_commercial_agreement.pdf",
    "signed_by_customer": True,
    "signed_at": "2026-04-20T10:00:00Z",
    "signed_by_admin": True,
    "admin_signed_at": "2026-04-19T15:00:00Z"
}
if contract['project_id']:
    result = api_post('contracts', contract)
    if result:
        print(f"  ✓ Contract created for NHMLA project")
    else:
        print(f"  ✗ Failed contract")

print("\n=== DONE ===")
print(f"Customers: {len(customer_ids)}")
print(f"Projects: {len(proj_map)}")
print(f"Payments: {len([p for p in payments if p['project_id']])}")
print(f"Files: {len(file_records)}")