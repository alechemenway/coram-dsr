# Supabase Database Setup & Migration

Complete instructions for setting up the `digital_sales_rooms` table and populating it with data.

## Prerequisites

- Supabase account with project created
- Access to Supabase dashboard
- The Novi DSR data (or sample data)

## Database Schema

### SQL to Create Table

Run this SQL in your Supabase SQL editor to create the table:

```sql
CREATE TABLE digital_sales_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  -- Prospect Information
  prospect_name TEXT,
  prospect_contact TEXT,
  prospect_title TEXT,

  -- Meeting Details
  meeting_date TEXT,
  meeting_title TEXT,
  meeting_duration TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,

  -- Team Information
  coram_team JSONB DEFAULT '[]'::jsonb,

  -- Deal Information
  hubspot_deal_id TEXT,
  hubspot_quote_id TEXT,
  fireflies_transcript_id TEXT,
  deal_amount NUMERIC,
  deal_stage TEXT,
  close_date DATE,

  -- Content Sections
  environment JSONB DEFAULT '{}'::jsonb,
  outcomes JSONB DEFAULT '[]'::jsonb,
  call_highlights JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  references_data JSONB DEFAULT '[]'::jsonb,
  grants JSONB DEFAULT '[]'::jsonb,
  pricing JSONB DEFAULT '{}'::jsonb,

  -- Access & Status
  access_code TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_digital_sales_rooms_slug ON digital_sales_rooms(slug);
```

### Enable Row Level Security (Optional)

If you want to restrict access based on user roles:

```sql
-- Enable RLS
ALTER TABLE digital_sales_rooms ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (unauthenticated) users to read all DSRs
CREATE POLICY "Allow anonymous read access" ON digital_sales_rooms
  FOR SELECT
  USING (TRUE);

-- Allow authenticated users to manage their own DSRs
CREATE POLICY "Allow authenticated users to manage DSRs" ON digital_sales_rooms
  FOR ALL
  USING (auth.role() = 'authenticated');
```

**Note**: The app currently uses the anon key, so it only needs SELECT permission.

## Sample Data: Novi DSR

Insert the Novi DSR data with this query:

