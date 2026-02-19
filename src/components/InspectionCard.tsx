import { useState } from "react";
import { Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Status = "safe" | "unsafe" | "na" | null;

interface InspectionCardProps {
  title: string;
  icon: LucideIcon;
  index: number;
}

const InspectionCard = ({ title, icon: Icon, index }: InspectionCardProps) => {
  const [status, setStatus] = useState<Status>(null);

  const glowClass =
    status === "safe" ? "glow-green" : status === "unsafe" ? "glow-red" : "";

  const borderClass =
    status === "safe"
      ? "border-safe/30"
      : status === "unsafe"
      ? "border-unsafe/30"
      : "border-transparent";

  return (
    <div
      className={`glass rounded-xl p-4 transition-all duration-300 ${glowClass} border ${borderClass}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground leading-tight">
          {title}
        </h3>
      </div>

      {/* Three-way toggle */}
      <div className="flex gap-1.5 mb-3">
        <button
          onClick={() => setStatus("safe")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            status === "safe"
              ? "bg-safe text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Safe
        </button>
        <button
          onClick={() => setStatus("unsafe")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            status === "unsafe"
              ? "bg-unsafe text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Unsafe
        </button>
        <button
          onClick={() => setStatus("na")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            status === "na"
              ? "bg-na text-foreground shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          N/A
        </button>
      </div>

      {/* Unsafe expanded section */}
      {status === "unsafe" && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <textarea
            placeholder="Describe the hazard..."
            className="w-full rounded-md bg-muted/60 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={2}
          />
          <button className="flex items-center gap-2 rounded-md bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25 transition-colors">
            <Camera className="h-3.5 w-3.5" />
            Add Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default InspectionCard;
