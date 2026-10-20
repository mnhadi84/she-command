import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ScanLine, ShieldCheck, Zap, Cable, CheckCircle2, Loader2, ChevronRight, TrendingUp, AlertTriangle, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { preparePhoto } from "@/lib/camera-photo";
import { fallback, parseFindings, type AnalysisResult, type Finding } from "../../supabase/functions/analyze-site-photo/contract";

type AnalysisPhase = "idle" | "scanning" | "detecting" | "complete";

const findingIcons = { ppe: ShieldCheck, electrical: Zap, fiber: Cable };

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
  const [results, setResults] = useState<Finding[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => { requestRef.current?.abort(); }, []);

  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  const openCamera = () => fileRef.current?.click();

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(f));
    void handleCapture(f);
  };

  const handleCapture = async (file: File) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30_000);
    setPhase("scanning");
    setResults([]);
    setAnalysis(null);
    let response: AnalysisResult;
    try {
      const photoInput = await preparePhoto(file);
      setPhase("detecting");
      const { data, error } = await supabase.functions.invoke("analyze-site-photo", { body: photoInput, signal: controller.signal });
      if (error) throw new Error("Analysis unavailable");
      if (!data || !["gemini", "simulated"].includes(data.source) || typeof data.message !== "string") throw new Error("Invalid analysis");
      response = { findings: parseFindings(data.findings), source: data.source, message: data.message };
    } catch {
      response = fallback(controller.signal.aborted ? "Photo analysis timed out. Simulated examples only; this photo has not been analyzed." : "Photo analysis is unavailable. Simulated examples only; this photo has not been analyzed.");
    } finally { clearTimeout(timeout); }
    if (requestRef.current !== controller) return;
    setAnalysis(response);
    setResults(response.findings);
    setPhase("complete");
  };

  const reset = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setPhase("idle");
    setResults([]);
    setAnalysis(null);
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(null);
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
      <Button variant="ghost"
        onClick={phase === "complete" ? reset : openCamera}
        disabled={phase !== "idle" && phase !== "complete"}
        className={`w-full h-auto min-h-14 whitespace-normal rounded-xl p-4 flex items-center justify-center gap-3 font-display clamp-heading font-semibold uppercase tracking-wider transition-all duration-500 ${
          phase === "idle"
            ? "glass border border-secondary/30 text-secondary hover:border-secondary/50 hover:shadow-[0_0_30px_hsla(var(--glow-brand)/0.2)]"
            : phase === "complete"
            ? "glass border border-secondary/30 text-secondary glow-green"
            : "glass border border-secondary/20 text-secondary/60"
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
            {phase === "scanning" ? "Capturing Image..." : "Analyzing site hazards with Gemini..."}
          </>
        )}
        {phase === "complete" && (
          <>
            <CheckCircle2 className="h-5 w-5" />
            {analysis?.source === "simulated" ? "Simulated Examples — Tap to Reset" : "Analysis Complete — Tap to Reset"}
          </>
        )}
      </Button>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />

      {photo && (
        <div className="relative overflow-hidden rounded-xl border border-secondary/20">
          <img src={photo} alt="Captured site photo" className="w-full max-h-64 object-cover" />
          {phase !== "complete" && (
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
              <ScanLine className="h-12 w-12 text-secondary animate-pulse" />
            </div>
          )}
          <div className="absolute top-2 right-2 rounded-full glass-strong px-2 py-1">
            <AIStatusLight phase={phase} />
          </div>
        </div>
      )}

      {/* Analysis Animation */}
      {(phase === "scanning" || phase === "detecting") && (
        <div className="glass rounded-xl p-6 border border-secondary/20 animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl glass-strong flex items-center justify-center border border-secondary/30">
              <ScanLine className="h-10 w-10 text-secondary animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-secondary/40 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">
                {phase === "scanning" ? "Capturing Site Image" : "Analyzing site hazards with Gemini..."}
              </p>
              <p className="clamp-body text-muted-foreground mt-1">
                {phase === "scanning"
                  ? "Preparing image for analysis"
                  : "Detecting PPE, LOTO isolation & fiber containment"}
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
      {phase === "complete" && analysis && (
        <div role="status" className={`rounded-lg border p-3 clamp-body ${analysis.source === "simulated" ? "border-safety-orange/40 text-safety-orange bg-safety-orange/10" : "border-secondary/30 text-secondary bg-secondary/5"}`}>
          <p className="font-semibold">{analysis.source === "simulated" ? "SIMULATED — NOT PHOTO FINDINGS" : "LIVE GOOGLE GEMINI FINDINGS"}</p>
          <p className="mt-1">{analysis.message}</p>
          {analysis.source === "gemini" && results.length === 0 && <p>No visible hazards identified; this is not site safety clearance.</p>}
        </div>
      )}
      {phase === "complete" && results.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-bottom-3 fade-in duration-500">
          {results.map((item, i) => {
            const Icon = findingIcons[item.metricKey];
            const statusColor =
              item.status === "pass"
                ? "text-safe"
                : item.status === "warning"
                ? "text-safety-orange"
                : "text-primary";
            const borderColor =
              item.status === "pass"
                ? "border-safe/30 glow-green"
                : item.status === "warning"
                ? "border-safety-orange/20"
                : "border-primary/20";
            const riskColor = item.riskDelta >= 20 ? "text-primary" : item.riskDelta >= 12 ? "text-safety-orange" : "text-secondary";
            return (
              <div key={i} className={`glass rounded-xl border ${borderColor} overflow-hidden`}>
                {/* Detection Header — clickable to trend page */}
                <Button variant="ghost"
                  onClick={() => navigate(`/predictive?metric=${item.metricKey}`)}
                  className="w-full h-auto whitespace-normal p-3.5 flex items-center gap-3 hover:bg-secondary/5 transition-all duration-300 text-left group"
                >
                  <div className="w-9 h-9 rounded-lg glass-strong flex items-center justify-center border border-border/30 shrink-0">
                    <Icon className={`h-4 w-4 ${statusColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="clamp-body font-semibold text-foreground">{item.label}</p>
                    <p className="clamp-body text-muted-foreground/70 text-[10px] uppercase tracking-wider">Illustrative trend →</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-display text-sm font-bold ${statusColor}`}>
                      {item.confidence}%
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </div>
                </Button>

                {/* Predictive Risk Forecast */}
                <div className="px-3.5 pb-2">
                  <div className="rounded-lg bg-muted/40 border border-border/20 p-2.5 flex items-start gap-2.5">
                    <TrendingUp className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${riskColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="clamp-body text-muted-foreground/60 uppercase tracking-wider font-medium mb-0.5 text-[9px]">Predictive Risk Forecast</p>
                      <p className="clamp-body text-foreground/80 leading-snug">{item.riskForecast}</p>
                      {analysis?.source === "simulated" && <div className="mt-1.5 flex items-center gap-1.5">
                        <AlertTriangle className={`h-3 w-3 ${riskColor}`} />
                        <span className={`font-display text-[11px] font-bold ${riskColor}`}>Example only: +{item.riskDelta}%</span>
                      </div>}
                    </div>
                  </div>
                </div>

                {/* Pre-emptive Safety Directive */}
                <div className="px-3.5 pb-3">
                  <div className="rounded-lg bg-secondary/5 border border-secondary/15 p-2.5 flex items-start gap-2.5">
                    <ClipboardCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-secondary" />
                    <div className="flex-1 min-w-0">
                      <p className="clamp-body text-secondary/60 uppercase tracking-wider font-medium mb-0.5 text-[9px]">Pre-emptive Safety Directive</p>
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
