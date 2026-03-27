# Coram DSR — Quick Setup Guide

This is a complete Next.js app ready to run. No additional setup needed beyond installing dependencies.

## Files Created

```
coram-dsr/
├── app/
│   ├── layout.jsx                # Root layout with metadata
│   ├── page.jsx                  # Home/landing page
│   ├── globals.css               # Global Tailwind styles
│   └── [slug]/
│       └── page.jsx              # Dynamic DSR component (1000+ lines)
│
├── lib/
│   └── supabase.js               # Supabase client initialization
│
├── Configuration files:
│   ├── package.json              # Dependencies (Next.js, React, Supabase, Tailwind, Lucide)
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # PostCSS config (Tailwind integration)
│
├── Environment:
│   └── .env.local                # Supabase credentials (pre-filled)
│
├── Documentation:
│   ├── README.md                 # Full documentation
│   └── SETUP.md                  # This file
│
└── Git:
    └── .gitignore                # Ignore node_modules, build artifacts, etc.
```

## Quick Start

### 1. Install Dependencies

```bash
cd coram-dsr
npm install
```

This will install:
- `next@16.2.1` — App Router, modern framework
- `react@19.2.4` — Latest React
- `react-dom@19.2.4` — React DOM
- `lucide-react@1.7.0` — 400+ icon components
- `@supabase/supabase-js@^2.48.0` — Supabase client library
- `tailwindcss@4.2.2` — Utility CSS framework
- `@tailwindcss/postcss@^4.2.2` — Tailwind plugin
- `postcss` & `autoprefixer` — CSS processing

### 2. Start Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

### 3. View a Digital Sales Room

Navigate to:
```
http://localhost:3000/[slug]
```

Example:
```
http://localhost:3000/novi-dsr
```

(The app will fetch data from Supabase based on the slug)

## Key Features

### Dynamic Data Loading
- Reads from Supabase `digital_sales_rooms` table
- Fetches by slug from URL parameter
- Shows loading spinner, 404 on missing data

### Pre-Configured Supabase
- URL: `https://bmxsvfyxssvkcfalksei.supabase.co`
- Anon key: Already set in `.env.local`
- Database table: `digital_sales_rooms`

### Exact Design Copy
- Based on the existing Novi DSR design
- All components recreated as React components:
  - `MilestoneTimeline()` — Status-tracked milestones
  - `ResourceCard()` — Filterable resource cards
  - `ReferenceCard()` — Customer references
  - `GrantCard()` — Funding opportunities
  - `GatedPricing()` — Access-code-protected pricing
  - `TeamCard()` — Team contact cards
- Dark theme with emerald accents
- Responsive mobile-friendly layout
- Smooth scroll navigation

### Gated Pricing
- Pricing locked behind access code input
- Users unlock with code from Supabase
- Shows pricing table with line items, totals, and breakdowns

## Database Requirements

To use the app, you need a `digital_sales_rooms` table in Supabase with at least these columns:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `slug` | TEXT (UNIQUE) | URL slug |
| `prospect_name` | TEXT | Org name |
| `prospect_contact` | TEXT | Contact name |
| `prospect_title` | TEXT | Job title |
| `meeting_date` | TEXT | Call date |
| `meeting_title` | TEXT | Meeting topic |
| `meeting_duration` | TEXT | Duration |
| `attendees` | JSONB | Meeting attendees array |
| `coram_team` | JSONB | Coram team array |
| `environment` | JSONB | Environment details |
| `outcomes` | JSONB | Outcomes array |
| `call_highlights` | JSONB | Call highlights array |
| `milestones` | JSONB | Milestones array |
| `resources` | JSONB | Resources array |
| `references_data` | JSONB | References array |
| `grants` | JSONB | Grants array |
| `pricing` | JSONB | Pricing object with `access_code` |
| `access_code` | TEXT | Pricing unlock code |
| `status` | TEXT | 'active', 'draft', 'archived' |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Update time |

See README.md for complete data structure examples.

## Build & Deploy

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Deploy

### Deploy to Other Platforms

This is a standard Next.js app that works on:
- Railway
- Netlify
- AWS Amplify
- Google Cloud Run
- Any Node.js host

## File Breakdown

### `app/[slug]/page.jsx` (Main Component)
- **Size**: ~1,100 lines
- **Purpose**: Dynamic DSR page that fetches from Supabase
- **Key Functions**:
  - `useEffect()` — Fetches data by slug from Supabase
  - Component state — activeSection, resourceFilter, dsr, loading, error
  - Renders all sections with dynamic data
  - Smooth scroll navigation

### `app/page.jsx` (Home)
- Simple landing page with instructions
- Links to example DSR

### `app/layout.jsx` (Root Layout)
- Sets up metadata
- Imports global styles

### `app/globals.css` (Styles)
- Tailwind imports
- Base element styles

### `lib/supabase.js` (Database Client)
- Initializes Supabase client
- Exports for use in components

### Config Files
- `next.config.js` — Next.js settings
- `tailwind.config.js` — Tailwind theme
- `postcss.config.js` — CSS processing
- `package.json` — Dependencies and scripts

## Environment Variables

`.env.local` is pre-configured with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bmxsvfyxssvkcfalksei.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are **safe to share** because they're anon keys (read-only, limited access). They're prefixed with `NEXT_PUBLIC_` so they're included in the client bundle.

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter (if configured)
```

## Troubleshooting

**App won't start?**
- Clear `node_modules` and `.next` folder
- Run `npm install` again
- Check Node.js version (18+)

**DSR not loading?**
- Check browser console for errors
- Verify slug exists in Supabase
- Check network tab for failed requests

**Styling looks wrong?**
- Run `npm run build` to rebuild Tailwind CSS
- Clear browser cache
- Check that `globals.css` is imported

**Supabase connection error?**
- Verify `.env.local` has correct values
- Check Supabase dashboard for database status
- Ensure Row Level Security (RLS) allows anonymous reads

## Next Steps

1. Create a DSR record in Supabase with your prospect data
2. Navigate to `/[slug]` to view it
3. Customize data, colors, or components as needed
4. Deploy to Vercel or your hosting platform

## Documentation

See **README.md** for:
- Complete data structure examples
- Database schema reference
- Component API details
- Deployment instructions
- Customization guide
