import { LayoutDashboard, BookOpen, BarChart3 } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "SOP Library" },
  { icon: BarChart3, label: "Reports" },
];

const BottomNav = () => {
  const [active, setActive] = useState(0);

  return (
    <nav className="glass-strong fixed bottom-0 left-0 right-0 z-50 pb-safe max-w-[480px] mx-auto">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActive(i)}
            className={`relative flex flex-col items-center gap-1 min-h-[48px] min-w-[48px] px-4 py-2 rounded-lg transition-all duration-200 ${
              active === i
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`h-5 w-5 ${active === i ? "drop-shadow-[0_0_6px_hsl(var(--glow-blue))]" : ""}`} />
            <span className="clamp-body font-semibold uppercase tracking-wider">{item.label}</span>
            {active === i && (
              <span className="absolute -top-0 h-0.5 w-8 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
