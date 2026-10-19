import { Wind, Droplets, Mountain, Volume2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EIACardProps {
  title: string;
  icon: LucideIcon;
  pelLabel: string;
  note?: string;
  value: string;
  onChange: (value: string) => void;
}

const EIACard = ({ title, icon: Icon, pelLabel, note, value, onChange }: EIACardProps) => (
  <div className="glass rounded-xl p-4 flex items-center gap-4 border border-border/30 hover:border-accent/20 transition-all duration-300">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg glass-strong flex items-center justify-center border border-accent/20">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-display clamp-heading font-semibold text-foreground uppercase tracking-wider">{title}</p>
      <p className="clamp-body text-muted-foreground">{pelLabel}</p>
      {note && <p className="clamp-body text-accent/70 mt-0.5">{note}</p>}
    </div>
    <input
      type="number"
      placeholder="Enter Value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-24 rounded-lg glass border border-border/40 px-3 py-2 clamp-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/40 bg-transparent text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  </div>
);

interface EIASectionProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const eiaCategories = [
  { key: "genset", title: "Generator Exhaust & Emissions", icon: Wind, pelLabel: "Limit: Ringelmann No. 1 (smoke opacity)", note: "Assessed during genset load tests." },
  { key: "noise", title: "Boundary Noise Level", icon: Volume2, pelLabel: "Limit: 65 dBA Day / 55 dBA Night", note: "DC plant & roadside HDD operations." },
  { key: "battery", title: "Battery Acid & Electrolyte Containment", icon: Droplets, pelLabel: "Target: pH 6.5 – 8.5", note: "Lead-acid neutralization check." },
  { key: "silt", title: "Trench Silt & Surface Run-off", icon: Mountain, pelLabel: "Limit: Auto (mg/L TSS)", note: "Suspended solids control during roadside excavation." },
];

const EIASection = ({ values, onChange }: EIASectionProps) => {
  return (
    <div>
      <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
        Environmental Compliance (EIA)
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {eiaCategories.map((cat) => (
          <EIACard
            key={cat.key}
            title={cat.title}
            icon={cat.icon}
            pelLabel={cat.pelLabel}
            note={cat.note}
            value={values[cat.key] || ""}
            onChange={(v) => onChange(cat.key, v)}
          />
        ))}
      </div>
    </div>
  );
};

export default EIASection;
