import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// ─── Config ──────────────────────────────────────────────────────────────────
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const FIREFLIES_KEY = process.env.FIREFLIES_API_KEY;
const API_SECRET = process.env.DSR_API_SECRET; // protects this endpoint

// ─── HubSpot helpers ─────────────────────────────────────────────────────────

async function hubspotGet(path) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HubSpot ${path}: ${res.status}`);
  return res.json();
}

async function getDeal(dealId) {
  const props = [
    "dealname", "dealstage", "amount", "closedate", "pipeline",
    "hubspot_owner_id", "description",
  ].join(",");
  return hubspotGet(`/crm/v3/objects/deals/${dealId}?properties=${props}`);
}

async function getDealContacts(dealId) {
  const data = await hubspotGet(
    `/crm/v3/objects/deals/${dealId}/associations/contacts`
  );
  if (!data.results?.length) return [];
  const ids = data.results.map((r) => r.id);
  const props = ["firstname", "lastname", "email", "jobtitle", "phone", "company"].join(",");
  const contacts = await Promise.all(
    ids.map((id) => hubspotGet(`/crm/v3/objects/contacts/${id}?properties=${props}`))
  );
  return contacts.map((c) => c.properties);
}

async function getDealQuotes(dealId) {
  const data = await hubspotGet(
    `/crm/v3/objects/deals/${dealId}/associations/quotes`
  );
  if (!data.results?.length) return [];
  const ids = data.results.map((r) => r.id);
  const props = [
    "hs_title", "hs_status", "hs_expiration_date",
    "hs_quote_amount", "hs_quote_number",
  ].join(",");
  const quotes = await Promise.all(
    ids.map((id) => hubspotGet(`/crm/v3/objects/quotes/${id}?properties=${props}`))
  );
  return quotes.map((q) => ({ id: q.id, ...q.properties }));
}

async function getQuoteLineItems(quoteId) {
  const data = await hubspotGet(
    `/crm/v3/objects/quotes/${quoteId}/associations/line_items`
  );
  if (!data.results?.length) return [];
  const ids = data.results.map((r) => r.id);
  const props = [
    "name", "quantity", "price", "amount", "discount",
    "hs_sku", "description", "hs_discount_percentage",
  ].join(",");
  const items = await Promise.all(
    ids.map((id) => hubspotGet(`/crm/v3/objects/line_items/${id}?properties=${props}`))
  );
  return items.map((li) => li.properties);
}

async function getOwner(ownerId) {
  if (!ownerId) return null;
  try {
    return await hubspotGet(`/crm/v3/owners/${ownerId}`);
  } catch {
    return null;
  }
}

// ─── Fireflies helpers ───────────────────────────────────────────────────────

async function searchFirefliesTranscript(attendeeEmails, dealName) {
  // Try matching by participant email first
  const query = `
    query Transcripts($participantEmail: [String!]) {
      transcripts(participant_email: $participantEmail, limit: 5) {
        id title date duration
        organizer_email
        summary { short_summary keywords action_items }
        participants
      }
    }
  `;

  // Use the prospect's email (non-coram) to find the call
  const prospectEmails = attendeeEmails.filter(
    (e) => e && !e.endsWith("@coram.ai")
  );

  if (prospectEmails.length) {
    const res = await fetch("https://api.fireflies.ai/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIREFLIES_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { participantEmail: prospectEmails },
      }),
    });
    const data = await res.json();
    const transcripts = data?.data?.transcripts || [];
    if (transcripts.length) {
      // Return most recent transcript
      return transcripts[0];
    }
  }

  return null;
}

// ─── Quote selection ─────────────────────────────────────────────────────────

function pickBestQuote(quotes) {
  const now = new Date();
  // Prefer unexpired quotes with highest amount
  const valid = quotes
    .filter((q) => {
      if (!q.hs_expiration_date) return true;
      return new Date(q.hs_expiration_date) > now;
    })
    .sort((a, b) => (parseFloat(b.hs_quote_amount) || 0) - (parseFloat(a.hs_quote_amount) || 0));
  return valid[0] || quotes[0] || null;
}

// ─── Transform to DSR schema ────────────────────────────────────────────────

function buildSlug(dealName) {
  return dealName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

function buildDSRData({
  deal,
  contacts,
  quote,
  lineItems,
  owner,
  transcript,
  isDealReg = false,
}) {
  const dealProps = deal.properties;
  const prospectContact = contacts[0] || {};
  const dealName = dealProps.dealname || "Prospect";
  const orgName = dealName.split(" - ")[0].trim();

  // Build pricing from quote + line items
  const pricing = {};
  if (quote && lineItems.length) {
    const discountPct = isDealReg ? 40 : null;
    pricing.quoteId = quote.id;
    pricing.quoteNumber = quote.hs_quote_number;
    pricing.quoteExpires = quote.hs_expiration_date;
    pricing.quoteTotal = `$${parseFloat(quote.hs_quote_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    pricing.components = lineItems.map((li) => ({
      name: li.name,
      description: li.description || "",
      sku: li.hs_sku || "",
      qty: parseInt(li.quantity) || 1,
      listPrice: `$${parseFloat(li.price).toLocaleString("en-US")}`,
      discount: li.hs_discount_percentage
        ? `${li.hs_discount_percentage}%`
        : discountPct
        ? `${discountPct}%`
        : null,
      total: `$${parseFloat(li.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    }));

    // Split software (recurring) vs hardware (one-time)
    const software = lineItems.filter((li) =>
      (li.name || "").toLowerCase().includes("license") ||
      (li.name || "").toLowerCase().includes("feed")
    );
    const hardware = lineItems.filter(
      (li) =>
        !(li.name || "").toLowerCase().includes("license") &&
        !(li.name || "").toLowerCase().includes("feed")
    );

    if (software.length) {
      const softwareTotal = software.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
      pricing.softwareTotal = `$${softwareTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    }
    if (hardware.length) {
      const hardwareTotal = hardware.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
      pricing.hardwareTotal = `$${hardwareTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    }
  }

  // Build meeting data from transcript
  const meeting = {};
  if (transcript) {
    meeting.title = transcript.title || dealName;
    meeting.date = transcript.date
      ? new Date(transcript.date * 1000).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })
      : null;
    meeting.duration = transcript.duration
      ? `${Math.round(transcript.duration)} min`
      : null;
  }

  // Build Coram team from owner
  const coramTeam = [];
  if (owner) {
    coramTeam.push({
      name: `${owner.firstName || ""} ${owner.lastName || ""}`.trim(),
      role: "Account Executive",
      email: owner.email,
    });
  }

  // Build attendees from contacts
  const attendees = contacts.map((c) => ({
    name: `${c.firstname || ""} ${c.lastname || ""}`.trim(),
    title: c.jobtitle || "",
    email: c.email || "",
  }));

  // Build call highlights from transcript summary
  const callHighlights = [];
  if (transcript?.summary?.keywords) {
    transcript.summary.keywords.forEach((kw) => {
      callHighlights.push(kw);
    });
  }

  // Build outcomes from transcript summary
  const outcomes = [];
  if (transcript?.summary?.short_summary) {
    // Parse key themes from the summary
    const summary = transcript.summary.short_summary;
    const sentences = summary.split(". ").filter((s) => s.length > 20);
    sentences.slice(0, 4).forEach((s, i) => {
      const icons = ["Video", "Search", "Shield", "AlertTriangle"];
      outcomes.push({
        headline: s.length > 80 ? s.substring(0, 77) + "..." : s,
        detail: s,
        icon: icons[i % icons.length],
        color: i % 2 === 0 ? "emerald" : "purple",
      });
    });
  }

  // Build milestones (basic timeline)
  const milestones = [
    {
      label: "Discovery & Trial Setup",
      date: meeting.date || "TBD",
      detail: "Appliance configured, cameras connected, AI features demoed.",
      status: "completed",
    },
    {
      label: "Platform Review",
      date: "TBD",
      detail: "Full team reviews trial results, sensor data, and detection accuracy.",
      status: "upcoming",
    },
    {
      label: "Deployment Decision",
      date: dealProps.closedate
        ? new Date(dealProps.closedate).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })
        : "TBD",
      detail: "Go/no-go on full deployment.",
      status: "pending",
    },
  ];

  // Build action items from transcript
  const actionItems = [];
  if (transcript?.summary?.action_items) {
    const items = transcript.summary.action_items
      .split("\n")
      .filter((line) => line.trim().length > 0);
    items.forEach((item) => {
      actionItems.push(item.trim());
    });
  }

  // Default resources
  const resources = [
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
  ];

  // Default references (K-12 focused)
  const referencesData = [
    {
      name: "Evergreen School District",
      location: "WA",
      profile: "K-12 · 15,000 students",
      replaced: "multiple legacy vendors",
      result: "Consolidated 6 vendors to one platform.",
      why: "Similar district size",
    },
  ];

  // Default grants (K-12)
  const grants = [
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
  ];

  return {
    slug: buildSlug(orgName),
    hubspot_deal_id: deal.id,
    hubspot_quote_id: quote?.id || null,
    fireflies_transcript_id: transcript?.id || null,
    prospect_name: orgName,
    prospect_contact: `${prospectContact.firstname || ""} ${prospectContact.lastname || ""}`.trim() || null,
    prospect_title: prospectContact.jobtitle || null,
    meeting_date: meeting.date || null,
    meeting_title: meeting.title || dealName,
    meeting_duration: meeting.duration || null,
    attendees,
    coram_team: coramTeam,
    deal_amount: parseFloat(dealProps.amount) || parseFloat(quote?.hs_quote_amount) || 0,
    deal_stage: dealProps.dealstage || null,
    close_date: dealProps.closedate || null,
    outcomes,
    call_highlights: callHighlights,
    milestones,
    pricing,
    grants,
    references_data: referencesData,
    resources,
    environment: {},
    access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    status: "active",
  };
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    if (API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { hubspot_deal_id, is_deal_reg = false } = body;

    if (!hubspot_deal_id) {
      return NextResponse.json(
        { error: "hubspot_deal_id is required" },
        { status: 400 }
      );
    }

    if (!HUBSPOT_TOKEN) {
      return NextResponse.json(
        { error: "HubSpot API not configured" },
        { status: 500 }
      );
    }

    // 1. Fetch deal data from HubSpot
    const deal = await getDeal(hubspot_deal_id);
    const [contacts, quotes, owner] = await Promise.all([
      getDealContacts(hubspot_deal_id),
      getDealQuotes(hubspot_deal_id),
      getOwner(deal.properties.hubspot_owner_id),
    ]);

    // 2. Pick best quote and get line items
    const quote = pickBestQuote(quotes);
    const lineItems = quote ? await getQuoteLineItems(quote.id) : [];

    // 3. Find matching Fireflies transcript
    const prospectEmails = contacts
      .map((c) => c.email)
      .filter((e) => e && !e.endsWith("@coram.ai"));
    const transcript = FIREFLIES_KEY
      ? await searchFirefliesTranscript(prospectEmails, deal.properties.dealname)
      : null;

    // 4. Build DSR data
    const dsrData = buildDSRData({
      deal,
      contacts,
      quote,
      lineItems,
      owner,
      transcript,
      isDealReg: is_deal_reg,
    });

    // 5. Upsert into Supabase (update if slug exists)
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
      deal: deal.properties.dealname,
      quote_amount: quote?.hs_quote_amount || null,
      transcript_found: !!transcript,
    });
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
      hubspot: !!HUBSPOT_TOKEN,
      fireflies: !!FIREFLIES_KEY,
    },
  });
}
