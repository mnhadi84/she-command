import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ScanLine, ShieldCheck, Wrench, Package, CheckCircle2, Loader2, ChevronRight } from "lucide-react";

type AnalysisPhase = "idle" | "scanning" | "detecting" | "complete";

interface DetectedItem {
  label: string;
  confidence: number;
  icon: React.ElementType;
  status: "pass" | "warning" | "fail";
  metricKey: string;
}

const mockResults: DetectedItem[] = [
  { label: "PPE Compliance", confidence: 96, icon: ShieldCheck, status: "pass", metricKey: "ppe" },
  { label: "Machine Health", confidence: 82, icon: Wrench, status: "warning", metricKey: "machine" },
  { label: "Material Type: Grade 40 Concrete", confidence: 91, icon: Package, status: "pass", metricKey: "material" },
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
        <div className="space-y-2 animate-in slide-in-from-bottom-3 fade-in duration-500">
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
            return (
              <button
                key={i}
                onClick={() => navigate(`/predictive?metric=${item.metricKey}`)}
                className={`glass rounded-xl p-3.5 flex items-center gap-3 border ${borderColor} hover:border-accent/30 transition-all duration-300 w-full text-left group`}
              >
                <div className="w-9 h-9 rounded-lg glass-strong flex items-center justify-center border border-border/30">
                  <Icon className={`h-4 w-4 ${statusColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="clamp-body font-semibold text-foreground">{item.label}</p>
                  <p className="clamp-body text-muted-foreground/70 text-[10px] uppercase tracking-wider">Tap for trend →</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-display text-sm font-bold ${statusColor}`}>
                    {item.confidence}%
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickCapture;
