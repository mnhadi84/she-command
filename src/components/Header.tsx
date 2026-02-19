import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="glass-strong sticky top-0 z-50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 glow-red">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-wide text-foreground">
              SHE-<span className="text-gradient-brand">Analytics</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Safety · Health · Environment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse-glow" />
          <span className="text-xs text-secondary font-medium">LIVE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
