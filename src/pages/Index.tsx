import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import HeroStatus from "@/components/HeroStatus";
import DailySummary from "@/components/DailySummary";
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

// Categories relevant to each zone (ground-level items hidden for elevated zones, etc.)
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const loadDetails = (): Record<string, UnsafeDetails> => {
  try {
    const raw = localStorage.getItem(DETAILS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const loadEIA = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(EIA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const loadESG = (): ESGValues => {
  try {
    const raw = localStorage.getItem(ESG_KEY);
    return raw ? { ...emptyESG(), ...JSON.parse(raw) } : emptyESG();
  } catch {
    return emptyESG();
  }
};

const Index = () => {
  const [statuses, setStatuses] = useState<Record<string, Status>>(loadStatuses);
  const [details, setDetails] = useState<Record<string, UnsafeDetails>>(loadDetails);
  const [eiaValues, setEIAValues] = useState<Record<string, string>>(loadEIA);
  const [esgValues, setESGValues] = useState<ESGValues>(loadESG);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workZone, setWorkZone] = useState<WorkZone>(() => {
    try {
      return (localStorage.getItem(ZONE_KEY) as WorkZone) || "";
    } catch {
      return "";
    }
  });

  // Filter categories based on work zone context
  const contextCategories = workZone && zoneRelevantCategories[workZone]
    ? categories.filter((c) => zoneRelevantCategories[workZone].includes(c.title))
    : categories;

  const totalInspected = contextCategories.filter((c) => statuses[c.title] === "safe" || statuses[c.title] === "unsafe").length;
  const openIssues = contextCategories.filter((c) => statuses[c.title] === "unsafe").length;
  const naCategories = contextCategories.filter((c) => statuses[c.title] === "na").length;

  const filteredCategories = contextCategories.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
  }, [details]);

  useEffect(() => {
    localStorage.setItem(EIA_KEY, JSON.stringify(eiaValues));
  }, [eiaValues]);

  useEffect(() => {
    localStorage.setItem(ESG_KEY, JSON.stringify(esgValues));
  }, [esgValues]);

  useEffect(() => {
    localStorage.setItem(ZONE_KEY, workZone);
  }, [workZone]);

  const handleEIAChange = (key: string, value: string) => {
    setEIAValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleESGChange = (key: keyof ESGValues, value: string) => {
    setESGValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (title: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [title]: status }));
    if (status !== "unsafe") {
      setShowValidation(false);
    }
  };

  const handleDetailsChange = (title: string, d: UnsafeDetails) => {
    setDetails((prev) => ({ ...prev, [title]: d }));
  };

  const validateUnsafeFields = (): boolean => {
    for (const cat of categories) {
      if (statuses[cat.title] === "unsafe") {
        const d = details[cat.title] || emptyDetails();
        if (!d.severity || !d.description.trim()) {
          return false;
        }
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

  return (
    <div className="min-h-screen bg-background grid-pattern flex justify-center">
      <div className="w-full max-w-[480px]">
        <Header />

        {/* Site Identification */}
        <div className="glass-strong px-4 py-2 border-b border-border/30">
          <p className="clamp-body text-accent font-medium tracking-wide">
            Active Project: <span className="text-foreground">MRT Line 3 - Kajang Sector</span>
          </p>
          <p className="clamp-body text-muted-foreground">
            Lead Inspector: <span className="text-foreground">Mr. Hadi</span>
          </p>
        </div>

        <main className="px-4 py-6 pb-32 space-y-6">
          <DailySummary
            totalInspected={totalInspected}
            openIssues={openIssues}
            naCategories={naCategories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <WorkZoneSelector value={workZone} onChange={setWorkZone} />

          <HeroStatus />

          <div>
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              The Big Nine — Inspection Categories
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {filteredCategories.map((cat, i) => (
                <InspectionCard
                  key={cat.title}
                  title={cat.title}
                  icon={cat.icon}
                  index={i}
                  status={statuses[cat.title] ?? null}
                  onStatusChange={(s) => handleStatusChange(cat.title, s)}
                  unsafeDetails={details[cat.title] || emptyDetails()}
                  onUnsafeDetailsChange={(d) => handleDetailsChange(cat.title, d)}
                  showValidation={showValidation}
                />
              ))}
            </div>
          </div>

          <EIASection values={eiaValues} onChange={handleEIAChange} />

          <ESGSection values={esgValues} onChange={handleESGChange} workZone={workZone} />

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={syncing}
            className="w-full glass rounded-xl py-4 flex items-center justify-center gap-3 font-display clamp-heading font-semibold uppercase tracking-wider text-accent border border-accent/20 hover:border-accent/40 transition-all duration-300 disabled:opacity-70"
          >
            {syncing ? (
              <>
                <CloudUpload className="h-5 w-5 animate-pulse" />
                Syncing to Cloud...
              </>
            ) : synced ? (
              <>
                <Check className="h-5 w-5 text-safe" />
                <span className="text-safe">Draft Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Draft
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center clamp-body text-muted-foreground/60 tracking-wide pt-2">
            SHE-Analytics v1.0 &nbsp;|&nbsp; Developed by Mr. Hadi
          </p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