```sql
INSERT INTO digital_sales_rooms (
  slug,
  prospect_name,
  prospect_contact,
  prospect_title,
  meeting_date,
  meeting_title,
  meeting_duration,
  attendees,
  coram_team,
  environment,
  deal_amount,
  deal_stage,
  close_date,
  outcomes,
  call_highlights,
  milestones,
  resources,
  references_data,
  grants,
  pricing,
  access_code,
  status
) VALUES (
  'novi-dsr',
  'Novi Community School District',
  'Dennis Huisman',
  'Director of Emergency and Safety',
  'March 25, 2026',
  'Trial Setup & Platform Walkthrough',
  '41 min',
  '[
    {"name": "Dennis Huisman", "role": "Director of Emergency & Safety", "org": "Novi Community Schools"},
    {"name": "Jason Smith", "role": "Director of Technology", "org": "Oakland Schools (ISD)"},
    {"name": "Chad Marshall", "role": "Technology Support", "org": "Oakland Schools (ISD)"},
    {"name": "Lisa Whiteside", "role": "Technology Team", "org": "Oakland Schools (ISD)"}
  ]'::jsonb,
  '[
    {"name": "Alec Hemenway", "role": "Account Executive", "email": "alec.hemenway@coram.ai", "phone": "(555) 234-5678"},
    {"name": "Matt Neilsen", "role": "Solutions Engineer", "email": "matt.neilsen@coram.ai", "phone": null}
  ]'::jsonb,
  '{"cameras": 22, "buildings": 1, "camera_type": "Hana (ONVIF)", "site": "Novi ROAR Center"}'::jsonb,
  '$200,000'::numeric,
  'Presentation Scheduled',
  '2026-05-31',
  '[
    {
      "title": "One platform for cameras, doors, alerts, and investigations",
      "description": "22 cameras at the ROAR Center — video management, access control, emergency response, and visitor management in a single system. No more toggling between platforms when something happens.",
      "icon": "Video"
    },
    {
      "title": "AI search replaces manual footage scrubbing",
      "description": "Type what you''re looking for — \"person carrying a cart,\" \"cell phone in hand\" — and get timestamped results across all cameras. Investigations that took hours now take minutes.",
      "icon": "Search"
    },
    {
      "title": "Firearm detection with automated lockdown — not just an alert",
      "description": "Detection triggers door locks, staff notifications, and first responder contact automatically. Scheduled for live testing April 10th with your team.",
      "icon": "Shield"
    },
    {
      "title": "Vape detection + environmental monitoring built in",
      "description": "Halo sensors integrated directly — vape detection, temperature, humidity, noise. Alerts paired with camera feeds so you see what triggered it, not just that something triggered.",
      "icon": "AlertTriangle"
    }
  ]'::jsonb,
  '[
    {"label": "Appliance configured", "detail": "Hardware set up, cameras connecting via web portal. Chad has remote access."},
    {"label": "6 cameras licensed → expanding to 22", "detail": "Started with 6 test cameras. Full licenses deploying before spring break."},
    {"label": "Vape sensors integrated", "detail": "Halo sensors paired with cameras — vape, temp, humidity, noise alerts live."},
    {"label": "AI search demoed", "detail": "Natural language video search, face recognition, license plate detection shown."},
    {"label": "Firearm test scheduled", "detail": "April 10th — live test when building is empty of students."},
    {"label": "Mobile app alerts", "detail": "Critical alerts bypass do-not-disturb. Alec sending download links."}
  ]'::jsonb,
  '[
    {"label": "Discovery & Trial Setup", "date": "Mar 25", "status": "completed", "detail": "Done. Appliance configured, cameras connected, AI features demoed."},
    {"label": "Full Camera Deployment", "date": "Before Spring Break", "status": "upcoming", "detail": "Chad adds remaining cameras with expanded licenses. 6 → 22."},
    {"label": "Firearm Detection Test", "date": "Apr 10", "status": "pending", "detail": "Live test — building empty of students. Dennis + Chad confirmed."},
    {"label": "Platform Review", "date": "Late Apr", "status": "pending", "detail": "Full team reviews trial results, sensor data, and detection accuracy."},
    {"label": "District Presentation", "date": "May", "status": "pending", "detail": "Board-ready materials — ROI, trial results, peer references, implementation plan."},
    {"label": "Full Deployment Decision", "date": "May 31", "status": "pending", "detail": "Go/no-go on full Video Security, EMS, and Access Control platform."}
  ]'::jsonb,
  '[
    {"title": "Platform Overview", "type": "PDF", "icon": "FileText", "description": "Video, access control, emergency response, AI — how it works together.", "category": "evaluate"},
    {"title": "Firearm Detection — How It Works", "type": "Video", "icon": "Play", "description": "3 min. Detection → lockdown → dispatch. What Apr 10 will look like.", "category": "evaluate"},
    {"title": "Halo Sensor Integration Guide", "type": "PDF", "icon": "Wifi", "description": "Vape detection, environmental monitoring, alert configuration.", "category": "evaluate"},
    {"title": "AI Video Search Demo", "type": "Video", "icon": "Search", "description": "Natural language search, face recognition, license plate detection in action.", "category": "evaluate"},
    {"title": "ROI Model — Novi ROAR Center", "type": "Interactive", "icon": "BarChart3", "description": "Custom financial model for 22 cameras + sensors + full platform.", "category": "fund"},
    {"title": "Sourcewell Procurement Path", "type": "PDF", "icon": "Briefcase", "description": "Skip the RFP. How cooperative purchasing works.", "category": "fund"},
    {"title": "Board Presentation Template", "type": "PPTX", "icon": "BookOpen", "description": "Editable deck — trial results, ROI, and implementation timeline.", "category": "pitch"},
    {"title": "FERPA & Compliance", "type": "PDF", "icon": "Shield", "description": "SOC 2, data residency, encryption, student privacy.", "category": "evaluate"}
  ]'::jsonb,
  '[
    {
      "name": "Evergreen Union School District",
      "location": "Northern California",
      "profile": "3 campuses · ~1,300 students · Rural",
      "replaced": "Milestone + Axis cameras",
      "quote": "Coram is just so much easier. The demos seemed a little ''too good to be true'', but we''re very happy with the system.",
      "quote_person": "Dan Bennett, IT Director",
      "result": "Firearm detection endorsed by local sheriff. Video retrieval: 90+ min → seconds.",
      "url": "https://www.coram.ai/post/why-a-rural-school-district-trusted-coram-over-milestone",
      "why": "K-12, small IT team, firearm detection deployment"
    },
    {
      "name": "Soar Autism Center",
      "location": "Multi-site",
      "profile": "Multiple clinics · Staff safety focus",
      "replaced": "Fragmented systems",
      "quote": null,
      "result": "Unified safety monitoring across all locations. HIPAA-compliant deployment.",
      "url": "https://www.coram.ai/post/how-soar-autism-center-scaled-quality-care-with-coram",
      "why": "Multi-site, environmental monitoring, compliance"
    },
    {
      "name": "Point Defiance Zoo & Aquarium",
      "location": "Tacoma, WA",
      "profile": "Large campus · Thousands of daily visitors",
      "replaced": "Legacy surveillance",
      "quote": null,
      "result": "AI video search transformed guest safety and lost-person response.",
      "url": "https://www.coram.ai/post/point-defiance-zoo-enhanced-guest-safety-with-corams-video-search",
      "why": "Large campus, AI search critical for operations"
    }
  ]'::jsonb,
  '[
    {
      "name": "COPS SVPP",
      "full_name": "School Violence Prevention Program",
      "agency": "U.S. Department of Justice",
      "amount": "Up to $500K per award",
      "match": "25% local match (waived for microgrants <$100K)",
      "timeline": "Applications typically Apr–Jun. 36-month awards.",
      "fit": "Coram''s unified platform — detection, lockdown, notification, investigation — is exactly what SVPP funds. Unified solutions score higher than point products.",
      "status": "active",
      "status_label": "$73M available FY2026",
      "org": "Novi Community Schools"
    },
    {
      "name": "STOP School Violence",
      "full_name": "Student, Teachers & Officers Preventing School Violence",
      "agency": "Bureau of Justice Assistance",
      "amount": "Varies by cycle",
      "match": "Varies",
      "timeline": "Annual cycle — check BJA.gov",
      "fit": "Funds threat assessment and safety infrastructure. Good complement to SVPP for broader safety initiatives.",
      "status": "check",
      "status_label": "Check current cycle",
      "org": "Novi Community Schools"
    },
    {
      "name": "Sourcewell",
      "full_name": "Cooperative Purchasing Contract",
      "agency": "Procurement vehicle",
      "amount": "Not a grant — eliminates RFP",
      "match": "N/A",
      "timeline": "Available now",
      "fit": "Coram is on contract. Novi can procure without a standalone RFP — saves months on your timeline to full deployment.",
      "status": "ready",
      "status_label": "Ready now",
      "org": "Novi Community Schools"
    }
  ]'::jsonb,
  '{
    "cameras": 600,
    "term": "5 years",
    "total_five_year": "$406,208.80",
    "total_annual": "$55,080",
    "hardware_total": "$130,808.80",
    "access_code": "novi2026",
    "num_cameras": 600,
    "savings_note": "50% discount applied across all line items — replaces separate VMS, vape detection, and emergency systems",
    "procurement_note": "Available through Sourcewell cooperative purchasing — no standalone RFP required",
    "components": [
      {
        "name": "Video Feed Licenses — 5 Year",
        "detail": "600 cameras · AI search, journey tracking, analytics",
        "sku": "VF-B-60",
        "qty": 600,
        "list_price": "$918",
        "discount": "50%",
        "total_five_year": "$275,400",
        "total_annual": "$55,080"
      },
      {
        "name": "Coram Point 80ch w/ 60-Day Storage",
        "detail": "8 appliances · on-prem recording + cloud sync",
        "sku": "CP-Y-1-60D",
        "qty": 8,
        "list_price": "$32,452",
        "discount": "50%",
        "total_five_year": "$129,808.80",
        "one_time": true
      },
      {
        "name": "Shipping & Handling",
        "detail": "Hardware delivery",
        "qty": 1,
        "list_price": "$1,000",
        "total_five_year": "$1,000",
        "one_time": true
      }
    ]
  }'::jsonb,
  'novi2026',
  'active'
);
```

