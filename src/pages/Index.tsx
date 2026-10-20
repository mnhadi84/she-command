import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ArrowUpFromLine,
  Flame,
  Shovel,
  FlaskConical,
  Sparkles,
  Save,
  FolderOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Info,
  X,
  FileDown,
  Thermometer,
  Zap,
  CircleDot,
  TrafficCone,
  Warehouse,
  ShieldCheck,
  HardHat,
  Wrench,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import SavedInspectionDrafts from "@/components/SavedInspectionDrafts";
import { readDrafts, saveDraft, deleteDraft } from "@/lib/inspection-drafts";
import type { InspectionDraft } from "@/lib/inspection-drafts";

type Status = "safe" | "unsafe" | "na" | null;

const categories = [
  { title: "Working at Height (Towers, Poles, Risers & Rooftop Solar)", icon: ArrowUpFromLine },
  { title: "Electrical Safety, Solar DC & LOTO", icon: Zap },
  { title: "Underground Utilities & Excavation (OSP & EV Trenching)", icon: Shovel },
  { title: "Confined Space & Manhole Entry", icon: CircleDot },
  { title: "Traffic Management Plan (TMP) & Roadside Safety", icon: TrafficCone },
  { title: "Warehouse Safety & Materials Handling", icon: Warehouse },
  { title: "Hot Work Activity", icon: Flame },
  { title: "Hazardous Materials, Batteries & Fiber Optics", icon: FlaskConical },
];

const CAT = {
  height: categories[0].title,
  electrical: categories[1].title,
  underground: categories[2].title,
  confined: categories[3].title,
  tmp: categories[4].title,
  warehouse: categories[5].title,
  hotwork: categories[6].title,
  hazmat: categories[7].title,
};

const STORAGE_KEY = "she-analytics-statuses";
const DETAILS_KEY = "she-analytics-details";
const EIA_KEY = "she-analytics-eia";
const ZONE_KEY = "she-analytics-zone";
const ESG_KEY = "she-analytics-esg";
const NOISE_SITE_KEY = "she-analytics-noise-site";
const AMBIENT_TEMP_KEY = "she-analytics-ambient-temp";

const zoneRelevantCategories: Record<string, string[]> = {
  "OSP & Roadside Civils": [CAT.underground, CAT.tmp, CAT.hotwork, CAT.hazmat],
  "Aerial Fiber & Poles": [CAT.height, CAT.electrical, CAT.tmp, CAT.hazmat],
  "Underground Manhole & Chamber": [CAT.confined, CAT.underground, CAT.tmp, CAT.hazmat],
  "Solar Installation (TESB)": [CAT.height, CAT.electrical, CAT.hotwork, CAT.hazmat],
  "EV Charger Hub (Charge N Go)": [CAT.electrical, CAT.underground, CAT.tmp, CAT.hotwork],
  "Warehouse & Logistics Hub": [CAT.warehouse, CAT.hazmat, CAT.hotwork, CAT.electrical],
  "Substation & DC Power Room": [CAT.electrical, CAT.hazmat, CAT.confined, CAT.hotwork],
  "Building Risers & MDF": [CAT.height, CAT.electrical, CAT.confined, CAT.hazmat],
};

const GAS_LIMITS = {
  o2: { label: "Oxygen (O₂)", unit: "%", target: "19.5 – 23.5%", ok: (v: number) => v >= 19.5 && v <= 23.5 },
  lel: { label: "Combustible (LEL)", unit: "%", target: "0%", ok: (v: number) => v === 0 },
  co: { label: "Carbon Monoxide (CO)", unit: "ppm", target: "< 25 ppm", ok: (v: number) => v < 25 },
  h2s: { label: "Hydrogen Sulfide (H₂S)", unit: "ppm", target: "< 10 ppm", ok: (v: number) => v < 10 },
} as const;
type GasKey = keyof typeof GAS_LIMITS;

export const gasOutOfRange = (g: Record<string, string>) =>
  (Object.keys(GAS_LIMITS) as GasKey[]).some((k) => g[k] !== undefined && g[k] !== "" && !GAS_LIMITS[k].ok(parseFloat(g[k])));

const MANHOLE_KEY = "she-analytics-manhole";
const GAS_KEY = "she-analytics-gas";
const HEIGHT_ASSET_KEY = "she-analytics-height-asset";
const PLANT_KEY = "she-analytics-plant";

type PlantChecks = { operator: boolean; dailyLog: boolean; safetyDevices: boolean };
const PLANT_ITEMS: { key: keyof PlantChecks; label: string }[] = [
  { key: "operator", label: "Operator Competency (CIDB Card verified on-site)" },
  { key: "dailyLog", label: "Daily Pre-Operation Checklist & Service Log verified" },
  { key: "safetyDevices", label: "Safety Devices Functional (Reversing alarm, flashing beacon, hydraulic check)" },
];
const loadPlant = (): PlantChecks => {
  try { return { operator: false, dailyLog: false, safetyDevices: false, ...JSON.parse(localStorage.getItem(PLANT_KEY) || "{}") }; } catch { return { operator: false, dailyLog: false, safetyDevices: false }; }
};

