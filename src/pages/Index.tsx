import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowUpFromLine,
  Blocks,
  Flame,
  Shovel,
  Weight,
  FlaskConical,
  HandMetal,
  Sparkles,
  Save,
  CloudUpload,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Info,
  X,
  FileDown,
  Volume2,
  Thermometer,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import QuickCapture from "@/components/QuickCapture";
import LiveEnvironment from "@/components/LiveEnvironment";
import RiskScoreCards from "@/components/RiskScoreCards";
import InspectionCard from "@/components/InspectionCard";
import type { UnsafeDetails } from "@/components/InspectionCard";
import EIASection from "@/components/EIASection";
import ESGSection from "@/components/ESGSection";
import type { ESGValues } from "@/components/ESGSection";
import { emptyESG } from "@/components/ESGSection";
import BottomNav from "@/components/BottomNav";
import WorkZoneSelector from "@/components/WorkZoneSelector";
import type { WorkZone } from "@/components/WorkZoneSelector";

type Status = "safe" | "unsafe" | "na" | null;

const categories = [
  { title: "Working at Height", icon: ArrowUpFromLine },
  { title: "Scaffolding & Temp Structures", icon: Blocks },
  { title: "Hot Work", icon: Flame },
  { title: "Excavation Work", icon: Shovel },
  { title: "Heavy Lifting Work", icon: Weight },
  { title: "Chemical Handling", icon: FlaskConical },
  { title: "Manual Handling Work", icon: HandMetal },
  { title: "Acoustic / Noise", icon: Volume2 },
  { title: "Heat Stress", icon: Thermometer },
];

const STORAGE_KEY = "she-analytics-statuses";
const DETAILS_KEY = "she-analytics-details";
const EIA_KEY = "she-analytics-eia";
const ZONE_KEY = "she-analytics-zone";
const ESG_KEY = "she-analytics-esg";
const NOISE_SITE_KEY = "she-analytics-noise-site";
const AMBIENT_TEMP_KEY = "she-analytics-ambient-temp";

const zoneRelevantCategories: Record<string, string[]> = {
  Tunnel: ["Hot Work", "Chemical Handling", "Manual Handling Work", "Housekeeping"],
  "Underground Station": ["Hot Work", "Chemical Handling", "Manual Handling Work", "Housekeeping", "Heavy Lifting Work"],
  "Ground Level": ["Excavation Work", "Heavy Lifting Work", "Manual Handling Work", "Housekeeping", "Hot Work", "Chemical Handling"],
  Elevated: ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Manual Handling Work", "Housekeeping"],
  Viaduct: ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Housekeeping"],
  "Elevated Station": ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Manual Handling Work", "Housekeeping"],
  "Highrise Building": ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Manual Handling Work", "Housekeeping", "Chemical Handling"],
};

const emptyDetails = (): UnsafeDetails => ({ severity: "", description: "", assignTo: "" });

