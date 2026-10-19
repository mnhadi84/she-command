import { useState } from "react";
import {
  Leaf,
  Recycle,
  PackageCheck,
  Trash2,
  Fuel,
  Zap,
  Droplets,
  CloudRain,
  Factory,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ESGValues {
  sourceCert: string;
  disposalChain: string;
  dieselEfficiency: string;
  energySaver: string;
  renewableWaterRatio: string;
  municipalWater: string;
  co2Impact: string;
  machineryHours: string;
  solarOffset: string;
  fiberRecycling: string;
  batteryReclaim: string;
}

export const emptyESG = (): ESGValues => ({
  sourceCert: "",
  disposalChain: "",
  dieselEfficiency: "",
  energySaver: "",
  renewableWaterRatio: "",
  municipalWater: "",
  co2Impact: "",
  machineryHours: "",
  solarOffset: "",
  fiberRecycling: "",
  batteryReclaim: "",
});

/* ------------------------------------------------------------------ */
/*  Metric Card                                                        */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
  accentClass?: string;
  children?: React.ReactNode;
}

const MetricCard = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onChange,
  unit,
  placeholder = "0",
  accentClass = "text-secondary",
  children,
}: MetricCardProps) => (
  <div className="glass rounded-xl p-4 flex items-center gap-4 border border-border/30 hover:border-secondary/20 transition-all duration-300 group">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg glass-strong flex items-center justify-center border border-secondary/20 group-hover:border-secondary/40 transition-colors">
      <Icon className={`h-5 w-5 ${accentClass}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">
        {title}
      </p>
      <p className="clamp-body text-muted-foreground">{subtitle}</p>
      {children}
    </div>
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded-lg glass border border-border/40 px-2.5 py-2 clamp-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/40 bg-transparent text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="clamp-body text-muted-foreground whitespace-nowrap">{unit}</span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Status Card (non-numeric, select-based)                            */
/* ------------------------------------------------------------------ */

interface StatusCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  accentClass?: string;
}

const StatusCard = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onChange,
  options,
  accentClass = "text-secondary",
}: StatusCardProps) => (
  <div className="glass rounded-xl p-4 flex items-center gap-4 border border-border/30 hover:border-secondary/20 transition-all duration-300 group">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg glass-strong flex items-center justify-center border border-secondary/20 group-hover:border-secondary/40 transition-colors">
      <Icon className={`h-5 w-5 ${accentClass}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">
        {title}
      </p>
      <p className="clamp-body text-muted-foreground">{subtitle}</p>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg glass border border-border/40 px-2.5 py-2 clamp-body text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary/40 appearance-none cursor-pointer"
    >
      <option value="" className="bg-card text-foreground">Select</option>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-card text-foreground">
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Computed Gauge                                                     */
/* ------------------------------------------------------------------ */

const GaugeBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="clamp-body text-muted-foreground">{label}</span>
        <span className="clamp-body font-display font-semibold text-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Collapsible Sub-section                                            */
/* ------------------------------------------------------------------ */

const SubSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full group"
      >
        <Icon className="h-4 w-4 text-secondary" />
        <span className="font-display clamp-heading font-semibold uppercase tracking-[0.12em] text-secondary/80 group-hover:text-secondary transition-colors">
          {title}
        </span>
        <div className="flex-1 h-px bg-secondary/10" />
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="grid grid-cols-1 gap-3">{children}</div>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  CO2 Summary Card                                                   */
/* ------------------------------------------------------------------ */

const CO2Summary = ({ co2: co2Val, zone }: { co2: string; zone: string }) => {
  const co2 = parseFloat(co2Val) || 0;
  const level = co2 > 500 ? "Critical" : co2 > 200 ? "Moderate" : co2 > 0 ? "Low" : "—";
  const levelColor =
    co2 > 500 ? "text-primary" : co2 > 200 ? "text-safety-orange" : "text-secondary";

  return (
    <div className="glass rounded-xl p-4 border border-secondary/20 hover:border-secondary/30 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg glass-strong flex items-center justify-center border border-secondary/20">
          <Factory className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">
            Carbon Footprint
          </p>
          <p className="clamp-body text-muted-foreground">
            CO₂ impact per zone: <span className="text-accent">{zone || "No zone"}</span>
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="font-display text-2xl font-bold text-foreground">
            {co2 > 0 ? co2.toLocaleString() : "—"}
          </span>
          <span className="clamp-body text-muted-foreground ml-1">kg CO₂</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className={`h-4 w-4 ${levelColor}`} />
          <span className={`clamp-heading font-display font-semibold ${levelColor}`}>{level}</span>
        </div>
      </div>
      {co2 > 0 && (
        <div className="mt-3">
          <GaugeBar label="Offset Target" value={Math.min(co2, 500)} max={500} color="bg-gradient-to-r from-secondary to-accent" />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main ESG Section                                                   */
/* ------------------------------------------------------------------ */

interface ESGSectionProps {
  values: ESGValues;
  onChange: (key: keyof ESGValues, value: string) => void;
  workZone: string;
}

const certOptions = [
  { value: "cradle-to-cradle-certified", label: "Cradle-to-Cradle Certified" },
  { value: "licensed-vendor", label: "Recycled via Licensed Vendor" },
  { value: "untracked", label: "Untracked" },
];

const disposalOptions = [
  { value: "cradle-to-cradle", label: "Fully Reclaimed" },
  { value: "cradle-to-grave", label: "Partially Reclaimed" },
  { value: "untracked", label: "Untracked" },
];

const energySaverOptions = [
  { value: "active", label: "Active" },
  { value: "partial", label: "Partial" },
  { value: "inactive", label: "Inactive" },
];

const ESGSection = ({ values, onChange, workZone }: ESGSectionProps) => {
  const rainwater = parseFloat(values.renewableWaterRatio) || 0;
  const municipal = parseFloat(values.municipalWater) || 0;
  const totalWater = rainwater + municipal;
  const renewablePct = totalWater > 0 ? (rainwater / totalWater) * 100 : 0;

  return (
    <div className="space-y-5">
      <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Sustainability &amp; ESG Metrics
      </h2>

      {/* 1. Material Integrity */}
      <SubSection title="Material Integrity & Circularity" icon={Recycle}>
        <StatusCard
          icon={PackageCheck}
          title="E-Waste & Scrap Fiber Recovery"
          subtitle="Decommissioned equipment & cable recovery"
          value={values.sourceCert}
          onChange={(v) => onChange("sourceCert", v)}
          options={certOptions}
        />
        <StatusCard
          icon={Trash2}
          title="Battery Cell Reclamation"
          subtitle="UPS / lead-acid cell reclamation tracking"
          value={values.disposalChain}
          onChange={(v) => onChange("disposalChain", v)}
          options={disposalOptions}
        />
        <MetricCard
          icon={Recycle}
          title="Fiber Offcut Recycling"
          subtitle="Fiber offcut / shard recovery rate"
          value={values.fiberRecycling}
          onChange={(v) => onChange("fiberRecycling", v)}
          unit="%"
          placeholder="0"
        />
      </SubSection>

      {/* Clean Energy */}
      <SubSection title="Clean Energy (TESB)" icon={Zap}>
        <MetricCard
          icon={Zap}
          title="Solar PV Generation Offset"
          subtitle="TESB energy yield"
          value={values.solarOffset}
          onChange={(v) => onChange("solarOffset", v)}
          unit="kWh"
          placeholder="0"
        />
      </SubSection>

      {/* 2. Carbon & Energy Efficiency */}
      <SubSection title="Carbon & Fuel" icon={Fuel}>
        <MetricCard
          icon={Fuel}
          title="Fleet Fuel Efficiency"
          subtitle="Splicing van & fleet consumption"
          value={values.dieselEfficiency}
          onChange={(v) => onChange("dieselEfficiency", v)}
          unit="L/100km"
          placeholder="0.0"
        />
        <StatusCard
          icon={Zap}
          title="Eco-mode Rectifiers & Inverters"
          subtitle="Rectifier eco-mode & inverter efficiency"
          value={values.energySaver}
          onChange={(v) => onChange("energySaver", v)}
          options={energySaverOptions}
          accentClass="text-accent"
        />
        <MetricCard
          icon={Factory}
          title="Genset / Plant Hours"
          subtitle="Total daily operational hours"
          value={values.machineryHours}
          onChange={(v) => onChange("machineryHours", v)}
          unit="hrs"
          placeholder="0"
          accentClass="text-accent"
        />
      </SubSection>

      {/* 3. Water Harvesting */}
      <SubSection title="Water Harvesting" icon={CloudRain}>
        <MetricCard
          icon={CloudRain}
          title="Rainwater Harvested"
          subtitle="On-site collection volume"
          value={values.renewableWaterRatio}
          onChange={(v) => onChange("renewableWaterRatio", v)}
          unit="m³"
          placeholder="0"
        />
        <MetricCard
          icon={Droplets}
          title="Municipal Supply"
          subtitle="External water consumption"
          value={values.municipalWater}
          onChange={(v) => onChange("municipalWater", v)}
          unit="m³"
          placeholder="0"
          accentClass="text-accent"
        />
        {totalWater > 0 && (
          <div className="glass rounded-xl p-4 border border-secondary/20">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="h-4 w-4 text-secondary" />
              <span className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">
                Renewable Water Ratio
              </span>
            </div>
            <GaugeBar
              label={`${rainwater.toFixed(1)} m³ renewable / ${totalWater.toFixed(1)} m³ total`}
              value={renewablePct}
              max={100}
              color="bg-gradient-to-r from-accent to-secondary"
            />
          </div>
        )}
      </SubSection>

      {/* 4. Carbon Footprint */}
      <SubSection title="Carbon Footprint" icon={Factory} defaultOpen={true}>
        <MetricCard
          icon={Factory}
          title="CO₂ Generation"
          subtitle="Fleet, genset & material emissions"
          value={values.co2Impact}
          onChange={(v) => onChange("co2Impact", v)}
          unit="kg"
          placeholder="0"
          accentClass="text-accent"
        />
        <CO2Summary co2={values.co2Impact} zone={workZone} />
      </SubSection>
    </div>
  );
};

export default ESGSection;
