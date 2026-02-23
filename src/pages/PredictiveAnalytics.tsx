import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Wrench, Package, TrendingUp, TrendingDown, AlertTriangle, Brain } from "lucide-react";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface MetricConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  trendData: { day: string; value: number }[];
  current: number;
  trend: "up" | "down" | "flat";
  trendDelta: string;
  preemptiveAction: string;
  riskZone: string;
  riskTime: string;
  severity: "low" | "moderate" | "high";
}

const metrics: Record<string, MetricConfig> = {
  ppe: {
    label: "PPE Compliance",
    icon: ShieldCheck,
    color: "hsl(var(--secondary))",
    current: 96,
    trend: "down",
    trendDelta: "-2.4%",
    trendData: [
      { day: "Mon", value: 98 },
      { day: "Tue", value: 97 },
      { day: "Wed", value: 99 },
      { day: "Thu", value: 95 },
      { day: "Fri", value: 93 },
      { day: "Sat", value: 94 },
      { day: "Sun", value: 96 },
    ],
    preemptiveAction:
      "Heatmap shows compliance drops near Zone B after 3:00 PM — recommend supervisor presence and a toolbox talk at 2:45 PM shift handover.",
    riskZone: "Zone B — Elevated Slab",
    riskTime: "15:00 – 17:00",
    severity: "moderate",
  },
  machine: {
    label: "Machine Health",
    icon: Wrench,
    color: "hsl(var(--safety-orange))",
    current: 82,
    trend: "down",
    trendDelta: "-5.1%",
    trendData: [
      { day: "Mon", value: 89 },
      { day: "Tue", value: 87 },
      { day: "Wed", value: 85 },
      { day: "Thu", value: 84 },
      { day: "Fri", value: 80 },
      { day: "Sat", value: 81 },
      { day: "Sun", value: 82 },
    ],
    preemptiveAction:
      "Vibration anomaly detected on Excavator EX-04. Predictive model indicates 73% probability of hydraulic seal failure within 48 hours — schedule preventive maintenance before Wednesday shift.",
    riskZone: "Zone C — Excavation Pit",
    riskTime: "All day",
    severity: "high",
  },
  material: {
    label: "Material Certification",
    icon: Package,
    color: "hsl(var(--accent))",
    current: 91,
    trend: "up",
    trendDelta: "+1.8%",
    trendData: [
      { day: "Mon", value: 88 },
      { day: "Tue", value: 89 },
      { day: "Wed", value: 88 },
      { day: "Thu", value: 90 },
      { day: "Fri", value: 91 },
      { day: "Sat", value: 91 },
      { day: "Sun", value: 91 },
    ],
    preemptiveAction:
      "Grade 40 concrete batch #2247 from Supplier Delta passes all ESG source certifications. Recommend maintaining this supplier for next pour cycle — no action required.",
    riskZone: "Zone A — Concrete Pour",
    riskTime: "N/A",
    severity: "low",
  },
};

const severityColor = (s: string) =>
  s === "high"
    ? "text-primary border-primary/30 bg-primary/5"
    : s === "moderate"
    ? "text-safety-orange border-safety-orange/30 bg-safety-orange/5"
    : "text-secondary border-secondary/30 bg-secondary/5";

const severityLabel = (s: string) =>
  s === "high" ? "High Risk" : s === "moderate" ? "Moderate" : "Low Risk";

const PredictiveAnalytics = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const metricKey = params.get("metric") || "ppe";
  const config = metrics[metricKey] || metrics.ppe;
  const Icon = config.icon;

  const trendIcon =
    config.trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-secondary" />
    ) : config.trend === "down" ? (
      <TrendingDown className="h-4 w-4 text-primary" />
    ) : null;

  return (
    <div className="min-h-screen bg-background grid-pattern flex justify-center">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="glass-strong px-4 py-3 flex items-center gap-3 border-b border-border/30">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center border border-border/20 hover:border-accent/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-accent" />
          </button>
          <div className="flex-1">
            <h1 className="font-display clamp-heading font-bold uppercase tracking-[0.12em] text-foreground">
              Predictive Analytics
            </h1>
            <p className="clamp-body text-muted-foreground">AI-driven trend analysis</p>
          </div>
          <Brain className="h-5 w-5 text-accent animate-pulse" />
        </div>

        <main className="px-4 py-6 pb-20 space-y-5">
          {/* Metric Header */}
          <div className="glass rounded-xl p-4 border border-border/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center border border-accent/20">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-display clamp-heading font-bold text-foreground uppercase tracking-wider">
                {config.label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-display text-2xl font-bold text-foreground">
                  {config.current}%
                </span>
                <div className="flex items-center gap-1">
                  {trendIcon}
                  <span
                    className={`clamp-body font-semibold ${
                      config.trend === "up" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {config.trendDelta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="space-y-2">
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              7-Day Trend
            </h2>
            <div className="glass rounded-xl p-4 border border-border/20">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={config.trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 3"]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value}%`, config.label]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={config.color}
                    strokeWidth={2.5}
                    fill="url(#trendGrad)"
                    dot={{ r: 3, fill: config.color, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: config.color, strokeWidth: 2, fill: "hsl(var(--background))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Context */}
          <div className="space-y-2">
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Risk Context
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3 border border-border/20">
                <p className="clamp-body text-muted-foreground mb-1">Zone</p>
                <p className="clamp-body font-semibold text-foreground">{config.riskZone}</p>
              </div>
              <div className="glass rounded-xl p-3 border border-border/20">
                <p className="clamp-body text-muted-foreground mb-1">Peak Risk Window</p>
                <p className="clamp-body font-semibold text-foreground">{config.riskTime}</p>
              </div>
            </div>
            <div
              className={`rounded-xl p-3 border flex items-center gap-2 ${severityColor(config.severity)}`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="clamp-body font-bold uppercase tracking-wider">
                {severityLabel(config.severity)}
              </span>
            </div>
          </div>

          {/* AI Pre-emptive Action */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                AI Pre-emptive Action
              </h2>
            </div>
            <div className="glass rounded-xl p-4 border border-accent/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-full" />
              <p className="clamp-body text-foreground leading-relaxed pl-3">
                {config.preemptiveAction}
              </p>
            </div>
          </div>

          {/* Navigation between metrics */}
          <div className="space-y-2">
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Other Metrics
            </h2>
            <div className="flex gap-2">
              {Object.entries(metrics)
                .filter(([key]) => key !== metricKey)
                .map(([key, m]) => {
                  const MIcon = m.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => navigate(`/predictive?metric=${key}`)}
                      className="flex-1 glass rounded-xl p-3 border border-border/20 hover:border-accent/30 transition-all flex flex-col items-center gap-2"
                    >
                      <MIcon className="h-4 w-4 text-accent" />
                      <span className="clamp-body font-semibold text-foreground text-center">
                        {m.label}
                      </span>
                      <span className="font-display text-sm font-bold text-muted-foreground">
                        {m.current}%
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
