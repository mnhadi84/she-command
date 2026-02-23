import { MapPin, AlertTriangle, Wind, ShieldAlert, HardHat, CheckCircle2, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WorkZone =
  | "Tunnel"
  | "Underground Station"
  | "Ground Level"
  | "Elevated"
  | "Viaduct"
  | "Elevated Station"
  | "Highrise Building"
  | "";

interface ChecklistItem {
  label: string;
  icon: React.ElementType;
  priority: "high" | "standard";
}

const zoneChecklists: Record<string, ChecklistItem[]> = {
  Viaduct: [
    { label: "Fall Protection Harness Inspection", icon: ShieldAlert, priority: "high" },
    { label: "Wind Speed Monitoring (Max 40 km/h)", icon: Wind, priority: "high" },
    { label: "Guardrail Integrity Check", icon: ShieldAlert, priority: "high" },
    { label: "Lifeline Anchor Points Verified", icon: CheckCircle2, priority: "standard" },
    { label: "Emergency Rescue Plan Briefed", icon: AlertTriangle, priority: "high" },
  ],
  Elevated: [
    { label: "Fall Protection Equipment Check", icon: ShieldAlert, priority: "high" },
    { label: "Scaffolding Tag Verification", icon: HardHat, priority: "standard" },
    { label: "Edge Protection Installed", icon: ShieldAlert, priority: "high" },
    { label: "Tool Tethering Enforced", icon: CheckCircle2, priority: "standard" },
  ],
  "Elevated Station": [
    { label: "Fall Protection Compliance", icon: ShieldAlert, priority: "high" },
    { label: "Wind Speed Monitoring", icon: Wind, priority: "high" },
    { label: "Platform Edge Protection", icon: ShieldAlert, priority: "standard" },
    { label: "Material Hoist Safety Check", icon: HardHat, priority: "standard" },
  ],
  "Highrise Building": [
    { label: "Fall Protection at All Levels", icon: ShieldAlert, priority: "high" },
    { label: "Crane Exclusion Zone Active", icon: AlertTriangle, priority: "high" },
    { label: "Wind Speed Monitoring (Tower Crane)", icon: Wind, priority: "high" },
    { label: "Perimeter Netting Inspection", icon: CheckCircle2, priority: "standard" },
  ],
  Tunnel: [
    { label: "Ventilation System Operational", icon: Wind, priority: "high" },
    { label: "Gas Detection Monitoring", icon: AlertTriangle, priority: "high" },
    { label: "Emergency Evacuation Route Clear", icon: ShieldAlert, priority: "standard" },
    { label: "TBM Safety Perimeter Checked", icon: HardHat, priority: "standard" },
  ],
  "Underground Station": [
    { label: "Confined Space Permit Valid", icon: AlertTriangle, priority: "high" },
    { label: "Air Quality Monitoring Active", icon: Wind, priority: "high" },
    { label: "Emergency Lighting Functional", icon: CheckCircle2, priority: "standard" },
    { label: "Dewatering System Checked", icon: HardHat, priority: "standard" },
  ],
  "Ground Level": [
    { label: "Traffic Management Plan Active", icon: AlertTriangle, priority: "standard" },
    { label: "Excavation Barricades in Place", icon: ShieldAlert, priority: "standard" },
    { label: "Underground Utility Detection", icon: CheckCircle2, priority: "standard" },
  ],
};

const workZones: WorkZone[] = [
  "Tunnel",
  "Underground Station",
  "Ground Level",
  "Elevated",
  "Viaduct",
  "Elevated Station",
  "Highrise Building",
];

// Elevation data relative to site datum (0.000m = Ground Level)
const zoneElevation: Record<string, { elevation: number; label: string }> = {
  Tunnel: { elevation: -25, label: "-25.0m" },
  "Underground Station": { elevation: -15, label: "-15.0m" },
  "Ground Level": { elevation: 0, label: "±0.0m" },
  Elevated: { elevation: 12, label: "+12.0m" },
  Viaduct: { elevation: 18, label: "+18.0m" },
  "Elevated Station": { elevation: 22, label: "+22.0m" },
  "Highrise Building": { elevation: 45, label: "+45.0m" },
};

// All zones ordered by elevation for the Z-axis diagram
const elevationOrder: WorkZone[] = [
  "Highrise Building",
  "Elevated Station",
  "Viaduct",
  "Elevated",
  "Ground Level",
  "Underground Station",
  "Tunnel",
];

const ZAxisIndicator = ({ activeZone }: { activeZone: WorkZone }) => {
  return (
    <div className="glass-strong rounded-xl p-3 border border-accent/10">
      <div className="flex items-center gap-2 mb-3">
        <ArrowUpDown className="h-3.5 w-3.5 text-accent" />
        <span className="clamp-body text-muted-foreground uppercase tracking-wider font-semibold">
          Z-Axis · Site Datum ±0.0m
        </span>
      </div>
      <div className="relative flex flex-col gap-0.5">
        {elevationOrder.map((zone) => {
          const data = zoneElevation[zone];
          const isActive = zone === activeZone;
          const isAbove = data.elevation > 0;
          const isBelow = data.elevation < 0;

          return (
            <div
              key={zone}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-500 ${
                isActive
                  ? "glass border border-accent/40 shadow-[0_0_12px_hsla(var(--glow-blue)/0.15)]"
                  : "border border-transparent"
              }`}
            >
              {/* Elevation label */}
              <span
                className={`font-display text-xs font-bold tabular-nums w-14 text-right ${
                  isActive
                    ? "text-accent"
                    : isAbove
                    ? "text-safety-orange/60"
                    : isBelow
                    ? "text-accent/40"
                    : "text-muted-foreground/60"
                }`}
              >
                {data.label}
              </span>

              {/* Vertical line marker */}
              <div className="relative flex items-center w-4 justify-center">
                <div
                  className={`h-6 w-px ${
                    data.elevation === 0 ? "bg-muted-foreground/60" : "bg-border/40"
                  }`}
                />
                <div
                  className={`absolute h-2 w-2 rounded-full transition-all duration-500 ${
                    isActive
                      ? "bg-accent scale-125 shadow-[0_0_8px_hsla(var(--glow-blue)/0.4)]"
                      : data.elevation === 0
                      ? "bg-muted-foreground/50 h-1.5 w-1.5"
                      : "bg-border/50 h-1 w-1"
                  }`}
                />
              </div>

              {/* Zone name */}
              <span
                className={`clamp-body truncate transition-colors duration-300 ${
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground/50"
                }`}
              >
                {zone}
              </span>

              {/* Datum label */}
              {data.elevation === 0 && (
                <span className="clamp-body text-muted-foreground/40 font-display uppercase tracking-wider ml-auto">
                  Datum
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface WorkZoneSelectorProps {
  value: WorkZone;
  onChange: (zone: WorkZone) => void;
}

const WorkZoneSelector = ({ value, onChange }: WorkZoneSelectorProps) => {
  const checklist = value ? zoneChecklists[value] || [] : [];
  const highPriorityCount = checklist.filter((c) => c.priority === "high").length;
  const isHighRisk = ["Viaduct", "Elevated", "Elevated Station", "Highrise Building"].includes(value);

  return (
    <div className="space-y-4">
      <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Work Zone — Context Aware
      </h2>

      <div className="glass rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isHighRisk && value ? "bg-safety-orange/20 glow-orange" : "bg-accent/10"}`}>
            <MapPin className={`h-5 w-5 ${isHighRisk && value ? "text-safety-orange" : "text-accent"}`} />
          </div>
          <div className="flex-1">
            <p className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">Select Active Zone</p>
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

        {/* Z-Axis Elevation Indicator */}
        <ZAxisIndicator activeZone={value} />

        {value && (
          <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
            {/* Zone Alert Banner */}
            {isHighRisk && (
              <div className="flex items-center gap-2 rounded-lg bg-safety-orange/10 border border-safety-orange/30 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-safety-orange shrink-0" />
                <p className="clamp-body text-safety-orange font-medium">
                  High-Risk Zone — {highPriorityCount} priority checks required
                </p>
              </div>
            )}

            {/* Checklist Cards */}
            <div className="space-y-2">
              {checklist.map((item, i) => {
                const Icon = item.icon;
                const isHigh = item.priority === "high";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      isHigh
                        ? "glass border-safety-orange/30 glow-orange"
                        : "glass"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isHigh ? "text-safety-orange" : "text-accent"}`} />
                    <span className={`clamp-body font-medium flex-1 ${isHigh ? "text-safety-orange-foreground" : "text-foreground"}`}>
                      {item.label}
                    </span>
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