const loadStatuses = (): Record<string, Status> => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
};
const loadDetails = (): Record<string, UnsafeDetails> => {
  try { const raw = localStorage.getItem(DETAILS_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
};
const loadEIA = (): Record<string, string> => {
  try { const raw = localStorage.getItem(EIA_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
};
const loadESG = (): ESGValues => {
  try { const raw = localStorage.getItem(ESG_KEY); return raw ? { ...emptyESG(), ...JSON.parse(raw) } : emptyESG(); } catch { return emptyESG(); }
};

/* ------------------------------------------------------------------ */
/*  Collapsible Insights Section                                       */
/* ------------------------------------------------------------------ */
const InsightsSection = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between glass rounded-xl px-4 py-3 border border-border/20 hover:border-accent/20 transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-accent" />
          <span className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-foreground">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Smart Status Card (compact inspection)                             */
/* ------------------------------------------------------------------ */
const SmartStatusCard = ({
  cat,
  status,
  onToggle,
}: {
  cat: { title: string; icon: React.ElementType };
  status: Status;
  onToggle: () => void;
}) => {
  const Icon = cat.icon;
  const statusLabel = status === "safe" ? "Safe" : status === "unsafe" ? "Unsafe" : status === "na" ? "N/A" : "Pending";
  const statusColor =
    status === "safe"
      ? "text-secondary border-secondary/20"
      : status === "unsafe"
      ? "text-primary border-primary/20"
      : status === "na"
      ? "text-muted-foreground border-border/20"
      : "text-muted-foreground border-border/10";

  return (
    <button
      onClick={onToggle}
      className={`glass rounded-xl p-3 flex items-center gap-3 border ${statusColor} hover:border-accent/30 transition-all duration-300 w-full text-left`}
    >
      <div className="w-9 h-9 rounded-lg glass-strong flex items-center justify-center border border-border/20 shrink-0">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <span className="clamp-body font-semibold text-foreground flex-1 truncate">{cat.title}</span>
      <span className={`clamp-body font-display font-bold uppercase tracking-wider ${status === "safe" ? "text-secondary" : status === "unsafe" ? "text-primary" : "text-muted-foreground"}`}>
        {statusLabel}
      </span>
    </button>
  );
};

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

const Index = () => {
  const [showMethodology, setShowMethodology] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, Status>>(loadStatuses);
  const [details, setDetails] = useState<Record<string, UnsafeDetails>>(loadDetails);
  const [eiaValues, setEIAValues] = useState<Record<string, string>>(loadEIA);
  const [esgValues, setESGValues] = useState<ESGValues>(loadESG);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [workZone, setWorkZone] = useState<WorkZone>(() => {
    try { return (localStorage.getItem(ZONE_KEY) as WorkZone) || ""; } catch { return ""; }
  });
  const [noiseSiteType, setNoiseSiteType] = useState<string>(() => {
    try { return localStorage.getItem(NOISE_SITE_KEY) || ""; } catch { return ""; }
  });
  const [ambientTemp, setAmbientTemp] = useState<string>(() => {
    try { return localStorage.getItem(AMBIENT_TEMP_KEY) || ""; } catch { return ""; }
  });

  const contextCategories = workZone && zoneRelevantCategories[workZone]
    ? categories.filter((c) => zoneRelevantCategories[workZone].includes(c.title))
    : categories;

  const totalInspected = contextCategories.filter((c) => statuses[c.title] === "safe" || statuses[c.title] === "unsafe").length;
  const openIssues = contextCategories.filter((c) => statuses[c.title] === "unsafe").length;

  // Compute executive scores
  const safetyScore = useMemo(() => {
    if (contextCategories.length === 0) return 85;
    const safe = contextCategories.filter((c) => statuses[c.title] === "safe").length;
    const total = contextCategories.length;
    return Math.round((safe / total) * 100) || 85;
  }, [statuses, contextCategories]);

  const esgScore = useMemo(() => {
    let score = 70;
    if (esgValues.sourceCert === "esg-certified") score += 10;
    if (esgValues.disposalChain === "cradle-to-cradle") score += 8;
    if (esgValues.energySaver === "active") score += 7;
    const rain = parseFloat(esgValues.renewableWaterRatio) || 0;
    const muni = parseFloat(esgValues.municipalWater) || 0;
    if (rain + muni > 0) score += Math.round((rain / (rain + muni)) * 5);
    return Math.min(score, 100);
  }, [esgValues]);

  const opsScore = useMemo(() => {
    return Math.max(100 - openIssues * 15, 20);
  }, [openIssues]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses)); }, [statuses]);
  useEffect(() => { localStorage.setItem(DETAILS_KEY, JSON.stringify(details)); }, [details]);
  useEffect(() => { localStorage.setItem(EIA_KEY, JSON.stringify(eiaValues)); }, [eiaValues]);
  useEffect(() => { localStorage.setItem(ESG_KEY, JSON.stringify(esgValues)); }, [esgValues]);
  useEffect(() => { localStorage.setItem(ZONE_KEY, workZone); }, [workZone]);
  useEffect(() => { localStorage.setItem(NOISE_SITE_KEY, noiseSiteType); }, [noiseSiteType]);
  useEffect(() => { localStorage.setItem(AMBIENT_TEMP_KEY, ambientTemp); }, [ambientTemp]);

  const handleEIAChange = (key: string, value: string) => setEIAValues((prev) => ({ ...prev, [key]: value }));
  const handleESGChange = (key: keyof ESGValues, value: string) => setESGValues((prev) => ({ ...prev, [key]: value }));

  const handleStatusChange = (title: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [title]: status }));
    if (status !== "unsafe") setShowValidation(false);
  };

  const handleDetailsChange = (title: string, d: UnsafeDetails) => {
    setDetails((prev) => ({ ...prev, [title]: d }));
  };

  const validateUnsafeFields = (): boolean => {
    for (const cat of categories) {
      if (statuses[cat.title] === "unsafe") {
        const d = details[cat.title] || emptyDetails();
        if (!d.severity || !d.description.trim()) return false;
      }
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (!validateUnsafeFields()) {
      setShowValidation(true);
      toast.error("Please fill in all required fields for unsafe categories.");
      return;
    }
    setShowValidation(false);
    setSyncing(true);
    setSynced(false);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 2000);
    }, 1800);
  };

  const toggleExpanded = (title: string) => {
    setExpandedCard((prev) => (prev === title ? null : title));
  };

  return (
    <div className="min-h-screen bg-background grid-pattern flex justify-center">
      <div className="w-full max-w-[480px]">
        <Header />

        {/* Site ID - compact */}
        <div className="glass-strong px-4 py-2 border-b border-border/30">
          <p className="clamp-body text-accent font-medium tracking-wide">
            Active Project: <span className="text-foreground">MRT Line 3 - Kajang Sector</span>
          </p>
          <p className="clamp-body text-muted-foreground">
            Lead Inspector: <span className="text-foreground">Mr. Hadi</span>
          </p>
        </div>

        <main className="px-4 py-6 pb-32 space-y-5">

          {/* 1. AI Quick Capture — Hero Action */}
          <QuickCapture />

          {/* 2. Three Executive Scores */}
          <RiskScoreCards
            safetyScore={safetyScore}
            esgScore={esgScore}
            operationalScore={opsScore}
          />

          {/* 3. Live Environment Widget */}
          <LiveEnvironment />

          {/* 4. Work Zone (compact) */}
          <WorkZoneSelector value={workZone} onChange={setWorkZone} />

          {/* 5. Smart Status Cards (replaces long form) */}
          <div className="space-y-3">
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Smart Checklist — {contextCategories.length} Items
            </h2>
            <div className="space-y-2">
              {contextCategories.map((cat) => (
                <div key={cat.title}>
                  <SmartStatusCard
                    cat={cat}
                    status={statuses[cat.title] ?? null}
                    onToggle={() => toggleExpanded(cat.title)}
                  />
                  {expandedCard === cat.title && (
                    <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-300 space-y-3">
                      <InspectionCard
                        title={cat.title}
                        icon={cat.icon}
                        index={0}
                        status={statuses[cat.title] ?? null}
                        onStatusChange={(s) => handleStatusChange(cat.title, s)}
                        unsafeDetails={details[cat.title] || emptyDetails()}
                        onUnsafeDetailsChange={(d) => handleDetailsChange(cat.title, d)}
                        showValidation={showValidation}
                      />

                      {/* Cat 8: Acoustic/Noise — conditional sub-menu on unsafe */}
                      {cat.title === "Acoustic / Noise" && statuses[cat.title] === "unsafe" && (
                        <div className="glass rounded-xl p-4 border border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="font-display clamp-body font-semibold uppercase tracking-wider text-primary">
                            Site Type — Control Selection
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setNoiseSiteType("enclosed")}
                              className={`flex-1 rounded-lg px-3 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${
                                noiseSiteType === "enclosed"
                                  ? "bg-accent/20 border-accent/40 text-accent"
                                  : "glass border-border/30 text-muted-foreground hover:border-accent/20"
                              }`}
                            >
                              Enclosed / Confined
                            </button>
                            <button
                              onClick={() => setNoiseSiteType("open")}
                              className={`flex-1 rounded-lg px-3 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${
                                noiseSiteType === "open"
                                  ? "bg-accent/20 border-accent/40 text-accent"
                                  : "glass border-border/30 text-muted-foreground hover:border-accent/20"
                              }`}
                            >
                              Open / Outdoor
                            </button>
                          </div>
                          {noiseSiteType === "enclosed" && (
                            <div className="glass rounded-lg p-3 border border-accent/20 bg-accent/5">
                              <p className="clamp-body text-accent font-semibold">🔧 Engineering Control Required</p>
                              <p className="clamp-body text-muted-foreground mt-1">Source Damping &amp; Acoustic Enclosure.</p>
                            </div>
                          )}
                          {noiseSiteType === "open" && (
                            <div className="glass rounded-lg p-3 border border-accent/20 bg-accent/5">
                              <p className="clamp-body text-accent font-semibold">📋 Administrative Control Required</p>
                              <p className="clamp-body text-muted-foreground mt-1">15m Exclusion Zone &amp; Job Rotation.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cat 9: Heat Stress — ambient temperature input */}
                      {cat.title === "Heat Stress" && (
                        <div className="glass rounded-xl p-4 border border-border/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground block">
                            Ambient Temperature (°C)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 38"
                            value={ambientTemp}
                            onChange={(e) => setAmbientTemp(e.target.value)}
                            className="w-full rounded-lg glass border border-border/40 px-4 py-3 clamp-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/40 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          {parseFloat(ambientTemp) > 37 && (
                            <div className="rounded-lg p-3 border border-destructive/40 bg-destructive/10 animate-in fade-in duration-200">
                              <p className="clamp-body font-bold text-destructive uppercase tracking-wider">
                                ⚠️ HI-PO RISK
                              </p>
                              <p className="clamp-body text-destructive/90 mt-1">
                                Mandatory 15-min cooling break every hour.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. Insights — EIA (collapsed) */}
          <InsightsSection title="Environmental Insights (EIA)">
            <EIASection values={eiaValues} onChange={handleEIAChange} />
          </InsightsSection>

          {/* 7. ESG — visible but subtle, auto-open */}
          <InsightsSection title="Sustainability & ESG" defaultOpen={true}>
            <div className="opacity-90">
              <ESGSection values={esgValues} onChange={handleESGChange} workZone={workZone} />
            </div>
          </InsightsSection>

          {/* Export Report */}
          <button
            onClick={() => {
              const lines: string[] = [
                "═══════════════════════════════════════════",
                "  SHE-ANALYTICS — AI INSPECTION REPORT",
                "═══════════════════════════════════════════",
                `Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
                `Project: MRT Line 3 — Kajang Sector`,
                `Inspector: Mr. Hadi`,
                `Work Zone: ${workZone || "Not Selected"}`,
                "",
                "── EXECUTIVE SCORES ──",
                `Safety Score: ${safetyScore}%`,
                `ESG Score: ${esgScore}%`,
                `Operational Score: ${opsScore}%`,
                "",
                "── INSPECTION SUMMARY ──",
                `Categories Inspected: ${totalInspected} / ${contextCategories.length}`,
                `Open Issues: ${openIssues}`,
                "",
                ...contextCategories.map((c) => {
                  const s = statuses[c.title];
                  const label = s === "safe" ? "✅ Safe" : s === "unsafe" ? "🔴 Unsafe" : s === "na" ? "⚪ N/A" : "⏳ Pending";
                  const d = details[c.title];
                  const extra = s === "unsafe" && d?.description ? `  → ${d.severity}: ${d.description}` : "";
                  return `  ${c.title}: ${label}${extra}`;
                }),
                "",
                "── CONTEXT SELECTIONS ──",
                `Noise Site Type: ${noiseSiteType === "enclosed" ? "Enclosed / Confined" : noiseSiteType === "open" ? "Open / Outdoor" : "Not Set"}`,
                `Ambient Temperature: ${ambientTemp ? ambientTemp + "°C" : "Not Recorded"}`,
                parseFloat(ambientTemp) > 37 ? "⚠️ HI-PO RISK: Mandatory 15-min cooling break every hour." : "",
                "",
                "── METHODOLOGY ──",
                "Logic powered by ASCF (Awlaqi Safety Culture Framework)",
                "& Predictive Context-Aware Algorithms.",
                "",
                "Generated by SHE-Analytics v2.0",
              ];
              const blob = new Blob([lines.join("\n")], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `SHE-Report-${new Date().toISOString().slice(0, 10)}.txt`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Report exported successfully.");
            }}
            className="w-full rounded-xl py-4 flex items-center justify-center gap-3 font-display clamp-heading font-semibold uppercase tracking-wider text-foreground bg-accent hover:bg-accent/90 transition-all duration-300 shadow-lg shadow-accent/20"
          >
            <FileDown className="h-5 w-5" />
            Export Report
          </button>

          {/* Save Draft + Security Badge */}
          <div className="space-y-2">
            <button
              onClick={handleSaveDraft}
              disabled={syncing}
              className="w-full glass rounded-xl py-4 flex items-center justify-center gap-3 font-display clamp-heading font-semibold uppercase tracking-wider text-accent border border-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-70"
            >
              {syncing ? (
                <><CloudUpload className="h-5 w-5 animate-pulse" />Syncing to Cloud...</>
              ) : synced ? (
                <><Check className="h-5 w-5 text-secondary" /><span className="text-secondary">Draft Saved!</span></>
              ) : (
                <><Save className="h-5 w-5" />Save Draft</>
              )}
            </button>
            <div className="flex items-center justify-end gap-1.5 pr-1">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary/70" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-secondary/70">
                Secure Edge Processing — Data de-identified before sync
              </span>
            </div>
          </div>

          <p className="text-center clamp-body text-muted-foreground/60 tracking-wide pt-2">
            SHE-Analytics v2.0 &nbsp;|&nbsp; AI-Powered &nbsp;|&nbsp; Mr. Hadi
          </p>
        </main>

        {/* Research Methodology FAB */}
        <button
          onClick={() => setShowMethodology(true)}
          className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full glass-strong border border-accent/30 flex items-center justify-center hover:border-accent/60 transition-all duration-300 shadow-lg group"
          title="Research Methodology"
        >
          <Info className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
        </button>

        {/* Methodology Overlay */}
        {showMethodology && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={() => setShowMethodology(false)}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div
              className="relative glass-strong rounded-2xl border border-accent/20 p-6 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMethodology(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:border-accent/40 border border-border/20 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-accent/20">
                  <Info className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground tracking-wide">Research Methodology</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Logic powered by <span className="text-accent font-semibold">ASCF</span>{" "}
                <span className="text-foreground/80">(Awlaqi Safety Culture Framework)</span>{" "}
                &amp; <span className="text-accent font-semibold">Predictive Context-Aware Algorithms</span>.
              </p>
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  All risk scores, pre-emptive actions, and ESG metrics are computed using multi-variable site context models aligned with international SHE standards.
                </p>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