## Inserting Your Own Data

Use the SQL template above as a guide. Key points:

1. **slug** must be unique and URL-friendly (lowercase, hyphens)
2. **JSONB fields** need valid JSON (test in JSON validator first)
3. **access_code** can be any string (users enter it to unlock pricing)
4. **status** must be 'active', 'draft', or 'archived'

### From Fireflies & HubSpot

To automate data import from your sources:

1. **Fireflies**: Export transcript as JSON
2. **HubSpot**: Export deal and quote data as JSON
3. **Map the data** to our schema using a script or manual import

### Using Supabase Dashboard

1. Go to **SQL Editor** → New Query
2. Run the CREATE TABLE query
3. Run the INSERT query for sample data
4. Check the **data_editor** to verify

### Using API (Node.js)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from('digital_sales_rooms')
  .insert([
    {
      slug: 'my-dsr',
      prospect_name: 'Prospect Inc',
      // ... other fields
    }
  ]);
```

## Data Type Guide

| Field | Type | Example |
|-------|------|---------|
| slug | TEXT | "novi-dsr" |
| prospect_name | TEXT | "Novi Community School District" |
| meeting_date | TEXT | "March 25, 2026" |
| attendees | JSONB | `[{"name": "...", "role": "..."}]` |
| outcomes | JSONB | `[{"title": "...", "description": "...", "icon": "Video"}]` |
| milestones | JSONB | `[{"label": "...", "date": "...", "status": "..."}]` |
| resources | JSONB | `[{"title": "...", "type": "PDF", "icon": "FileText"}]` |
| references_data | JSONB | `[{"name": "...", "location": "...", "quote": "..."}]` |
| grants | JSONB | `[{"name": "...", "amount": "...", "status": "active"}]` |
| pricing | JSONB | `{"total_five_year": "$...", "components": [...], "access_code": "..."}` |
| access_code | TEXT | "novi2026" |
| status | TEXT | "active" \| "draft" \| "archived" |

## Icon Names

Lucide icon names (used in JSONB):
- `Video`, `Search`, `Shield`, `AlertTriangle`
- `FileText`, `Play`, `Wifi`, `BarChart3`, `Briefcase`, `BookOpen`
- `MapPin`, `KeyRound`, `Mail`, `Phone`, `Calendar`, `Users`, etc.

## Testing

After inserting data:

1. Start the app: `npm run dev`
2. Navigate to: `http://localhost:3000/novi-dsr`
3. Check that data loads from Supabase
4. Enter pricing access code: `novi2026`

## Backup & Export

To backup your data:

```sql
-- Export as JSON
SELECT json_agg(to_jsonb(t))
FROM digital_sales_rooms t;
```

To restore from backup:

```sql
-- Truncate and re-insert
TRUNCATE TABLE digital_sales_rooms;

INSERT INTO digital_sales_rooms (...) VALUES (...);
```

## Next Steps

1. Create the `digital_sales_rooms` table using the SQL above
2. Insert sample or real DSR data
3. Start the app and test
4. Customize colors, layout, or components as needed
5. Deploy to Vercel or your hosting platform
