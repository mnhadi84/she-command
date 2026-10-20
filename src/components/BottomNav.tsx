import { LayoutDashboard, ClipboardCheck, Leaf, Recycle, Activity } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: ClipboardCheck, label: "Inspect", path: "/inspection" },
  { icon: Leaf, label: "EIA", path: "/eia" },
  { icon: Recycle, label: "ESG", path: "/esg" },
  { icon: Activity, label: "Risk", path: "/risk-analytics" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="glass-strong fixed bottom-0 left-0 right-0 z-50 pb-safe max-w-[480px] mx-auto">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 min-h-[48px] min-w-[48px] px-2 py-2 rounded-lg transition-all duration-200 ${
                isActive ? "text-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(var(--glow-brand))]" : ""}`} />
              <span className="clamp-body font-semibold uppercase tracking-wider">{item.label}</span>
              {isActive && <span className="absolute -top-0 h-0.5 w-8 rounded-full bg-secondary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
