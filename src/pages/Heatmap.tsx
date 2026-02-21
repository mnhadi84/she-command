import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  Flame,
  TrendingUp,
  Layers,
  Activity,
} from "lucide-react";

type Status = "safe" | "unsafe" | "na" | null;

interface UnsafeDetails {
  severity: string;
  description: string;
  assignTo: string;
}

const STORAGE_KEY = "she-analytics-statuses";
const DETAILS_KEY = "she-analytics-details";

const zoneLayerMap: Record<string, "subsurface" | "ground" | "elevated"> = {
  Tunnel: "subsurface",
  "Underground Station": "subsurface",
  "Ground Level": "ground",
  Elevated: "elevated",
  Viaduct: "elevated",
  "Elevated Station": "elevated",
  "Highrise Building": "elevated",
};

const allZones = [
  "Tunnel",
  "Underground Station",
  "Ground Level",
  "Elevated",
  "Viaduct",
  "Elevated Station",
  "Highrise Building",
];

const layerOrder: Array<{ id: "elevated" | "ground" | "subsurface"; label: string }> = [
  { id: "elevated", label: "Elevated Layer" },
  { id: "ground", label: "Ground Layer" },
  { id: "subsurface", label: "Sub-surface Layer" },
];

const zoneRelevantCategories: Record<string, string[]> = {
  Tunnel: ["Hot Work", "Chemical Handling", "Manual Handling Work", "Housekeeping"],
  "Underground Station": ["Hot Work", "Chemical Handling", "Manual Handling Work", "Housekeeping", "Heavy Lifting Work"],
  "Ground Level": ["Excavation Work", "Heavy Lifting Work", "Manual Handling Work", "Housekeeping", "Hot Work", "Chemical Handling"],
  Elevated: ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Manual Handling Work", "Housekeeping"],
  Viaduct: ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Housekeeping"],
  "Elevated Station": ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Manual Handling Work", "Housekeeping"],
  "Highrise Building": ["Working at Height", "Scaffolding & Temp Structures", "Heavy Lifting Work", "Hot Work", "Manual Handling Work", "Housekeeping", "Chemical Handling"],
};

function getZoneRisk(zone: string, statuses: Record<string, Status>): number {
  const cats = zoneRelevantCategories[zone] || [];
  return cats.filter((c) => statuses[c] === "unsafe").length;
}

function riskColor(count: number): string {
  if (count >= 3) return "from-destructive/80 to-destructive/40 border-destructive/60";
  if (count >= 1) return "from-safety-orange/60 to-safety-orange/30 border-safety-orange/50";
  return "from-secondary/40 to-secondary/20 border-secondary/40";
}

function riskGlow(count: number): string {
  if (count >= 3) return "glow-red";
  if (count >= 1) return "glow-orange";
  return "";
}

function riskLabel(count: number): string {
  if (count >= 3) return "HIGH";
  if (count >= 1) return "MODERATE";
  return "CLEAR";
}

