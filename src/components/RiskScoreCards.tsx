import { ShieldCheck, Leaf, Activity } from "lucide-react";

interface RiskScoreCardsProps {
  safetyScore: number;
  esgScore: number;
  operationalScore: number;
}

const ScoreRing = ({
  value,
  color,
  glowClass,
}: {
  value: number;
  color: string;
  glowClass: string;
}) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative ${glowClass}`}>
      <svg width="80" height="80" className="-rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="5"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={`hsl(var(--${color}))`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-foreground">
        {value}
      </span>
    </div>
  );
};

const RiskScoreCards = ({ safetyScore, esgScore, operationalScore }: RiskScoreCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="glass rounded-xl p-3 flex flex-col items-center gap-2 border border-secondary/15 hover:border-secondary/30 transition-all duration-300">
        <ShieldCheck className="h-4 w-4 text-secondary" />
        <ScoreRing value={safetyScore} color="secondary" glowClass="" />
        <p className="clamp-body text-muted-foreground uppercase tracking-wider font-semibold text-center">
          Safety
        </p>
      </div>
      <div className="glass rounded-xl p-3 flex flex-col items-center gap-2 border border-secondary/15 hover:border-secondary/30 transition-all duration-300">
        <Leaf className="h-4 w-4 text-secondary" />
        <ScoreRing value={esgScore} color="accent" glowClass="" />
        <p className="clamp-body text-muted-foreground uppercase tracking-wider font-semibold text-center">
          ESG
        </p>
      </div>
      <div className="glass rounded-xl p-3 flex flex-col items-center gap-2 border border-primary/15 hover:border-primary/30 transition-all duration-300">
        <Activity className="h-4 w-4 text-primary" />
        <ScoreRing value={operationalScore} color="primary" glowClass="" />
        <p className="clamp-body text-muted-foreground uppercase tracking-wider font-semibold text-center">
          Ops Risk
        </p>
      </div>
    </div>
  );
};

export default RiskScoreCards;
