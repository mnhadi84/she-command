export interface Finding {
  label: string;
  confidence: number;
  status: "pass" | "warning" | "fail";
  metricKey: "ppe" | "electrical" | "fiber";
  riskForecast: string;
  riskDelta: number;
  recommendation: string;
}

export interface AnalysisResult {
  findings: Finding[];
  source: "gemini" | "simulated";
  message: string;
}

export const simulatedFindings: Finding[] = [
  { label: "PPE & Fall Arrest Compliance", confidence: 96, status: "pass", metricKey: "ppe", riskForecast: "Example only: slip/trip risk during afternoon squall", riskDelta: 12, recommendation: "SOP 2.1 — Height Safety: Verify 100% tie-off on vertical lifelines and ensure helmet chin straps are buckled on ladders and skylifts." },
  { label: "Solar DC & EV Electrical Isolation (LOTO)", confidence: 84, status: "warning", metricKey: "electrical", riskForecast: "Example only: stored energy risk from unverified DC isolator tag", riskDelta: 24, recommendation: "SOP 3.4 — Stored Energy Isolation: Verify LOTO lockout tag on TESB solar string isolator and Charge N Go feeder breaker before contact." },
  { label: "Fiber Workstation & Shard Containment", confidence: 92, status: "pass", metricKey: "fiber", riskForecast: "Example only: fiber shard eye/puncture hazard", riskDelta: 5, recommendation: "SOP 7.2 — Optical Safety: Verify a dedicated fiber cleave shard container. Ensure optical laser source is deactivated prior to inspection." },
];

export function fallback(message: string): AnalysisResult {
  return { findings: simulatedFindings, source: "simulated", message };
}

// Google may report confidence as a 0-1 fraction or a 0-100 percentage. Render both as whole percentages.
export function normalizeConfidence(value: number): number {
  const percent = value <= 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export function parseFindings(value: unknown): Finding[] {
  if (!Array.isArray(value) || value.length > 8) throw new Error("Invalid findings");
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid finding");
    const f = item as Record<string, unknown>;
    for (const key of ["label", "riskForecast", "recommendation"]) {
      if (typeof f[key] !== "string" || !(f[key] as string).trim() || (f[key] as string).length > 1500) throw new Error("Invalid finding text");
    }
    if (!["pass", "warning", "fail"].includes(String(f.status)) || !["ppe", "electrical", "fiber"].includes(String(f.metricKey))) throw new Error("Invalid finding category");
    if (typeof f.confidence !== "number" || !Number.isFinite(f.confidence) || f.confidence < 0 || f.confidence > 100) throw new Error("Invalid confidence");
    if (typeof f.riskDelta !== "number" || !Number.isFinite(f.riskDelta) || f.riskDelta < 0 || f.riskDelta > 100) throw new Error("Invalid risk");
    return { label: f.label as string, confidence: normalizeConfidence(f.confidence), status: f.status as Finding["status"], metricKey: f.metricKey as Finding["metricKey"], riskForecast: f.riskForecast as string, riskDelta: f.riskDelta, recommendation: f.recommendation as string };
  });
}

export function validatePhoto(value: unknown): { image: string; mimeType: string } | null {
  if (!value || typeof value !== "object") return null;
  const { image, mimeType } = value as Record<string, unknown>;
  if (typeof image !== "string" || image.length < 16 || image.length > 8_000_000 || image.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) return null;
  if (typeof mimeType !== "string" || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return null;
  return { image, mimeType };
}