const HOT_KEY = "she-analytics-hotwork";
type HotKey = "extinguisher" | "clearance" | "ppe" | "permit";
type HotWorkState = { type: "" | "welding" | "cutting"; checks: Record<HotKey, boolean> };
const HOT_ITEMS: { key: HotKey; label: string; hint: string }[] = [
  { key: "extinguisher", label: "Fire Extinguisher on Standby", hint: "ABC Dry Powder / CO2 fully charged, tagged, and placed within 3m of hot work point." },
  { key: "clearance", label: "Area Clearance & Spark Containment", hint: "Combustible materials cleared within 10m radius or shielded with certified fire blankets." },
  { key: "ppe", label: "Specialized PPE Verified", hint: "Auto-darkening welding mask or cutting/grinding goggles/face shield, plus heavy-duty leather welding gloves and apron." },
  { key: "permit", label: "Permit & Fire Watch Assignment", hint: "Valid Hot Work Permit displayed; designated Fire Watch monitoring during work and 30 minutes post-work." },
];
const loadHotWork = (): HotWorkState => {
  const d: HotWorkState = { type: "", checks: { extinguisher: false, clearance: false, ppe: false, permit: false } };
  try { const p = JSON.parse(localStorage.getItem(HOT_KEY) || "{}"); return { ...d, ...p, checks: { ...d.checks, ...p.checks } }; } catch { return d; }
};

const WAH_KEY = "she-analytics-wah";
type LadderKey = "structure" | "setup" | "contact";
type MewpKey = "pma" | "operator" | "preop" | "restraint";
type WahState = {
  harness: boolean;
  equipment: "" | "ladder" | "mewp";
  ladder: Record<LadderKey, boolean>;
  mewp: Record<MewpKey, boolean>;
  pmaNo: string;
};
const LADDER_ITEMS: { key: LadderKey; label: string; hint: string }[] = [
  { key: "structure", label: "Ladder Structural Condition", hint: "Rungs, stiles, non-slip rubber feet intact; fiberglass/non-conductive near power lines." },
  { key: "setup", label: "Ladder Setup & Securing", hint: "Tied off at top/base, firm level ground, 4:1 slope angle ratio." },
  { key: "contact", label: "Three points of contact maintained during ascent/descent", hint: "" },
];
const MEWP_ITEMS: { key: MewpKey; label: string; hint: string }[] = [
  { key: "pma", label: "Valid DOSH PMA Certificate", hint: "Perakuan Kelayakan Mesin Angkat active and displayed on machine." },
  { key: "operator", label: "Competent Operator Certification", hint: "Valid CIDB / authorized MEWP operator card verified." },
  { key: "preop", label: "Pre-Operation Mechanical & Hydraulic Check", hint: "Outriggers fully deployed with base pads, ground stable, emergency lowering valve operational, zero hydraulic leaks." },
  { key: "restraint", label: "Basket Fall Restraint", hint: "Lanyard tethered to designated harness anchor inside basket, not on guardrails." },
];
const defaultWah = (): WahState => ({
  harness: false,
  equipment: "",
  ladder: { structure: false, setup: false, contact: false },
  mewp: { pma: false, operator: false, preop: false, restraint: false },
  pmaNo: "",
});
const loadWah = (): WahState => {
  const d = defaultWah();
  try {
    const p = JSON.parse(localStorage.getItem(WAH_KEY) || "{}");
    return { ...d, ...p, ladder: { ...d.ladder, ...p.ladder }, mewp: { ...d.mewp, ...p.mewp } };
  } catch { return d; }
};
const CheckRow = ({ label, hint, ok, onClick }: { label: string; hint?: string; ok: boolean; onClick: () => void }) => (
  <Button variant="ghost" aria-pressed={ok} onClick={onClick} className={`h-auto whitespace-normal justify-start flex w-full items-start gap-3 rounded-lg px-3 py-2.5 min-h-[48px] text-left border transition-all ${ok ? "border-safe/30 bg-safe/10 glow-green hover:bg-safe/15" : "glass border-border/30 hover:bg-muted/30"}`}>
    <ShieldCheck className={`h-4 w-4 shrink-0 mt-0.5 ${ok ? "text-safe" : "text-muted-foreground"}`} />
    <div className="flex-1 min-w-0">
      <p className="clamp-body font-medium text-foreground">{label}</p>
      {hint && <p className="clamp-body text-muted-foreground">{hint}</p>}
    </div>
    <span className={`clamp-body font-display uppercase tracking-wider shrink-0 rounded-full border px-2 py-0.5 ${ok ? "text-safe bg-safe/10 border-safe/30" : "text-muted-foreground border-border/30"}`}>{ok ? "Verified" : "Pending"}</span>
  </Button>
);

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
  calm = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  calm?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={calm ? "esg-section space-y-3" : "space-y-3"}>
      <Button variant="ghost"
        onClick={() => setOpen(!open)}
        className={`h-auto w-full flex items-center justify-between glass rounded-xl px-4 py-3 border transition-all duration-300 group ${calm ? "border-accent/20 hover:border-accent/30 hover:bg-accent/5" : "border-border/20 hover:border-secondary/20 hover:bg-secondary/5"}`}
      >
        <div className="flex items-center gap-2">
          <Eye className={calm ? "h-4 w-4 text-accent" : "h-4 w-4 text-secondary"} />
          <span className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-foreground">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
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
      ? "text-safe border-safe/30 glow-green"
      : status === "unsafe"
      ? "text-primary border-primary/20"
      : status === "na"
      ? "text-muted-foreground border-border/20"
      : "text-muted-foreground border-border/10";

  return (
    <Button variant="ghost"
      onClick={onToggle}
      className={`glass h-auto whitespace-normal justify-start rounded-xl p-3 flex items-center gap-3 border ${statusColor} ${status === "safe" ? "hover:border-safe/50 hover:bg-safe/5" : "hover:border-secondary/30 hover:bg-muted/30"} transition-all duration-300 w-full text-left`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${status === "safe" ? "bg-safe/10 border-safe/30" : "glass-strong border-border/20"}`}>
        <Icon className={`h-4 w-4 ${status === "safe" ? "text-safe" : "text-secondary"}`} />
      </div>
      <span className="clamp-body font-semibold text-foreground flex-1 truncate">{cat.title}</span>
      <span className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-1 clamp-body font-display font-bold uppercase tracking-wider ${status === "safe" ? "text-safe bg-safe/10 border border-safe/30" : status === "unsafe" ? "text-primary" : "text-muted-foreground"}`}>
        {status === "safe" && <Check className="h-3.5 w-3.5" />}
        {statusLabel}
      </span>
    </Button>
  );
};

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export type DashboardSection = "all" | "inspection" | "eia" | "esg" | "risk";

