import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// ─── Config ──────────────────────────────────────────────────────────────────
const API_SECRET = process.env.DSR_API_SECRET;

// ─── Slug builder ────────────────────────────────────────────────────────────

function buildSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

// ─── POST handler ────────────────────────────────────────────────────────────
//
// Accepts TWO modes:
//
// MODE 1 — "full" (from Cowork/Claude or manual):
//   POST with full DSR data object. Writes directly to Supabase.
//   Body: { mode: "full", dsr: { slug, prospect_name, pricing, ... } }
//
// MODE 2 — "webhook" (from HubSpot workflow):
//   HubSpot sends deal properties in the payload. API transforms
//   and creates a basic DSR shell (no transcript data).
//   Body: { mode: "webhook", deal: { id, name, amount, stage, closedate, contact_name, contact_title, contact_email } }
//

export async function POST(request) {
  try {
    const body = await request.json();

    // Auth check (skip for HubSpot webhooks if no secret set)
    const authHeader = request.headers.get("authorization");
    if (API_SECRET && body.mode !== "webhook" && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    // ─── MODE 1: Full DSR data (from Cowork/Claude MCP) ─────────────────────
    if (body.mode === "full") {
      const dsr = body.dsr;
      if (!dsr || !dsr.slug || !dsr.prospect_name) {
        return NextResponse.json(
          { error: "dsr.slug and dsr.prospect_name are required" },
          { status: 400 }
        );
      }

      // Generate access code if not provided
      if (!dsr.access_code) {
        dsr.access_code = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
      if (!dsr.status) dsr.status = "active";

      const { data, error } = await supabaseAdmin
        .from("digital_sales_rooms")
        .upsert(dsr, { onConflict: "slug" })
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json(
          { error: "Failed to save DSR", detail: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        slug: data.slug,
        url: `https://coram-dsr.vercel.app/${data.slug}`,
        access_code: data.access_code,
      });
    }

    // ─── MODE 2: HubSpot webhook ────────────────────────────────────────────
    if (body.mode === "webhook") {
      // HubSpot workflow sends deal properties
      const deal = body.deal || body;
      const dealName = deal.dealname || deal.name || "Prospect";
      const orgName = dealName.split(" - ")[0].trim();
      const slug = buildSlug(orgName);

      // Build basic DSR shell from webhook data
      const dsrData = {
        slug,
        hubspot_deal_id: deal.hs_object_id || deal.id || null,
        prospect_name: orgName,
        prospect_contact: deal.contact_name || null,
        prospect_title: deal.contact_title || null,
        deal_amount: parseFloat(deal.amount) || 0,
        deal_stage: deal.dealstage || deal.stage || null,
        close_date: deal.closedate || null,
        meeting_title: dealName,
        // Defaults — enriched later via "full" mode from Cowork
        outcomes: [],
        call_highlights: [],
        milestones: [
          {
            label: "Discovery & Demo",
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            }),
            detail: "Initial platform demo and requirements gathering.",
            status: "completed",
          },
          {
            label: "Evaluation & Trial",
            date: "TBD",
            detail: "Hands-on evaluation with your team.",
            status: "upcoming",
          },
          {
            label: "Deployment Decision",
            date: deal.closedate
              ? new Date(deal.closedate).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })
              : "TBD",
            detail: "Go/no-go on full deployment.",
            status: "pending",
          },
        ],
        pricing: {},
        grants: [
          {
            name: "COPS SVPP",
            full_name: "COPS School Violence Prevention Program",
            agency: "U.S. Department of Justice",
            amount: "Up to $500K per award",
            match: "25% local match (waived for microgrants <$100K)",
            timeline: "Annual cycle",
            status: "active",
            status_label: "Open",
            detail: "Covers cameras, AI detection, access control, and emergency notification.",
          },
          {
            name: "Sourcewell",
            full_name: "Sourcewell Cooperative Purchasing",
            agency: "No grant — procurement vehicle",
            amount: "No grant",
            match: "N/A",
            timeline: "Always available",
            status: "ready",
            status_label: "Ready",
            detail: "Coram is an approved Sourcewell vendor. Skip the standalone RFP.",
          },
        ],
        references_data: [
          {
            name: "Evergreen School District",
            location: "WA",
            profile: "K-12 · 15,000 students",
            replaced: "multiple legacy vendors",
            result: "Consolidated 6 vendors to one platform.",
            why: "Similar district size",
          },
        ],
        resources: [
          {
            title: "Platform Overview",
            description: "Full walkthrough of VMS, AI analytics, access control, and emergency management.",
            type: "Document",
            category: "Evaluate",
            icon: "FileText",
            url: "#",
          },
          {
            title: "ROI Calculator",
            description: "Calculate total cost of ownership vs. multi-vendor approach.",
            type: "Interactive",
            category: "Evaluate",
            icon: "BarChart3",
            url: "#",
          },
          {
            title: "Board Presentation Template",
            description: "Customizable deck for presenting to school board or leadership.",
            type: "Document",
            category: "Pitch Internally",
            icon: "Briefcase",
            url: "#",
          },
        ],
        coram_team: [],
        attendees: [],
        environment: {},
        access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: "active",
      };

      const { data, error } = await supabaseAdmin
        .from("digital_sales_rooms")
        .upsert(dsrData, { onConflict: "slug" })
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json(
          { error: "Failed to save DSR", detail: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        slug: data.slug,
        url: `https://coram-dsr.vercel.app/${data.slug}`,
        access_code: data.access_code,
        note: "Basic DSR created from webhook. Enrich with transcript data via full mode.",
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use "full" or "webhook".' },
      { status: 400 }
    );
  } catch (err) {
    console.error("Create DSR error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET handler (health check) ─────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    status: "ok",
    configured: {
      supabase: !!supabaseAdmin,
    },
  });
}
