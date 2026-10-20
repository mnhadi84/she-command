import { MapPin, AlertTriangle, ShieldAlert, CheckCircle2, Gauge, Tag, HardHat, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WorkZone =
  | "OSP & Roadside Civils"
  | "Aerial Fiber & Poles"
  | "Underground Manhole & Chamber"
  | "Solar Installation (TESB)"
  | "EV Charger Hub (Charge N Go)"
  | "Warehouse & Logistics Hub"
  | "Substation & DC Power Room"
  | "Building Risers & MDF"
  | "";

type Tier = "Critical" | "High" | "Moderate";

interface ZoneInfo {
  description: string;
  tier: Tier;
  tags: string[];
  checks: { label: string; priority: "high" | "standard"; icon?: LucideIcon }[];
}

export const zoneInfo: Record<Exclude<WorkZone, "">, ZoneInfo> = {
  "OSP & Roadside Civils": {
    description: "Micro-trenching, HDD, duct laying",
    tier: "High",
    tags: ["Micro-trench", "HDD", "Duct Laying", "Roadside TMP"],
    checks: [
      { label: "Utility detection (CAT & Genny) completed", priority: "high" },
      { label: "Traffic Management Plan barricading active", priority: "high" },
      { label: "Plant Operator Competency Verified (CIDB / Valid License)", icon: HardHat, priority: "high" },
      { label: "Excavator / Backhoe Daily Pre-Use & Maintenance Log Active", icon: Wrench, priority: "high" },
      { label: "Trench silt traps installed", priority: "standard" },
    ],
  },
  "Aerial Fiber & Poles": {
    description: "Overhead stringing, shared TNB/TM poles, ladder climbing",
    tier: "Critical",
    tags: ["Overhead Stringing", "Shared TNB/TM Poles", "Ladder Work"],
    checks: [
      { label: "Pole base sound / decay check", priority: "high" },
      { label: "Ladder Inspection & 4:1 Securing Verified", priority: "high" },
      { label: "Full Body Harness & Pole Strap Inspected", priority: "high" },
    ],
  },
  "Underground Manhole & Chamber": {
    description: "Fiber pulling, joint box splicing, telco vaults",
    tier: "Critical",
    tags: ["Fiber Pulling", "Joint Box Splicing", "Telco Vault"],
    checks: [
      { label: "Atmospheric gas test pre-check", priority: "high" },
      { label: "Ventilation blower running", priority: "high" },
    ],
  },
  "Solar Installation (TESB)": {
    description: "Rooftop solar PV, inverter mounting, DC stringing",
    tier: "Critical",
    tags: ["Rooftop PV", "Inverter Mounting", "DC Stringing"],
    checks: [
      { label: "Skylift / MEWP DOSH PMA & Operator Competency verified", priority: "high" },
      { label: "100% Tie-off Full Body Harness & Lifeline Rigged", priority: "high" },
      { label: "Fragile roof / skylight barriers verified", priority: "high" },
      { label: "DC isolator LOTO active", priority: "high" },
    ],
  },
  "EV Charger Hub (Charge N Go)": {
    description: "Parking bay EV charger pedestals, power feeder tapping",
    tier: "High",
    tags: ["Charger Pedestal", "Feeder Tapping", "Carpark Works"],
    checks: [
      { label: "Underground CPL utility sweep verified", priority: "high" },
      { label: "Carpark traffic barricading active", priority: "high" },
      { label: "Breaker LOTO confirmed", priority: "high" },
    ],
  },
  "Warehouse & Logistics Hub": {
    description: "Pallet racking, fiber drum yard, forklift operations",
    tier: "Moderate",
    tags: ["Pallet Racking", "Fiber Drum Yard", "Forklift Ops"],
    checks: [
      { label: "Forklift daily inspection signed", priority: "high" },
      { label: "Rack upright load ratings checked", priority: "high" },
      { label: "Pedestrian walkways clear", priority: "standard" },
    ],
  },
  "Substation & DC Power Room": {
    description: "UPS battery banks, rectifiers, switchgear, 48V/415V systems",
    tier: "Critical",
    tags: ["UPS Batteries", "Rectifiers", "Switchgear", "48V / 415V"],
    checks: [
      { label: "Switchgear LOTO & permit-to-work issued", priority: "high" },
      { label: "Battery room ventilation & eyewash available", priority: "high" },
      { label: "Arc-flash PPE worn", priority: "standard" },
    ],
  },
  "Building Risers & MDF": {
    description: "Vertical telecom riser shafts, commercial IDF rooms",
    tier: "Moderate",
    tags: ["Riser Shaft", "MDF / IDF Room", "Commercial Building"],
    checks: [
      { label: "Riser shaft opening guarded", priority: "high" },
      { label: "Building management access permit obtained", priority: "standard" },
      { label: "Fire-stopping reinstated after cabling", priority: "standard" },
    ],
  },
};

const workZones = Object.keys(zoneInfo) as Exclude<WorkZone, "">[];

const tierStyle: Record<Tier, string> = {
  Critical: "bg-destructive/15 border-destructive/40 text-destructive",
  High: "bg-safety-orange/15 border-safety-orange/40 text-safety-orange",
  Moderate: "bg-accent/15 border-accent/40 text-accent",
};

interface WorkZoneSelectorProps {
  value: WorkZone;
  onChange: (zone: WorkZone) => void;
}

const WorkZoneSelector = ({ value, onChange }: WorkZoneSelectorProps) => {
  const info = value ? zoneInfo[value] : null;
  const highCount = info ? info.checks.filter((c) => c.priority === "high").length : 0;
  const isHighRisk = info && info.tier !== "Moderate";

  return (
    <div className="space-y-4">
      <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Operational Work Zone — Context Aware
      </h2>

      <div className="glass rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isHighRisk ? "bg-safety-orange/20 glow-orange" : "bg-secondary/10"}`}>
            <MapPin className={`h-5 w-5 ${isHighRisk ? "text-safety-orange" : "text-secondary"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">Select Asset Work Zone</p>
            <Select value={value} onValueChange={(v) => onChange(v as WorkZone)}>
              <SelectTrigger className="mt-1 bg-muted/50 border-border/50 font-display tracking-wide">
                <SelectValue placeholder="Choose work zone..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {workZones.map((zone) => (
                  <SelectItem key={zone} value={zone} className="font-display tracking-wide">
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {info && (
          <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
            {/* Operational Risk Tier */}
            <div className="glass-strong rounded-xl p-3 border border-secondary/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-secondary" />
                  <span className="clamp-body text-muted-foreground uppercase tracking-wider font-semibold">Operational Risk Tier</span>
                </div>
                <span className={`clamp-body font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tierStyle[info.tier]}`}>
                  {info.tier}
                </span>
              </div>
              <p className="clamp-body text-muted-foreground">{info.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {info.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 clamp-body rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-foreground/80">
                    <Tag className="h-3 w-3 text-secondary" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {isHighRisk && (
              <div className="flex items-center gap-2 rounded-lg bg-safety-orange/10 border border-safety-orange/30 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-safety-orange shrink-0" />
                <p className="clamp-body text-safety-orange font-medium">
                  High-Risk Zone — {highCount} priority checks required
                </p>
              </div>
            )}

            <div className="space-y-2">
              {info.checks.map((item, i) => {
                const isHigh = item.priority === "high";
                const CustomIcon = item.icon;
                const Icon = CustomIcon ?? (isHigh ? ShieldAlert : CheckCircle2);
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${isHigh ? "glass border-safety-orange/30 glow-orange" : "glass"}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${isHigh ? "text-safety-orange" : "text-secondary"}`} />
                    <span className="clamp-body font-medium flex-1 text-foreground">{item.label}</span>
                    {isHigh && (
                      <span className="clamp-body bg-safety-orange/20 text-safety-orange px-2 py-0.5 rounded-full font-display uppercase tracking-wider">
                        Priority
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkZoneSelector;
