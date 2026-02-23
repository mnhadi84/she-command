import { useState, useEffect, useMemo } from "react";
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
  { title: "Housekeeping", icon: Sparkles },
];

const STORAGE_KEY = "she-analytics-statuses";
const DETAILS_KEY = "she-analytics-details";
const EIA_KEY = "she-analytics-eia";
const ZONE_KEY = "she-analytics-zone";
const ESG_KEY = "she-analytics-esg";

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
                    <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-300">
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

          {/* Save Draft */}
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

          <p className="text-center clamp-body text-muted-foreground/60 tracking-wide pt-2">
            SHE-Analytics v2.0 &nbsp;|&nbsp; AI-Powered &nbsp;|&nbsp; Mr. Hadi
          </p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
