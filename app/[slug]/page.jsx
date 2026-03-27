"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Shield,
  Video,
  Lock,
  Users,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Play,
  MessageSquare,
  Zap,
  Building,
  MapPin,
  KeyRound,
  ExternalLink,
  Search,
  BarChart3,
  Briefcase,
  BookOpen,
  Wifi,
  AlertTriangle,
  Eye,
  Cpu,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function MilestoneTimeline({ milestones }) {
  return (
    <div className="space-y-0">
      {milestones.map((m, i) => {
        const done = m.status === "completed";
        const next = m.status === "upcoming";
        return (
          <div key={i} className="flex gap-4 relative">
            {i < milestones.length - 1 && (
              <div
                className={`absolute left-3 top-8 w-0.5 h-full ${
                  done ? "bg-emerald-600" : "bg-slate-700"
                }`}
              />
            )}
            <div className="relative z-10 mt-1 flex-shrink-0">
              {done ? (
                <CheckCircle size={24} className="text-emerald-400" />
              ) : next ? (
                <Clock size={24} className="text-emerald-400" />
              ) : (
                <Circle size={24} className="text-slate-600" />
              )}
            </div>
            <div
              className={`pb-5 flex-1 ${
                next
                  ? "bg-emerald-950/40 border border-emerald-800/50 -mx-2 px-4 py-3 rounded-lg"
                  : "py-1"
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`font-semibold text-sm ${
                    done
                      ? "text-emerald-400"
                      : next
                      ? "text-emerald-300"
                      : "text-slate-400"
                  }`}
                >
                  {m.label}
                </span>
                <span className="text-xs text-slate-500">{m.date}</span>
                {next && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Next
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{m.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResourceCard({ resource }) {
  const iconMap = {
    FileText,
    Play,
    Wifi,
    Search,
    BarChart3,
    Briefcase,
    BookOpen,
    Shield,
  };
  const Icon = iconMap[resource.icon] || FileText;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-700/50 hover:bg-slate-800 transition-all cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-900/50 transition-colors flex-shrink-0">
          <Icon size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-200 text-sm group-hover:text-emerald-300 transition-colors">
            {resource.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {resource.description}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {resource.type === "Video"
              ? "Watch"
              : resource.type === "Interactive"
              ? "Open"
              : "View"}{" "}
            <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  );
}

function ReferenceCard({ reference }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-200 text-sm">{reference.name}</h4>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={10} /> {reference.location}
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        {reference.profile} · Replaced {reference.replaced}
      </p>
      {reference.quote && (
        <div className="border-l-2 border-emerald-600 pl-3 mb-3">
          <p className="text-sm text-slate-300 italic">"{reference.quote}"</p>
          <p className="text-xs text-slate-500 mt-1">— {reference.quotePerson}</p>
        </div>
      )}
      <p className="text-sm text-slate-400 mb-3">{reference.result}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-emerald-600 bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded-full">
          {reference.why}
        </span>
        {reference.url && (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
          >
            Read <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

function GrantCard({ grant }) {
  const statusColors = {
    active: "bg-emerald-950 text-emerald-400 border-emerald-800",
    ready: "bg-blue-950 text-blue-400 border-blue-800",
    check: "bg-slate-800 text-slate-400 border-slate-700",
  };
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h4 className="font-bold text-slate-200 text-sm">{grant.name}</h4>
          <p className="text-xs text-slate-500">{grant.full_name}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
            statusColors[grant.status]
          }`}
        >
          {grant.status_label}
        </span>
      </div>
      <p className="text-xs text-slate-600 mb-3">{grant.agency}</p>
      <div className="space-y-1.5 text-xs mb-3">
        <div className="flex gap-2">
          <span className="text-slate-600 w-16 flex-shrink-0">Amount</span>
          <span className="text-slate-400">{grant.amount}</span>
        </div>
        {grant.match !== "N/A" && (
          <div className="flex gap-2">
            <span className="text-slate-600 w-16 flex-shrink-0">Match</span>
            <span className="text-slate-400">{grant.match}</span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-slate-600 w-16 flex-shrink-0">Window</span>
          <span className="text-slate-400">{grant.timeline}</span>
        </div>
      </div>
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-slate-400">
          <span className="text-emerald-500 font-medium">For {grant.org}:</span>{" "}
          {grant.fit}
        </p>
      </div>
    </div>
  );
}

function GatedPricing({ dealData, prospect }) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (dealData.pricing.access_code && code === dealData.pricing.access_code) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-10 text-center">
        <KeyRound size={28} className="text-slate-600 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-200 text-lg mb-1">
          Pricing — Access Required
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          Custom pricing for {prospect.name}. Enter the code from your Coram team.
        </p>
        <div className="flex items-center gap-2 justify-center max-w-xs mx-auto">
          <input
            type="text"
            placeholder="Access code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            className={`flex-1 px-4 py-2.5 bg-slate-900 border rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              error ? "border-red-700" : "border-slate-700"
            }`}
          />
          <button
            onClick={handleUnlock}
            className="bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors"
          >
            View
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2">
            Wrong code. Check with your Coram team.
          </p>
        )}
      </div>
    );
  }

  const pricing = dealData.pricing;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-slate-200">
            {pricing.num_cameras || "N/A"} cameras · {pricing.term || "5 years"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Video Security + Detection · HubSpot Quote
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-emerald-400">
            {pricing.total_five_year || "$0"}
          </p>
          <p className="text-xs text-slate-500">
            total contract value ({pricing.term || "5 years"})
          </p>
        </div>
      </div>
      <div className="px-6 py-4">
        {pricing.components && pricing.components.length > 0 ? (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-600 uppercase tracking-wider">
                  <th className="text-left pb-3 font-medium">Line Item</th>
                  <th className="text-right pb-3 font-medium">Qty</th>
                  <th className="text-right pb-3 font-medium">List</th>
                  <th className="text-right pb-3 font-medium">Disc.</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pricing.components.map((c, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="py-3">
                      <span className="text-slate-200">{c.name}</span>
                      <span className="text-xs text-slate-600 block">
                        {c.detail}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">{c.qty}</td>
                    <td className="py-3 text-right text-slate-500">
                      {c.list_price}
                    </td>
                    <td className="py-3 text-right text-emerald-500">
                      {c.discount || "—"}
                    </td>
                    <td className="py-3 text-right text-slate-300 font-medium">
                      {c.total_five_year}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-600">
                  <td className="pt-4 font-semibold text-slate-200">
                    Total Contract Value
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="pt-4 text-right font-bold text-xl text-emerald-400">
                    {pricing.total_five_year}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Annual Software Licensing
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {pricing.total_annual}
                  <span className="text-sm font-normal text-slate-500">/yr</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Video licenses with detection
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  One-Time Hardware
                </p>
                <p className="text-2xl font-bold text-slate-300">
                  {pricing.hardware_total}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Appliances + shipping
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {pricing.savings_note && (
                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-emerald-500 mb-1">
                    Discount Applied
                  </p>
                  <p className="text-sm text-emerald-300">{pricing.savings_note}</p>
                </div>
              )}
              {pricing.procurement_note && (
                <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-blue-400 mb-1">
                    Procurement
                  </p>
                  <p className="text-sm text-blue-300">
                    {pricing.procurement_note}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 py-4">
            No pricing details available.
          </p>
        )}
      </div>
    </div>
  );
}

function TeamCard({ person, isCoram }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
          isCoram
            ? "bg-emerald-900 text-emerald-300"
            : "bg-slate-700 text-slate-300"
        }`}
      >
        {person.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-200 truncate">
          {person.name}
        </p>
        <p className="text-xs text-slate-500">
          {person.role}
          {person.org ? ` · ${person.org}` : ""}
        </p>
      </div>
      {isCoram && person.email && (
        <div className="flex gap-1">
          <a
            href={`mailto:${person.email}`}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-900/50 transition-colors"
          >
            <Mail size={14} className="text-slate-400" />
          </a>
          {person.phone && (
            <a
              href={`tel:${person.phone}`}
              className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-emerald-900/50 transition-colors"
            >
              <Phone size={14} className="text-slate-400" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DigitalSalesRoom({ params }) {
  const [dsr, setDsr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [resourceFilter, setResourceFilter] = useState("all");

  useEffect(() => {
    const fetchDSR = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("digital_sales_rooms")
          .select("*")
          .eq("slug", params.slug)
          .single();

        if (fetchError || !data) {
          setError("Digital Sales Room not found.");
          return;
        }

        setDsr(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDSR();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Digital Sales Room...</p>
        </div>
      </div>
    );
  }

  if (error || !dsr) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Shield size={48} className="text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Not Found</h1>
          <p className="text-slate-400 mb-6">
            {error || "The Digital Sales Room you're looking for doesn't exist."}
          </p>
          <a
            href="/"
            className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Parse JSONB data
  const prospect = dsr.prospect_name ? { name: dsr.prospect_name } : {};
  const meeting = {
    date: dsr.meeting_date,
    title: dsr.meeting_title,
    duration: dsr.meeting_duration,
    attendees: dsr.attendees || [],
  };
  const coramTeam = dsr.coram_team || [];
  const environment = dsr.environment || {};
  const outcomes = dsr.outcomes || [];
  const callHighlights = dsr.call_highlights || [];
  const milestones = dsr.milestones || [];
  const resources = dsr.resources || [];
  const references = dsr.references_data || [];
  const grants = dsr.grants || [];
  const pricing = dsr.pricing || {};

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Next Steps" },
    { id: "resources", label: "Resources" },
    { id: "references", label: "Proof" },
    { id: "funding", label: "Funding" },
    { id: "pricing", label: "Pricing" },
    { id: "team", label: "Team" },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredResources =
    resourceFilter === "all"
      ? resources
      : resources.filter((r) => r.category === resourceFilter);

  const getOutcomeIcon = (iconName) => {
    const iconMap = { Video, Search, Shield, AlertTriangle };
    return iconMap[iconName] || Video;
  };

  // Convert outcomes to use icon components
  const processedOutcomes = outcomes.map((o) => ({
    ...o,
    icon: getOutcomeIcon(o.icon),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="font-bold text-sm tracking-wide text-slate-200">
                CORAM
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-500">{prospect.name}</span>
            </div>
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeSection === item.id
                      ? "text-emerald-400 bg-emerald-950/50"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-1.5">
              <Calendar size={12} /> Book Meeting
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-16 relative">
          <div className="absolute -top-20 left-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-4">
            {dsr.prospect_contact || "Prospect"} · {meeting.date || "Date TBA"}
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your security evaluation,
            <br />
            all in one place.
          </h1>
          <p className="text-base text-slate-400 max-w-xl leading-relaxed">
            Resources to evaluate, funding to explore, and materials to pitch
            internally — everything from our{" "}
            {meeting.title ? meeting.title.toLowerCase() : "meeting"} organized
            so your team can move forward.
          </p>
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            {environment.cameras && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {environment.cameras} cameras
              </div>
            )}
            {environment.site && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {environment.site}
              </div>
            )}
            {dsr.status === "active" && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Trial active
              </div>
            )}
          </div>
        </div>

        {/* What Changes */}
        <section id="overview" className="mb-16">
          <h2 className="text-lg font-bold text-white mb-1">
            What changes for your team
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Based on our {meeting.date || "recent"} walkthrough.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {processedOutcomes.map((o, i) => {
              const Icon = o.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-emerald-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-950/50 border border-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm mb-1">
                        {o.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {o.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* What we covered — collapsible */}
          {callHighlights.length > 0 && (
            <details className="bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden group">
              <summary className="px-5 py-3 cursor-pointer flex items-center justify-between hover:bg-slate-800/30 transition-colors text-sm text-slate-500">
                What we covered on the call{" "}
                <ChevronRight
                  size={14}
                  className="group-open:rotate-90 transition-transform"
                />
              </summary>
              <div className="px-5 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {callHighlights.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="font-medium text-xs text-slate-300 mb-0.5">
                      {c.label}
                    </p>
                    <p className="text-xs text-slate-600">{c.detail}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>

        {/* Next Steps */}
        {milestones.length > 0 && (
          <section id="timeline" className="mb-16">
            <h2 className="text-lg font-bold text-white mb-1">Next steps</h2>
            <p className="text-sm text-slate-500 mb-6">
              Trial → test → review → decision.
            </p>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <MilestoneTimeline milestones={milestones} />
            </div>
          </section>
        )}

        {/* Resources (Tabbed) */}
        {resources.length > 0 && (
          <section id="resources" className="mb-16">
            <h2 className="text-lg font-bold text-white mb-1">Resources</h2>
            <p className="text-sm text-slate-500 mb-4">
              Share with your team or anyone evaluating.
            </p>
            <div className="flex gap-2 mb-6">
              {[
                { key: "all", label: "All" },
                { key: "evaluate", label: "Evaluate" },
                { key: "fund", label: "Fund It" },
                { key: "pitch", label: "Pitch Internally" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setResourceFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    resourceFilter === tab.key
                      ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredResources.map((r, i) => (
                <ResourceCard key={i} resource={r} />
              ))}
            </div>
          </section>
        )}

        {/* Proof */}
        {references.length > 0 && (
          <section id="references" className="mb-16">
            <h2 className="text-lg font-bold text-white mb-1">See the proof</h2>
            <p className="text-sm text-slate-500 mb-6">
              Organizations that made this same decision. Talk to them directly
              if you want.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {references.map((r, i) => (
                <ReferenceCard key={i} reference={r} />
              ))}
            </div>
          </section>
        )}

        {/* Funding */}
        {grants.length > 0 && (
          <section id="funding" className="mb-16">
            <h2 className="text-lg font-bold text-white mb-1">Fund it</h2>
            <p className="text-sm text-slate-500 mb-6">
              Federal and cooperative purchasing options that can offset or
              simplify your investment.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {grants.map((g, i) => (
                <GrantCard key={i} grant={g} />
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        <section id="pricing" className="mb-16">
          <h2 className="text-lg font-bold text-white mb-1">Investment</h2>
          <p className="text-sm text-slate-500 mb-6">
            Custom pricing for {prospect.name || "your organization"}.
          </p>
          <GatedPricing dealData={{ pricing }} prospect={prospect} />
        </section>

        {/* Team */}
        {(coramTeam.length > 0 || meeting.attendees.length > 0) && (
          <section id="team" className="mb-16">
            <h2 className="text-lg font-bold text-white mb-1">Your team</h2>
            <p className="text-sm text-slate-500 mb-6">
              Questions between meetings? Reach out directly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coramTeam.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                  <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">
                    Coram
                  </h3>
                  {coramTeam.map((p, i) => (
                    <TeamCard key={i} person={p} isCoram={true} />
                  ))}
                </div>
              )}
              {meeting.attendees.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                  <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">
                    Your Organization
                  </h3>
                  {meeting.attendees.map((p, i) => (
                    <TeamCard key={i} person={p} isCoram={false} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border border-slate-800/50 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-8 text-center mb-10">
          <h2 className="text-xl font-bold text-white mb-2">
            Ready to move forward?
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Let's schedule a time to discuss implementation and next steps for
            your organization.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Calendar size={14} /> Schedule Follow-Up
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm border border-slate-700">
              <MessageSquare size={14} /> Ask Questions
            </button>
          </div>
          <p className="text-xs text-slate-700 mt-4">
            If Coram isn't the right fit, we'll tell you.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-5">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center">
              <Shield size={8} className="text-white" />
            </div>
            <span>coram.ai</span>
          </div>
          <span>
            Prepared for {prospect.name || "Prospect"} · Confidential
          </span>
        </div>
      </footer>
    </div>
  );
}
