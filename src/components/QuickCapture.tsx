import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ScanLine, ShieldCheck, Wrench, Package, CheckCircle2, Loader2, ChevronRight, TrendingUp, AlertTriangle, ClipboardCheck } from "lucide-react";

type AnalysisPhase = "idle" | "scanning" | "detecting" | "complete";

interface DetectedItem {
  label: string;
  confidence: number;
  icon: React.ElementType;
  status: "pass" | "warning" | "fail";
  metricKey: string;
  riskForecast: string;
  riskDelta: number;
  recommendation: string;
}

const mockResults: DetectedItem[] = [
  { label: "PPE Compliance", confidence: 96, icon: ShieldCheck, status: "pass", metricKey: "ppe", riskForecast: "Trip hazard probability +15% due to current rainfall levels", riskDelta: 15, recommendation: "SOP 4.2 — Slip & Fall Prevention: Deploy slip-resistant matting at Zone B entry points and increase supervisor walkthroughs between 14:00–16:00." },
  { label: "Machine Health", confidence: 82, icon: Wrench, status: "warning", metricKey: "machine", riskForecast: "Hydraulic failure risk +22% — vibration anomaly detected", riskDelta: 22, recommendation: "SOP 6.1 — Mechanical Isolation & Hydraulic Inspection: Isolate Crane #3 for immediate hydraulic inspection. Schedule predictive maintenance within 4 hours." },
  { label: "Material Type: Grade 40 Concrete", confidence: 91, icon: Package, status: "pass", metricKey: "material", riskForecast: "Curing integrity risk +8% due to ambient humidity drop", riskDelta: 8, recommendation: "SOP 5.3 — Concrete Curing & Moisture Verification: Apply curing compound to freshly poured slabs and verify moisture retention at 2-hour intervals." },
];

const AIStatusLight = ({ phase }: { phase: AnalysisPhase }) => {
  const isActive = phase === "scanning" || phase === "detecting";
  const isDone = phase === "complete";

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        {isActive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-colors duration-500 ${
            isActive ? "bg-secondary" : isDone ? "bg-secondary/60" : "bg-muted-foreground/40"
          }`}
        />
      </span>
      <span className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">
        {isActive ? "Processing" : isDone ? "Ready" : "Standby"}
      </span>
    </div>
  );
};

const QuickCapture = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [results, setResults] = useState<DetectedItem[]>([]);

  const handleCapture = () => {
    setPhase("scanning");
    setResults([]);
    setTimeout(() => setPhase("detecting"), 1400);
    setTimeout(() => {
      setResults(mockResults);
      setPhase("complete");
    }, 3200);
  };

  const reset = () => {
    setPhase("idle");
    setResults([]);
  };

  return (
    <div className="space-y-3">
      {/* AI Status Header */}
      <div className="flex items-center justify-between">
        <span className="font-display clamp-heading font-semibold uppercase tracking-wider text-muted-foreground">
          AI Camera
        </span>
        <AIStatusLight phase={phase} />
      </div>

      {/* Capture Button */}
      <button
        onClick={phase === "complete" ? reset : handleCapture}
        disabled={phase !== "idle" && phase !== "complete"}
        className={`w-full rounded-xl p-4 flex items-center justify-center gap-3 font-display clamp-heading font-semibold uppercase tracking-wider transition-all duration-500 ${
          phase === "idle"
            ? "glass border border-accent/30 text-accent hover:border-accent/50 hover:shadow-[0_0_30px_hsla(var(--glow-blue)/0.2)]"
            : phase === "complete"
            ? "glass border border-secondary/30 text-secondary glow-green"
            : "glass border border-accent/20 text-accent/60"
        }`}
      >
        {phase === "idle" && (
          <>
            <Camera className="h-5 w-5" />
            Quick Capture — AI Inspect
          </>
        )}
        {(phase === "scanning" || phase === "detecting") && (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {phase === "scanning" ? "Capturing Image..." : "AI Analyzing..."}
          </>
        )}
        {phase === "complete" && (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Analysis Complete — Tap to Reset
          </>
        )}
      </button>

      {/* Analysis Animation */}
      {(phase === "scanning" || phase === "detecting") && (
        <div className="glass rounded-xl p-6 border border-accent/20 animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl glass-strong flex items-center justify-center border border-accent/30">
              <ScanLine className="h-10 w-10 text-accent animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-accent/40 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">
                {phase === "scanning" ? "Capturing Site Image" : "AI Analyzing..."}
              </p>
              <p className="clamp-body text-muted-foreground mt-1">
                {phase === "scanning"
                  ? "Preparing image for analysis"
                  : "Detecting PPE, machine health & materials"}
              </p>
            </div>
            <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-secondary transition-all duration-[3000ms] ease-out"
                style={{ width: phase === "scanning" ? "40%" : "85%" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === "complete" && results.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-bottom-3 fade-in duration-500">
          {results.map((item, i) => {
            const Icon = item.icon;
            const statusColor =
              item.status === "pass"
                ? "text-secondary"
                : item.status === "warning"
                ? "text-safety-orange"
                : "text-primary";
            const borderColor =
              item.status === "pass"
                ? "border-secondary/20"
                : item.status === "warning"
                ? "border-safety-orange/20"
                : "border-primary/20";
            const riskColor = item.riskDelta >= 20 ? "text-primary" : item.riskDelta >= 12 ? "text-safety-orange" : "text-secondary";
            return (
              <div key={i} className={`glass rounded-xl border ${borderColor} overflow-hidden`}>
                {/* Detection Header — clickable to trend page */}
                <button
                  onClick={() => navigate(`/predictive?metric=${item.metricKey}`)}
                  className="w-full p-3.5 flex items-center gap-3 hover:bg-accent/5 transition-all duration-300 text-left group"
                >
                  <div className="w-9 h-9 rounded-lg glass-strong flex items-center justify-center border border-border/30 shrink-0">
                    <Icon className={`h-4 w-4 ${statusColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="clamp-body font-semibold text-foreground">{item.label}</p>
                    <p className="clamp-body text-muted-foreground/70 text-[10px] uppercase tracking-wider">Tap for 7-day trend →</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-display text-sm font-bold ${statusColor}`}>
                      {item.confidence}%
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </button>

                {/* Predictive Risk Forecast */}
                <div className="px-3.5 pb-2">
                  <div className="rounded-lg bg-muted/40 border border-border/20 p-2.5 flex items-start gap-2.5">
                    <TrendingUp className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${riskColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="clamp-body text-muted-foreground/60 uppercase tracking-wider font-medium mb-0.5 text-[9px]">Predictive Risk Forecast</p>
                      <p className="clamp-body text-foreground/80 leading-snug">{item.riskForecast}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <AlertTriangle className={`h-3 w-3 ${riskColor}`} />
                        <span className={`font-display text-[11px] font-bold ${riskColor}`}>+{item.riskDelta}% risk increase</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pre-emptive Safety Directive */}
                <div className="px-3.5 pb-3">
                  <div className="rounded-lg bg-accent/5 border border-accent/15 p-2.5 flex items-start gap-2.5">
                    <ClipboardCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="clamp-body text-accent/60 uppercase tracking-wider font-medium mb-0.5 text-[9px]">Pre-emptive Safety Directive</p>
                      <p className="clamp-body text-foreground/80 leading-snug">{item.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickCapture;
