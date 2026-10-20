import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const HeroStatus = () => {
  const compliance = 94;

  return (
    <div className="glass rounded-xl p-6 animate-scan transition-shadow duration-1000">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display clamp-heading font-semibold text-muted-foreground uppercase tracking-wider">
          Safety Status
        </h2>
        <span className="clamp-body text-muted-foreground">Last updated: 2 min ago</span>
      </div>

      <div className="flex items-end gap-6">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display clamp-hero font-bold text-secondary">{compliance}%</span>
            <span className="clamp-heading text-muted-foreground">Site Compliance</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all duration-1000"
              style={{ width: `${compliance}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Open Items</p>
                <p className="font-display text-lg font-bold text-foreground">12</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Hazards</p>
                <p className="font-display text-lg font-bold text-foreground">3</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Trend</p>
                <p className="font-display text-lg font-bold text-secondary">+2.1%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroStatus;
