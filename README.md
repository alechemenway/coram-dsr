# Coram Digital Sales Room (DSR)

A dynamic Next.js application for generating personalized Digital Sales Rooms powered by Supabase. This replaces the static Novi DSR with a flexible, database-driven system.

## Overview

The app reads prospect data from Supabase and renders a beautiful, interactive Digital Sales Room tailored to each prospect. Each room includes:

- **Overview**: What changes for the prospect's team
- **Next Steps**: Milestone timeline with status tracking
- **Resources**: Filterable evaluation, funding, and pitch materials
- **Proof**: Customer references and case studies
- **Funding**: Grant and cooperative purchasing options
- **Investment**: Gated pricing tables
- **Your Team**: Contact information for Coram and prospect teams

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **UI**: React 19.2.4 with Tailwind CSS 4.2.2
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React 1.7.0

## Project Structure

```
coram-dsr/
├── app/
│   ├── layout.jsx           # Root layout
│   ├── page.jsx             # Home/landing page
│   ├── globals.css          # Global styles
│   └── [slug]/
│       └── page.jsx         # Dynamic DSR page (main component)
├── lib/
│   └── supabase.js          # Supabase client initialization
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── next.config.js           # Next.js configuration
├── .env.local               # Environment variables (local)
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd coram-dsr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are pre-configured in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://bmxsvfyxssvkcfalksei.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Usage

### Viewing a Digital Sales Room

Navigate to any DSR by slug:
```
http://localhost:3000/novi-dsr
http://localhost:3000/example-prospect
```

The app will fetch data from Supabase based on the slug in the URL.

### Home Page

The home page (`/`) displays basic instructions and links to view DSRs.

## Database Schema

The app reads from the `digital_sales_rooms` table in Supabase with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | TEXT (UNIQUE) | URL slug for the DSR |
| `prospect_name` | TEXT | Prospect organization name |
| `prospect_contact` | TEXT | Primary contact name |
| `prospect_title` | TEXT | Contact's job title |
| `meeting_date` | TEXT | Date of the discovery call |
| `meeting_title` | TEXT | Meeting topic/title |
| `meeting_duration` | TEXT | Duration (e.g., "41 min") |
| `attendees` | JSONB | Array of meeting attendees |
| `coram_team` | JSONB | Array of Coram team members |
| `environment` | JSONB | Prospect environment details |
| `deal_amount` | NUMERIC | Deal value |
| `deal_stage` | TEXT | HubSpot deal stage |
| `close_date` | DATE | Estimated close date |
| `outcomes` | JSONB | Array of prospect outcomes |
| `call_highlights` | JSONB | Key call discussion points |
| `milestones` | JSONB | Timeline milestones |
| `resources` | JSONB | Resource cards (PDFs, videos, etc.) |
| `references_data` | JSONB | Customer references |
| `grants` | JSONB | Funding/grant information |
| `pricing` | JSONB | Pricing table with access code |
| `access_code` | TEXT | Code to unlock pricing section |
| `status` | TEXT | 'active', 'draft', or 'archived' |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

### JSONB Data Structures

#### `attendees` (Array)
```json
[
  {
    "name": "Dennis Huisman",
    "role": "Director of Emergency & Safety",
    "org": "Novi Community Schools"
  }
]
```

#### `coram_team` (Array)
```json
[
  {
    "name": "Alec Hemenway",
    "role": "Account Executive",
    "email": "alec.hemenway@coram.ai",
    "phone": "(555) 234-5678"
  }
]
```

#### `outcomes` (Array)
```json
[
  {
    "title": "One platform for all systems",
    "description": "...",
    "icon": "Video"
  }
]
```

#### `milestones` (Array)
```json
[
  {
    "label": "Discovery & Trial Setup",
    "date": "Mar 25",
    "status": "completed",
    "detail": "..."
  }
]
```

#### `resources` (Array)
```json
[
  {
    "title": "Platform Overview",
    "type": "PDF",
    "icon": "FileText",
    "description": "...",
    "category": "evaluate"
  }
]
```

#### `references_data` (Array)
```json
[
  {
    "name": "Example School District",
    "location": "California",
    "profile": "3 campuses · 1,300 students",
    "replaced": "Milestone cameras",
    "quote": "...",
    "quotePerson": "Dan Bennett, IT Director",
    "result": "...",
    "url": "https://example.com/case-study",
    "why": "K-12, small IT team"
  }
]
```

#### `grants` (Array)
```json
[
  {
    "name": "COPS SVPP",
    "full_name": "School Violence Prevention Program",
    "agency": "U.S. Department of Justice",
    "amount": "Up to $500K per award",
    "match": "25% local match",
    "timeline": "Applications Apr–Jun",
    "fit": "Unified platform...",
    "status": "active",
    "status_label": "$73M available FY2026",
    "org": "Novi Community Schools"
  }
]
```

#### `pricing` (Object)
```json
{
  "num_cameras": 600,
  "term": "5 years",
  "total_five_year": "$406,208.80",
  "total_annual": "$55,080",
  "hardware_total": "$130,808.80",
  "access_code": "novi2026",
  "savings_note": "50% discount applied...",
  "procurement_note": "Available through Sourcewell...",
  "components": [
    {
      "name": "Video Feed Licenses — 5 Year",
      "detail": "600 cameras · AI search...",
      "qty": 600,
      "list_price": "$918",
      "discount": "50%",
      "total_five_year": "$275,400"
    }
  ]
}
```

## Features

### Dynamic Data Loading
- Fetches DSR data from Supabase using slug parameter
- Shows loading state while fetching
- Displays 404 page if slug not found

### Responsive Design
- Dark theme with emerald accents
- Mobile-friendly layout
- Smooth scrolling navigation

### Gated Pricing
- Pricing section locked behind access code
- Users enter code to view detailed pricing
- Displays line items, annual/5-year totals, and financing breakdown

### Resource Filtering
- Tabs to filter resources by category (All, Evaluate, Fund It, Pitch Internally)
- Dynamic category filtering

### Smooth Navigation
- Sticky header with navigation buttons
- Smooth scroll-to-section functionality
- Active section highlighting

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Code Style

The app uses:
- ES6+ JavaScript
- React hooks (useState, useEffect)
- Tailwind CSS for styling
- Lucide React icons

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel
```