const Index = ({ section = "all" }: { section?: DashboardSection }) => {
  const show = (s: Exclude<DashboardSection, "all">) => section === "all" || section === s;
  const [showMethodology, setShowMethodology] = useState(false);
  const [projectName, setProjectName] = useState(() => {
    try { return localStorage.getItem("she-analytics-project") || "TIME dotCom Infrastructure Operations — Central Region"; } catch { return "TIME dotCom Infrastructure Operations — Central Region"; }
  });
  const [assessorName, setAssessorName] = useState(() => {
    try { return localStorage.getItem("she-analytics-assessor") || ""; } catch { return ""; }
  });
  useEffect(() => { try { localStorage.setItem("she-analytics-project", projectName); } catch { toast.error("Project name could not be saved on this device."); } }, [projectName]);
  useEffect(() => { try { localStorage.setItem("she-analytics-assessor", assessorName); } catch { toast.error("Assessor name could not be saved on this device."); } }, [assessorName]);
  const [statuses, setStatuses] = useState<Record<string, Status>>(loadStatuses);
  const [details, setDetails] = useState<Record<string, UnsafeDetails>>(loadDetails);
  const [evidencePhotos, setEvidencePhotos] = useState<Record<string, string | undefined>>({});
  const [eiaValues, setEIAValues] = useState<Record<string, string>>(loadEIA);
  const [esgValues, setESGValues] = useState<ESGValues>(loadESG);
  const [savedDrafts, setSavedDrafts] = useState<InspectionDraft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const weatherGeneration = useRef(0);
  const [showValidation, setShowValidation] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [workZone, setWorkZone] = useState<WorkZone>(() => {
    try { return (localStorage.getItem(ZONE_KEY) as WorkZone) || ""; } catch { return ""; }
  });
  const [noiseSiteType, setNoiseSiteType] = useState<string>(() => {
    try { return localStorage.getItem(NOISE_SITE_KEY) || ""; } catch { return ""; }
  });
  const [manholeType, setManholeType] = useState<string>(() => localStorage.getItem(MANHOLE_KEY) || "");
  const [gas, setGas] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(GAS_KEY) || "{}"); } catch { return {}; }
  });
  const [heightAsset, setHeightAsset] = useState<string>(() => localStorage.getItem(HEIGHT_ASSET_KEY) || "");
  const [ambientTemp, setAmbientTemp] = useState<string>(() => {
    try { return localStorage.getItem(AMBIENT_TEMP_KEY) || ""; } catch { return ""; }
  });
  const [plantChecks, setPlantChecks] = useState<PlantChecks>(loadPlant);
  const [wah, setWah] = useState<WahState>(loadWah);
  const [hotWork, setHotWork] = useState<HotWorkState>(loadHotWork);
  useEffect(() => { localStorage.setItem(HOT_KEY, JSON.stringify(hotWork)); }, [hotWork]);
  const hotUnchecked = HOT_ITEMS.some((i) => !hotWork.checks[i.key]);

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
    if (esgValues.sourceCert === "cradle-to-cradle-certified") score += 10;
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
  useEffect(() => { localStorage.setItem(MANHOLE_KEY, manholeType); }, [manholeType]);
  useEffect(() => { localStorage.setItem(GAS_KEY, JSON.stringify(gas)); }, [gas]);
  useEffect(() => { localStorage.setItem(HEIGHT_ASSET_KEY, heightAsset); }, [heightAsset]);
  useEffect(() => { localStorage.setItem(WAH_KEY, JSON.stringify(wah)); }, [wah]);
  const showLadder = wah.equipment === "ladder" || workZone === "Aerial Fiber & Poles" || workZone === "Building Risers & MDF";
  const showMewp = wah.equipment === "mewp" || workZone === "Solar Installation (TESB)";
  const hazardousAtmosphere = manholeType === "entry" && gasOutOfRange(gas);
  useEffect(() => { localStorage.setItem(AMBIENT_TEMP_KEY, ambientTemp); }, [ambientTemp]);
  const [tempSource, setTempSource] = useState<"gps" | "default" | "manual">(() => (localStorage.getItem(AMBIENT_TEMP_KEY + "-src") as "gps" | "default" | "manual") || "gps");
  const [tempSyncing, setTempSyncing] = useState(false);
  const [humidity, setHumidity] = useState<number | null>(null);
  useEffect(() => { localStorage.setItem(AMBIENT_TEMP_KEY + "-src", tempSource); }, [tempSource]);
  const fetchWeather = async (lat: number, lon: number, src: "gps" | "default", generation: number) => {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`);
      const j = await r.json();
      if (generation !== weatherGeneration.current) return;
      const t = j?.current?.temperature_2m;
      if (typeof t === "number") {
        setAmbientTemp((Math.round(t * 10) / 10).toFixed(1));
        setHumidity(j.current.relative_humidity_2m ?? null);
        setTempSource(src);
      }
    } catch { /* offline — keep manual entry */ }
    setTempSyncing(false);
  };
  const syncAmbientTemp = () => {
    const generation = ++weatherGeneration.current;
    setTempSyncing(true);
    const fallback = () => fetchWeather(3.139, 101.6869, "default", generation);
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (p) => fetchWeather(p.coords.latitude, p.coords.longitude, "gps", generation),
      fallback,
      { timeout: 8000, maximumAge: 300000 }
    );
  };
  useEffect(() => {
    if (localStorage.getItem(AMBIENT_TEMP_KEY + "-src") !== "manual") syncAmbientTemp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { localStorage.setItem(PLANT_KEY, JSON.stringify(plantChecks)); }, [plantChecks]);
  const plantUnverified = PLANT_ITEMS.filter((i) => !plantChecks[i.key]);

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
    try {
      const photos = Object.fromEntries(Object.entries(evidencePhotos).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
      setSavedDrafts(saveDraft({ projectName, assessorName, statuses, details, evidencePhotos: photos, eiaValues, esgValues, workZone, noiseSiteType, manholeType, gas, heightAsset, ambientTemp, tempSource, humidity, plantChecks, wah, hotWork }, contextCategories.map((cat) => cat.title)));
      toast.success("Draft successfully saved locally with timestamp.", { className: "!bg-safe !text-primary-foreground !border-safe" });
    } catch {
      toast.error("Draft could not be saved. Device storage may be full or unavailable; existing drafts have not been changed.");
    }
  };
  const openDrafts = () => {
    try { setSavedDrafts(readDrafts()); setShowDrafts(true); }
    catch { toast.error("Saved drafts could not be read. Existing drafts have not been changed."); }
  };
  const loadDraft = (draft: InspectionDraft) => {
    const s = draft.snapshot;
    ++weatherGeneration.current;
    setTempSyncing(false);
    setProjectName(s.projectName); setAssessorName(s.assessorName);
    setStatuses(s.statuses); setDetails(s.details); setEvidencePhotos(s.evidencePhotos);
    setEIAValues(s.eiaValues); setESGValues(s.esgValues); setWorkZone(s.workZone);
    setNoiseSiteType(s.noiseSiteType); setManholeType(s.manholeType); setGas(s.gas);
    setHeightAsset(s.heightAsset); setAmbientTemp(s.ambientTemp); setTempSource(s.tempSource); setHumidity(s.humidity);
    setPlantChecks(s.plantChecks); setWah(s.wah); setHotWork(s.hotWork);
    setShowValidation(false); setExpandedCard(null); setShowDrafts(false);
    toast.success("Saved inspection draft loaded.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const removeDraft = (id: string) => {
    try { setSavedDrafts(deleteDraft(id)); toast.success("Draft deleted."); }
    catch { toast.error("Draft could not be deleted. Please try again."); }
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
          <label className="block clamp-body text-secondary font-medium" htmlFor="active-project">Active Project:</label>
          <input id="active-project" value={projectName} maxLength={150} onChange={(e) => setProjectName(e.target.value.replace(/[\r\n\u0000-\u001f]/g, ""))} className="w-full min-h-10 bg-transparent border-b border-border text-sm text-foreground focus:outline-none focus:border-primary" />
          <label className="mt-2 flex items-center gap-2 clamp-body text-muted-foreground" htmlFor="assessor-name">Assessor:
            <input id="assessor-name" value={assessorName} placeholder="Assessor name" maxLength={100} onChange={(e) => setAssessorName(e.target.value.replace(/[\r\n\u0000-\u001f]/g, ""))} className="min-w-0 flex-1 min-h-10 bg-transparent border-b border-border text-sm text-foreground focus:outline-none focus:border-primary" />
          </label>
        </div>

        <main className="px-4 py-6 pb-32 space-y-5">

          {show("risk") && (<>
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
          </>)}

          {show("inspection") && (<>
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
                        evidencePhoto={evidencePhotos[cat.title]}
                        onEvidencePhotoChange={(photo) => setEvidencePhotos((previous) => ({ ...previous, [cat.title]: photo }))}
                      />

                      {/* Working at Height — asset toggle */}
                      {cat.title === CAT.height && (
                        <div className="glass rounded-xl p-4 border border-border/20 space-y-3">
                          <p className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground">Asset Type</p>
                          <div className="flex gap-2">
                            <button onClick={() => setHeightAsset("solar")} className={`flex-1 rounded-lg px-2 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${heightAsset === "solar" ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>Rooftop Solar (TESB)</button>
                            <button onClick={() => setHeightAsset("pole")} className={`flex-1 rounded-lg px-2 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${heightAsset === "pole" ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>Utility Pole</button>
                            <button onClick={() => setHeightAsset("tower")} className={`flex-1 rounded-lg px-2 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${heightAsset === "tower" ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>Tower / Riser</button>
                          </div>
                          {heightAsset === "solar" && (
                            <div className="rounded-lg p-3 border border-safety-orange/30 bg-safety-orange/10">
                              <p className="clamp-body font-semibold text-safety-orange">Rooftop Solar Reminder</p>
                              <p className="clamp-body text-muted-foreground mt-1">Verify edge protection is installed and fragile roof / skylight covers are in place before stepping onto the roof.</p>
                            </div>
                          )}

                          {/* Universal mandatory harness check */}
                          <div className={`rounded-lg p-3 border space-y-2 ${wah.harness ? "border-safe/30 bg-safe/10 glow-green" : "border-unsafe/50 bg-unsafe/10"}`}>
                            <button
                              onClick={() => setWah((w) => ({ ...w, harness: !w.harness }))}
                              className="flex w-full items-start gap-3 text-left min-h-[48px]"
                            >
                              {wah.harness ? <ShieldCheck className="h-5 w-5 text-safe shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-unsafe shrink-0 mt-0.5" />}
                              <div className="flex-1">
                                <p className="clamp-body font-semibold text-foreground">Full-Body Harness &amp; Fall Arrest Compliance <span className="text-unsafe">*</span></p>
                                <p className="clamp-body text-muted-foreground">100% tie-off, twin lanyard with shock absorber, inspected condition.</p>
                              </div>
                              <span className={`clamp-body font-display uppercase tracking-wider px-2 py-0.5 rounded-full ${wah.harness ? "bg-safe/20 text-safe" : "bg-unsafe/20 text-unsafe"}`}>{wah.harness ? "Yes" : "No"}</span>
                            </button>
                            {!wah.harness && (
                              <p className="clamp-body font-bold text-unsafe">CRITICAL VIOLATION: Zero tolerance for non-compliance on fall protection.</p>
                            )}
                          </div>

                          {/* Access equipment */}
                          <p className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground">Access Equipment</p>
                          <div className="flex gap-2">
                            {([["ladder", "Ladder"], ["mewp", "Skylift / MEWP"]] as const).map(([k, l]) => (
                              <button key={k} onClick={() => setWah((w) => ({ ...w, equipment: w.equipment === k ? "" : k }))} className={`flex-1 rounded-lg px-2 py-3 min-h-[48px] clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${wah.equipment === k ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>{l}</button>
                            ))}
                          </div>

                          {showLadder && (
                            <div className="rounded-lg p-3 border border-safety-orange/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <p className="font-display clamp-body font-semibold uppercase tracking-wider text-safety-orange">Ladder Safety Verification</p>
                              {LADDER_ITEMS.map((i) => (
                                <CheckRow key={i.key} label={i.label} hint={i.hint} ok={wah.ladder[i.key]} onClick={() => setWah((w) => ({ ...w, ladder: { ...w.ladder, [i.key]: !w.ladder[i.key] } }))} />
                              ))}
                            </div>
                          )}

                          {showMewp && (
                            <div className="rounded-lg p-3 border border-safety-orange/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <p className="font-display clamp-body font-semibold uppercase tracking-wider text-safety-orange">Skylift / MEWP Verification</p>
                              <input
                                value={wah.pmaNo}
                                onChange={(e) => setWah((w) => ({ ...w, pmaNo: e.target.value }))}
                                placeholder="PMA Certificate No. (e.g. PMA-WP-12345)"
                                className="w-full min-h-[48px] rounded-md bg-muted/60 border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              {MEWP_ITEMS.map((i) => (
                                <CheckRow key={i.key} label={i.label} hint={i.hint} ok={wah.mewp[i.key]} onClick={() => setWah((w) => ({ ...w, mewp: { ...w.mewp, [i.key]: !w.mewp[i.key] } }))} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Confined Space & Manhole Entry */}
                      {cat.title === CAT.confined && (
                        <div className="glass rounded-xl p-4 border border-border/20 space-y-3">
                          <p className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground">Manhole Type</p>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => setManholeType("shallow")} className={`flex-1 rounded-lg px-2 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${manholeType === "shallow" ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>Non-Entry / Shallow Manhole (&lt; 1.2m / Joint Box)</button>
                            <button onClick={() => setManholeType("entry")} className={`flex-1 rounded-lg px-2 py-3 clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${manholeType === "entry" ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>Entry-Required Standard Manhole (≥ 1.2m – 3.0m)</button>
                          </div>
                          {manholeType === "shallow" && (
                            <div className="space-y-3">
                              <div className="rounded-lg p-3 border border-accent/30 bg-accent/10">
                                <p className="clamp-body font-semibold text-accent">Low / Moderate Risk</p>
                                <p className="clamp-body text-muted-foreground mt-1">No bodily entry permitted. Work conducted from surface rim using extended tools.</p>
                              </div>
                              <ul className="space-y-1.5"><li className="flex items-center gap-2 clamp-body text-foreground"><ShieldCheck className="h-4 w-4 text-secondary shrink-0" />Rim perimeter guard deployed</li><li className="flex items-center gap-2 clamp-body text-foreground"><ShieldCheck className="h-4 w-4 text-secondary shrink-0" />Surface gas sniffer check clear</li><li className="flex items-center gap-2 clamp-body text-foreground"><ShieldCheck className="h-4 w-4 text-secondary shrink-0" />Cover lifter used</li></ul>
                            </div>
                          )}
                          {manholeType === "entry" && (
                            <div className="space-y-3">
                              <div className="rounded-lg p-3 border border-destructive/40 bg-destructive/10">
                                <p className="clamp-body font-bold uppercase tracking-wider text-destructive">Critical High-Risk Confined Space</p>
                              </div>
                              <p className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground">4-Gas Test</p>
                              <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(GAS_LIMITS) as GasKey[]).map((k) => {
                                  const g = GAS_LIMITS[k];
                                  const v = gas[k] ?? "";
                                  const bad = v !== "" && !g.ok(parseFloat(v));
                                  return (
                                    <div key={k} className={`rounded-lg p-2 border ${bad ? "border-destructive/60 bg-destructive/10" : "border-border/30"}`}>
                                      <label className="clamp-body text-foreground font-semibold block">{g.label}</label>
                                      <span className="text-[10px] text-muted-foreground">Target: {g.target}</span>
                                      <div className="flex items-center gap-1 mt-1">
                                        <input type="number" step="0.1" value={v} onChange={(e) => setGas((p) => ({ ...p, [k]: e.target.value }))} placeholder="0" className="w-full rounded-md glass border border-border/40 px-2 py-2 clamp-body text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-secondary/50" />
                                        <span className="clamp-body text-muted-foreground">{g.unit}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {hazardousAtmosphere && (
                                <div className="rounded-lg p-3 border-2 border-destructive bg-destructive/20 animate-pulse">
                                  <p className="clamp-body font-bold text-destructive uppercase tracking-wider">CRITICAL: HAZARDOUS ATMOSPHERE — FORCED VENTILATION MANDATORY &amp; EVACUATE</p>
                                </div>
                              )}
                              <p className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground">Mandatory Checks</p>
                              <ul className="space-y-1.5"><li className="flex items-center gap-2 clamp-body text-foreground"><ShieldCheck className="h-4 w-4 text-secondary shrink-0" />Mechanical blower running</li><li className="flex items-center gap-2 clamp-body text-foreground"><ShieldCheck className="h-4 w-4 text-secondary shrink-0" />Tripod &amp; winch rigged</li><li className="flex items-center gap-2 clamp-body text-foreground"><ShieldCheck className="h-4 w-4 text-secondary shrink-0" />Certified Standby Person (AESP) on surface</li></ul>
                            </div>
                          )}
                        </div>
                        )}

                        {/* Hot Work Activity protocol */}
                        {cat.title === CAT.hotwork && (
                          <div className="glass rounded-xl p-4 border border-safety-orange/30 space-y-3">
                            <p className="font-display clamp-body font-semibold uppercase tracking-wider text-safety-orange">Hot Work Protocol</p>
                            <div className="flex gap-2">
                              {([["welding", "Welding (Arc / TIG / MIG)"], ["cutting", "Cutting & Grinding (Oxy-fuel / Angle Grinder)"]] as const).map(([k, l]) => (
                                <button key={k} onClick={() => setHotWork((h) => ({ ...h, type: k }))} className={`flex-1 rounded-lg px-2 py-3 min-h-[48px] clamp-body font-semibold uppercase tracking-wider transition-all duration-200 border ${hotWork.type === k ? "bg-secondary/20 border-secondary/40 text-secondary" : "glass border-border/30 text-muted-foreground hover:border-secondary/20"}`}>{l}</button>
                              ))}
                            </div>
                            {HOT_ITEMS.map((i) => (
                              <CheckRow key={i.key} label={i.label} hint={i.hint} ok={hotWork.checks[i.key]} onClick={() => setHotWork((h) => ({ ...h, checks: { ...h.checks, [i.key]: !h.checks[i.key] } }))} />
                            ))}
                            {hotUnchecked && (
                              <div className="flex items-start gap-2 rounded-lg p-3 border border-destructive/40 bg-destructive/10">
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <p className="clamp-body font-bold text-destructive">STOP WORK: Hot work cannot proceed without dedicated fire extinguisher, spark containment, and certified face/eye protection.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Underground Utilities — Plant & Machinery Verification (OSP zone only) */}
                        {cat.title === CAT.underground && workZone === "OSP & Roadside Civils" && (
                          <div className="glass rounded-xl p-4 border border-safety-orange/30 space-y-3">
                            <div className="flex items-center gap-2">
                              <HardHat className="h-4 w-4 text-safety-orange" />
                              <p className="font-display clamp-body font-semibold uppercase tracking-wider text-safety-orange">Plant &amp; Machinery Verification</p>
                            </div>
                            <div className="space-y-2">
                              {PLANT_ITEMS.map((item) => {
                                const ok = plantChecks[item.key];
                                return (
                                  <Button variant="ghost" aria-pressed={ok}
                                    key={item.key}
                                    onClick={() => setPlantChecks((p) => ({ ...p, [item.key]: !p[item.key] }))}
                                    className={`h-auto whitespace-normal justify-start w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 border ${ok ? "border-safe/40 bg-safe/10 glow-green hover:bg-safe/15" : "border-border/30 glass hover:border-safety-orange/30"}`}
                                  >
                                    {ok ? <Check className="h-4 w-4 shrink-0 text-safe" /> : <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />}
                                    <span className={`clamp-body font-medium flex-1 ${ok ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                                    <span className={`clamp-body font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ok ? "bg-safe/20 text-safe" : "bg-muted text-muted-foreground"}`}>
                                      {ok ? "Verified" : "Unverified"}
                                    </span>
                                  </Button>
                                );
                              })}
                            </div>
                            {plantUnverified.length > 0 && (
                              <div className="flex items-start gap-2 rounded-lg bg-safety-orange/10 border border-safety-orange/30 px-3 py-2 animate-in fade-in duration-200">
                                <AlertTriangle className="h-4 w-4 text-safety-orange shrink-0 mt-0.5" />
                                <p className="clamp-body text-safety-orange font-medium">
                                  {plantUnverified.length === PLANT_ITEMS.length
                                    ? "Machinery must not operate without verified operator competency and signed daily pre-use inspection."
                                    : `Pending: ${plantUnverified.map((i) => i.label.split(" (")[0]).join(", ")}. Machinery must not operate without verified operator competency and signed daily pre-use inspection.`}
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

          {/* Heat Stress & Ambient Climate */}
          <div className="space-y-2">
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Heat Stress &amp; Ambient Climate
            </h2>
            <div className="glass rounded-xl p-4 border border-border/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between gap-2">
                            <label className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground block">
                              Ambient Temperature (°C)
                            </label>
                            <span className={`clamp-body font-display uppercase tracking-wider px-2 py-0.5 rounded-full border ${tempSource === "manual" ? "border-safety-orange/40 bg-safety-orange/10 text-safety-orange" : "border-secondary/40 bg-secondary/10 text-secondary"}`}>
                              {tempSource === "manual" ? "⚠️ Manual Entry" : tempSource === "default" ? "📍 Auto (Malaysia Default)" : "📍 Auto-Detected via GPS"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.1"
                              placeholder={tempSyncing ? "Detecting..." : "e.g. 38"}
                              value={ambientTemp}
                              onChange={(e) => { setAmbientTemp(e.target.value); setTempSource("manual"); }}
                              className="flex-1 min-h-[48px] rounded-lg glass border border-border/40 px-4 py-3 clamp-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/40 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={syncAmbientTemp}
                              disabled={tempSyncing}
                              aria-label="Re-sync temperature"
                              className="flex h-12 w-12 items-center justify-center rounded-lg border border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20 disabled:opacity-60"
                            >
                              <RefreshCw className={`h-5 w-5 ${tempSyncing ? "animate-spin" : ""}`} />
                            </button>
                          </div>
                          {humidity !== null && tempSource !== "manual" && (
                            <p className="clamp-body text-muted-foreground">Relative humidity: {humidity}%</p>
                          )}
                          {parseFloat(ambientTemp) > 37 && (
                            <div className="rounded-lg p-3 border border-destructive/40 bg-destructive/10 animate-in fade-in duration-200">
                              <p className="clamp-body font-bold text-destructive">
                                ⚠️ HI-PO RISK: Mandatory 15-min cooling break every hour for outdoor trenching, pole climbing, and rooftop solar teams.
                              </p>
                            </div>
                          )}
                        </div>
                      
          </div>

          </>)}

          {/* 6. Insights — EIA (collapsed) */}
          {show("eia") && (
          <InsightsSection key={`eia-${section}`} title="Environmental Insights (EIA)" defaultOpen={section === "eia"}>
            <EIASection values={eiaValues} onChange={handleEIAChange} />
          </InsightsSection>
          )}

          {/* 7. ESG — visible but subtle, auto-open */}
          {show("esg") && (
          <InsightsSection key={`esg-${section}`} title="Sustainability & ESG" defaultOpen={true} calm>
            <div>
              <ESGSection values={esgValues} onChange={handleESGChange} workZone={workZone} />
            </div>
          </InsightsSection>
          )}

          {/* Export Report */}
          <button
            onClick={() => {
              const lines: string[] = [
                "═══════════════════════════════════════════",
                "  SHE-ANALYTICS — AI INSPECTION REPORT",
                "═══════════════════════════════════════════",
                `Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
                `Project: ${projectName.trim() || "Not specified"}`,
                `Assessor: ${assessorName.trim() || "Not specified"}`,
                `Work Zone: ${workZone || "Not Selected"}`,
                "",
                "── EXECUTIVE SCORES ──",
                `Safety Score: ${safetyScore}%`,
                `ESG Score: ${esgScore}%`,
                `Operational Score: ${opsScore}%`,
                "",
                "── CORE 8 TELCO HIGH-RISK ACTIVITIES ──",
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
                `Working at Height Asset: ${heightAsset === "solar" ? "Rooftop Solar (TESB)" : heightAsset === "pole" ? "Utility Pole" : heightAsset === "tower" ? "Tower / Riser" : "Not Set"}`,
                `  Harness & Fall Arrest Compliance: ${wah.harness ? "✅ Compliant" : "🔴 NON-COMPLIANT — CRITICAL VIOLATION"}`,
                ...(showLadder ? LADDER_ITEMS.map((i) => `  Ladder — ${i.label}: ${wah.ladder[i.key] ? "✅ Verified" : "🔴 Unverified"}`) : []),
                ...(showMewp ? [
                  `  Skylift PMA No.: ${wah.pmaNo || "Not Recorded"}`,
                  ...MEWP_ITEMS.map((i) => `  Skylift — ${i.label}: ${wah.mewp[i.key] ? "✅ Verified" : "🔴 Unverified"}`),
                ] : []),
                `Manhole Classification: ${manholeType === "shallow" ? "Non-Entry / Shallow (< 1.2m)" : manholeType === "entry" ? "Entry-Required Standard (≥ 1.2m – 3.0m)" : "Not Set"}`,
                ...(manholeType === "entry"
                  ? (Object.keys(GAS_LIMITS) as GasKey[]).map((k) => `  ${GAS_LIMITS[k].label}: ${gas[k] ? gas[k] + " " + GAS_LIMITS[k].unit : "Not Recorded"} (target ${GAS_LIMITS[k].target})`)
                  : []),
                hazardousAtmosphere ? "🔴 CRITICAL: HAZARDOUS ATMOSPHERE — FORCED VENTILATION MANDATORY & EVACUATE" : "",
                `Ambient Temperature: ${ambientTemp ? ambientTemp + "°C" : "Not Recorded"} (${tempSource === "manual" ? "Manually logged on-site" : tempSource === "default" ? "Auto-fetched (Malaysia default location — GPS unavailable)" : "Auto-fetched via GPS"})`,
                parseFloat(ambientTemp) > 37 ? "⚠️ HI-PO RISK: Mandatory 15-min cooling break every hour for outdoor trenching, pole climbing, and rooftop solar teams." : "",
"",
                "── HOT WORK ACTIVITY ──",
                `  Hot Work Type: ${hotWork.type === "welding" ? "Welding (Arc / TIG / MIG)" : hotWork.type === "cutting" ? "Cutting & Grinding (Oxy-fuel / Angle Grinder)" : "Not Set"}`,
                ...HOT_ITEMS.map((i) => `  ${i.label}: ${hotWork.checks[i.key] ? "✅ Verified" : "🔴 Unverified"}`),
                hotUnchecked ? "  🛑 STOP WORK: Hot work cannot proceed without dedicated fire extinguisher, spark containment, and certified face/eye protection." : "",
                "",
                workZone === "OSP & Roadside Civils"
                  ? "── PLANT & OPERATOR VERIFICATION (OSP) ──" +
                    PLANT_ITEMS.map(
                      (i) => `\n  ${i.label}: ${plantChecks[i.key] ? "✅ Verified" : "🔴 Unverified"}`
                    ).join("") +
                    (plantUnverified.length > 0
                      ? "\n  ⚠️ Machinery must not operate without verified operator competency and signed daily pre-use inspection."
                      : "")
                  : "",
                "",
                "── TESB / CHARGE N GO RISK STATUS ──",
                `TESB Solar (Work at Height): ${statuses[CAT.height] ?? "Pending"} | Electrical/DC LOTO: ${statuses[CAT.electrical] ?? "Pending"}`,
                `Charge N Go EV Hub (Trenching): ${statuses[CAT.underground] ?? "Pending"} | TMP: ${statuses[CAT.tmp] ?? "Pending"}`,
                "",
                "── ENVIRONMENTAL TELEMETRY (LIVE) ──",
                (() => {
                  try {
                    const h = JSON.parse(localStorage.getItem("she-analytics-haze") || "null");
                    if (!h) return "Haze / API (IPU): Not Available";
                    return `Haze / API (IPU): ${h.api} — DOE Status: ${h.status} (PM2.5 ${h.pm25} µg/m³, PM10 ${h.pm10} µg/m³, source: ${h.source === "gps" ? "GPS location" : "Kuala Lumpur default"}, ${h.time})` +
                      (h.api > 100 ? "\n⚠️ DOE HAZE ALERT (API > 100): Mandatory N95/P2 particulate respirators required for all outdoor OSP trenching, aerial pole climbing, and TESB rooftop solar operations." : "");
                  } catch { return "Haze / API (IPU): Not Available"; }
                })(),
                "",
                "── METHODOLOGY ──",
"Aligned with TIME OSH Management System and Department of Occupational Safety & Health (DOSH) Regulatory Codes.",
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
            className="w-full rounded-xl py-4 flex items-center justify-center gap-3 font-display clamp-heading font-semibold uppercase tracking-wider text-foreground bg-secondary hover:bg-secondary/90 transition-all duration-300 shadow-lg shadow-secondary/20"
          >
            <FileDown className="h-5 w-5" />
            Export Report
          </button>

          {/* Save Draft + Security Badge */}
          <div className="space-y-2">
            <Button variant="outline"
              onClick={handleSaveDraft}
              className="h-auto w-full glass rounded-lg py-4 font-display clamp-heading font-semibold uppercase tracking-wider text-secondary border-secondary/20 hover:border-secondary/40"
            >
              <Save className="h-5 w-5" />Save Draft
            </Button>
            <Button variant="outline" onClick={openDrafts} className="w-full min-h-12 uppercase font-display"><FolderOpen />View Drafts</Button>
            <SavedInspectionDrafts open={showDrafts} onOpenChange={setShowDrafts} drafts={savedDrafts} onLoad={loadDraft} onDelete={removeDraft} />
          </div>

          <p className="text-center clamp-body text-muted-foreground/60 tracking-wide pt-2">
            SHE-Analytics v2.0 &nbsp;|&nbsp; AI-Powered &nbsp;|&nbsp; En. Hadi
          </p>
        </main>

        {/* Research Methodology FAB */}
        <button
          onClick={() => setShowMethodology(true)}
          className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full glass-strong border border-secondary/30 flex items-center justify-center hover:border-secondary/60 transition-all duration-300 shadow-lg group"
          title="Research Methodology"
        >
          <Info className="h-4 w-4 text-secondary group-hover:scale-110 transition-transform" />
        </button>

        {/* Methodology Overlay */}
        {showMethodology && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={() => setShowMethodology(false)}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div
              className="relative glass-strong rounded-2xl border border-secondary/20 p-6 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMethodology(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:border-secondary/40 border border-border/20 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-secondary/20">
                  <Info className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground tracking-wide">Research Methodology</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Aligned with <span className="text-secondary font-semibold">TIME OSH Management System</span> and{" "}
                <span className="text-secondary font-semibold">Department of Occupational Safety &amp; Health (DOSH) Regulatory Codes</span>.
              </p>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
