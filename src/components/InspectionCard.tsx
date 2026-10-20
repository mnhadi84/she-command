import { useState } from "react";
import { Camera, ChevronDown, AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "safe" | "unsafe" | "na" | null;

export interface UnsafeDetails {
  severity: string;
  description: string;
  assignTo: string;
}

interface InspectionCardProps {
  title: string;
  icon: LucideIcon;
  index: number;
  status: Status;
  onStatusChange: (status: Status) => void;
  unsafeDetails: UnsafeDetails;
  onUnsafeDetailsChange: (details: UnsafeDetails) => void;
  showValidation: boolean;
}

const severityOptions = ["Low", "Medium", "High", "Critical"];
const assignToOptions = [
  "Sub-con A",
  "Sub-con B",
  "Sub-con C",
  "Construction Manager",
  "Site Engineer",
  "Site Supervisor",
  "Safety Officer",
  "Safety Supervisor",
  "Environmental Officer",
  "Scaffolder",
  "Lifting Supervisor",
  "Machinery Operator",
];

const InspectionCard = ({
  title,
  icon: Icon,
  index,
  status,
  onStatusChange,
  unsafeDetails,
  onUnsafeDetailsChange,
  showValidation,
}: InspectionCardProps) => {
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

  const updateDetail = (field: keyof UnsafeDetails, value: string) => {
    onUnsafeDetailsChange({ ...unsafeDetails, [field]: value });
  };

  const missingFields = status === "unsafe" && showValidation;
  const severityMissing = missingFields && !unsafeDetails.severity;
  const descriptionMissing = missingFields && !unsafeDetails.description.trim();

  return (
    <>
      <div
        className={`glass rounded-xl p-4 transition-all duration-300 border ${
          status === "unsafe" ? "animate-border-glow-red" : status === "safe" ? "glow-green border-safe/30" : "border-transparent"
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-secondary/15 border border-secondary/40">
            <Icon className="h-5 w-5 text-secondary" />
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
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-unsafe" />
              <span className="clamp-body font-display font-semibold uppercase tracking-wider text-unsafe">
                Issue Details
              </span>
            </div>

            {/* Severity */}
            <div>
              <label className="clamp-body font-medium text-muted-foreground mb-1 block">
                Severity <span className="text-unsafe">*</span>
              </label>
              <Select
                value={unsafeDetails.severity}
                onValueChange={(v) => updateDetail("severity", v)}
              >
                <SelectTrigger
                  className={`w-full min-h-[48px] bg-muted/60 border ${
                    severityMissing ? "border-unsafe/60 ring-1 ring-unsafe/40" : "border-border"
                  }`}
                >
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {severityOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="min-h-[44px]">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {severityMissing && (
                <p className="text-unsafe text-xs mt-1">Severity is required</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="clamp-body font-medium text-muted-foreground mb-1 block">
                Description <span className="text-unsafe">*</span>
              </label>
              <textarea
                placeholder="Describe your observation..."
                value={unsafeDetails.description}
                onChange={(e) => updateDetail("description", e.target.value)}
                className={`w-full rounded-md bg-muted/60 border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none ${
                  descriptionMissing ? "border-unsafe/60 ring-1 ring-unsafe/40" : "border-border"
                }`}
                rows={3}
              />
              {descriptionMissing && (
                <p className="text-unsafe text-xs mt-1">Description is required</p>
              )}
            </div>

            {/* Photo Upload */}
            <button className="flex items-center gap-2 rounded-md bg-primary/15 border border-primary/30 px-3 min-h-[48px] text-xs font-medium text-primary hover:bg-primary/25 transition-colors w-full justify-center">
              <Camera className="h-4 w-4" />
              Upload Photo
            </button>

            {/* Assign To */}
            <div>
              <label className="clamp-body font-medium text-muted-foreground mb-1 block">
                Assign To
              </label>
              <Select
                value={unsafeDetails.assignTo}
                onValueChange={(v) => updateDetail("assignTo", v)}
              >
                <SelectTrigger className="w-full min-h-[48px] bg-muted/60 border border-border">
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50 max-h-[240px]">
                  {assignToOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="min-h-[44px]">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
