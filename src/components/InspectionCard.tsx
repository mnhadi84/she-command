import { useState } from "react";
import { Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Status = "safe" | "unsafe" | "na" | null;

interface InspectionCardProps {
  title: string;
  icon: LucideIcon;
  index: number;
  status: Status;
  onStatusChange: (status: Status) => void;
}

const InspectionCard = ({ title, icon: Icon, index, status, onStatusChange }: InspectionCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = (newStatus: Status) => {
    if (newStatus === "unsafe") {
      setShowConfirm(true);
    } else {
      onStatusChange(newStatus);
    }
  };

  const confirmUnsafe = () => {
    onStatusChange("unsafe");
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className={`glass rounded-xl p-4 transition-all duration-300 border ${
          status === "unsafe" ? "animate-border-glow-red" : status === "safe" ? "glow-green border-safe/30" : "border-transparent"
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-accent/15">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-display clamp-heading font-semibold uppercase tracking-wide text-foreground leading-tight">
            {title}
          </h3>
        </div>

        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => handleToggle("safe")}
            className={`flex-1 rounded-md px-3 min-h-[48px] clamp-body font-semibold uppercase tracking-wider transition-all duration-200 ${
              status === "safe"
                ? "bg-safe text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Safe
          </button>
          <button
            onClick={() => handleToggle("unsafe")}
            className={`flex-1 rounded-md px-3 min-h-[48px] clamp-body font-semibold uppercase tracking-wider transition-all duration-200 ${
              status === "unsafe"
                ? "bg-unsafe text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Unsafe
          </button>
          <button
            onClick={() => handleToggle("na")}
            className={`flex-1 rounded-md px-3 min-h-[48px] clamp-body font-semibold uppercase tracking-wider transition-all duration-200 ${
              status === "na"
                ? "bg-na text-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            N/A
          </button>
        </div>

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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="glass-strong border-primary/30 max-w-[340px] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-primary uppercase tracking-wide">
              Confirm Unsafe
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark <span className="font-semibold text-foreground">{title}</span> as unsafe? This will require a corrective action report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnsafe} className="bg-unsafe hover:bg-unsafe/90">
              Yes, Mark Unsafe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InspectionCard;