const Heatmap = () => {
  const navigate = useNavigate();

  const statuses: Record<string, Status> = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const details: Record<string, UnsafeDetails> = useMemo(() => {
    try {
      const raw = localStorage.getItem(DETAILS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  // Group zones by layer
  const layers = useMemo(() => {
    return layerOrder.map((layer) => {
      const zones = allZones
        .filter((z) => zoneLayerMap[z] === layer.id)
        .map((z) => ({
          name: z,
          risk: getZoneRisk(z, statuses),
        }));
      return { ...layer, zones };
    });
  }, [statuses]);

  // Top 3 critical risks
  const criticalRisks = useMemo(() => {
    const risks: Array<{ zone: string; category: string; severity: string; description: string }> = [];
    for (const zone of allZones) {
      const cats = zoneRelevantCategories[zone] || [];
      for (const cat of cats) {
        if (statuses[cat] === "unsafe") {
          const d = details[cat] || { severity: "", description: "", assignTo: "" };
          risks.push({
            zone,
            category: cat,
            severity: d.severity || "Unknown",
            description: d.description || "No details provided",
          });
        }
      }
    }
    // Sort by severity (Critical > High > Medium > Low)
    const sevOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Unknown: 4 };
    risks.sort((a, b) => (sevOrder[a.severity] ?? 5) - (sevOrder[b.severity] ?? 5));
    return risks.slice(0, 3);
  }, [statuses, details]);

  const totalUnsafe = Object.values(statuses).filter((s) => s === "unsafe").length;

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 px-4 py-3 flex items-center gap-3 border-b border-border/30">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-accent" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-foreground">
            Executive Safety Heatmap
          </h1>
          <p className="clamp-body text-muted-foreground">
            MRT Line 3 — Real-time Risk Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent animate-pulse" />
          <span className="clamp-body text-accent font-semibold">LIVE</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Main Heatmap */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-5 w-5 text-accent" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              3D Layered Risk Map
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-destructive/70" />
              <span className="clamp-body text-muted-foreground">High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-safety-orange/70" />
              <span className="clamp-body text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-secondary/60" />
              <span className="clamp-body text-muted-foreground">Clear</span>
            </div>
          </div>

          {/* 3D Stacked Layers */}
          <div className="relative" style={{ perspective: "800px" }}>
            <div className="space-y-3" style={{ transformStyle: "preserve-3d" }}>
              {layers.map((layer, layerIdx) => (
                <div
                  key={layer.id}
                  className="relative"
                  style={{
                    transform: `rotateX(12deg) rotateY(-6deg) translateZ(${(2 - layerIdx) * 20}px)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Layer label */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        layer.id === "elevated"
                          ? "bg-accent"
                          : layer.id === "ground"
                          ? "bg-secondary"
                          : "bg-safety-orange"
                      }`}
                    />
                    <span className="font-display clamp-body font-semibold uppercase tracking-wider text-muted-foreground">
                      {layer.label}
                    </span>
                  </div>

                  {/* Zone cards in this layer */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {layer.zones.map((zone) => (
                      <div
                        key={zone.name}
                        className={`glass rounded-xl p-3 bg-gradient-to-br ${riskColor(zone.risk)} ${riskGlow(zone.risk)} transition-all duration-500 hover:scale-[1.03]`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-display clamp-body font-semibold text-foreground truncate">
                            {zone.name}
                          </span>
                          {zone.risk > 0 && (
                            <AlertTriangle
                              className={`h-3.5 w-3.5 flex-shrink-0 ${
                                zone.risk >= 3 ? "text-destructive" : "text-safety-orange"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="clamp-body text-muted-foreground">
                            {zone.risk} issue{zone.risk !== 1 ? "s" : ""}
                          </span>
                          <span
                            className={`clamp-body font-bold uppercase tracking-wider ${
                              zone.risk >= 3
                                ? "text-destructive"
                                : zone.risk >= 1
                                ? "text-safety-orange"
                                : "text-secondary"
                            }`}
                          >
                            {riskLabel(zone.risk)}
                          </span>
                        </div>
                        {/* Risk bar */}
                        <div className="mt-2 h-1 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              zone.risk >= 3
                                ? "bg-destructive"
                                : zone.risk >= 1
                                ? "bg-safety-orange"
                                : "bg-secondary/60"
                            }`}
                            style={{ width: `${Math.min(zone.risk * 20, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Layer separator line */}
                  {layerIdx < layers.length - 1 && (
                    <div className="mt-3 border-t border-dashed border-accent/15" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Global stats bar */}
          <div className="glass rounded-xl p-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-accent" />
              <span className="font-display clamp-heading font-semibold uppercase tracking-wider text-muted-foreground">
                Global Threat Level
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-display text-lg font-bold ${
                  totalUnsafe >= 5
                    ? "text-destructive"
                    : totalUnsafe >= 2
                    ? "text-safety-orange"
                    : "text-secondary"
                }`}
              >
                {totalUnsafe}
              </span>
              <span className="clamp-body text-muted-foreground">active hazards</span>
            </div>
          </div>
        </div>

        {/* Director's Summary Sidebar */}
        <aside className="w-full lg:w-80 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Director's Summary
            </h2>
          </div>

          <div className="glass-strong rounded-xl p-4 border border-destructive/20 space-y-1">
            <p className="clamp-body text-muted-foreground">Top Critical Risks</p>
            <p className="font-display text-2xl font-bold text-foreground">
              {criticalRisks.length}
            </p>
            <p className="clamp-body text-muted-foreground">
              requiring immediate attention
            </p>
          </div>

          {/* Critical risk cards */}
          {criticalRisks.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center">
              <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="clamp-heading font-semibold text-secondary uppercase tracking-wider">
                All Clear
              </p>
              <p className="clamp-body text-muted-foreground mt-1">
                No critical risks detected across the backbone.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalRisks.map((risk, i) => (
                <div
                  key={`${risk.zone}-${risk.category}-${i}`}
                  className="glass rounded-xl p-4 border-l-2 border-destructive/60 hover:border-destructive transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display clamp-heading font-bold uppercase tracking-wider text-foreground">
                      #{i + 1}
                    </span>
                    <span
                      className={`clamp-body font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        risk.severity === "Critical"
                          ? "bg-destructive/20 text-destructive"
                          : risk.severity === "High"
                          ? "bg-safety-orange/20 text-safety-orange"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="clamp-heading font-semibold text-foreground mb-1">
                    {risk.category}
                  </p>
                  <p className="clamp-body text-accent font-medium mb-1">
                    Zone: {risk.zone}
                  </p>
                  <p className="clamp-body text-muted-foreground line-clamp-2">
                    {risk.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendation box */}
          <div className="glass rounded-xl p-4 border border-accent/20">
            <p className="clamp-heading font-semibold text-accent uppercase tracking-wider mb-2">
              AI Recommendation
            </p>
            <p className="clamp-body text-muted-foreground leading-relaxed">
              {totalUnsafe >= 3
                ? "Multiple hazards detected. Recommend an immediate safety stand-down meeting with all zone supervisors."
                : totalUnsafe >= 1
                ? "Active hazards within acceptable thresholds. Ensure corrective actions are assigned and tracked."
                : "All zones are operating within safe parameters. Continue routine inspections."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Heatmap;
