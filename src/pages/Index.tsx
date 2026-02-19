import {
  ArrowUpFromLine,
  Blocks,
  Flame,
  Shovel,
  Weight,
  FlaskConical,
  HandMetal,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import HeroStatus from "@/components/HeroStatus";
import InspectionCard from "@/components/InspectionCard";
import BottomNav from "@/components/BottomNav";

const categories = [
  { title: "Working at Height", icon: ArrowUpFromLine },
  { title: "Scaffolding & Temp Structures", icon: Blocks },
  { title: "Hot Work", icon: Flame },
  { title: "Excavation Work", icon: Shovel },
  { title: "Heavy Lifting Work", icon: Weight },
  { title: "Chemical Handling", icon: FlaskConical },
  { title: "Manual Handling Work", icon: HandMetal },
  { title: "Housekeeping", icon: Sparkles },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern flex justify-center">
      <div className="w-full max-w-[480px]">
        <Header />

        {/* Site Identification */}
        <div className="glass-strong px-4 py-2 border-b border-border/30">
          <p className="clamp-body text-accent font-medium tracking-wide">
            Active Project: <span className="text-foreground">MRT Line 3 - Kajang Sector</span>
          </p>
          <p className="clamp-body text-muted-foreground">
            Lead Inspector: <span className="text-foreground">Mr. Hadi</span>
          </p>
        </div>

        <main className="px-4 py-6 pb-24 space-y-6">
          <HeroStatus />

          <div>
            <h2 className="font-display clamp-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              The Big Eight — Inspection Categories
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat, i) => (
                <InspectionCard key={cat.title} title={cat.title} icon={cat.icon} index={i} />
              ))}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