### Other Platforms

The app is a standard Next.js application and can be deployed to any Node.js hosting platform (Railway, Heroku, etc.).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

**Note**: These variables are public (prefixed with `NEXT_PUBLIC_`) and are safe to include in client-side code.

## Creating a New DSR

1. Add a row to the `digital_sales_rooms` table in Supabase
2. Fill in all required fields (at minimum: `slug`, `prospect_name`)
3. Add JSONB data for outcomes, milestones, resources, etc.
4. Navigate to `/{slug}` to view the DSR

## Customization

### Changing Colors

Edit the Tailwind color palette in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      emerald: {
        // Custom emerald shades
      }
    }
  }
}
```

### Adding Sections

Add new sections in `app/[slug]/page.jsx`:
1. Add new data field to the component
2. Create a new `<section>` with unique `id`
3. Add navigation item to `navItems` array

### Modifying Components

All major UI components are defined in `app/[slug]/page.jsx`:
- `MilestoneTimeline()`
- `ResourceCard()`
- `ReferenceCard()`
- `GrantCard()`
- `GatedPricing()`
- `TeamCard()`

## Troubleshooting

### DSR Not Loading

1. Check browser console for errors
2. Verify slug matches a record in Supabase
3. Check that environment variables are set
4. Verify Supabase database has the correct data

### Styling Issues

1. Ensure Tailwind CSS is built: `npm run build`
2. Check that `globals.css` is imported in `layout.jsx`
3. Clear browser cache and rebuild

### Supabase Connection Issues

1. Verify Supabase URL and key are correct in `.env.local`
2. Check Supabase database status at https://supabase.com
3. Ensure table and columns exist in database
4. Check Row Level Security (RLS) policies allow anonymous reads

## Support

For issues or questions, contact the Coram engineering team.

## License

Proprietary - Coram AI
