import { Search, ClipboardCheck, AlertTriangle, MinusCircle } from "lucide-react";

interface DailySummaryProps {
  totalInspected: number;
  openIssues: number;
  naCategories: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DailySummary = ({
  totalInspected,
  openIssues,
  naCategories,
  searchQuery,
  onSearchChange,
}: DailySummaryProps) => {
  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for SOP or Category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl glass border border-border/40 pl-10 pr-4 py-3 min-h-[48px] clamp-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent bg-transparent"
        />
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-xl p-3 text-center glow-blue border border-accent/20">
          <ClipboardCheck className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{totalInspected}</p>
          <p className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">Inspected</p>
        </div>

        <div
          className={`glass rounded-xl p-3 text-center border ${
            openIssues > 0
              ? "animate-border-glow-red border-unsafe/40"
              : "border-border/20"
          }`}
        >
          <AlertTriangle className={`h-4 w-4 mx-auto mb-1 ${openIssues > 0 ? "text-unsafe" : "text-muted-foreground"}`} />
          <p className={`font-display text-xl font-bold ${openIssues > 0 ? "text-unsafe" : "text-foreground"}`}>{openIssues}</p>
          <p className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">Open Issues</p>
        </div>

        <div className="glass rounded-xl p-3 text-center border border-border/20">
          <MinusCircle className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="font-display text-xl font-bold text-foreground">{naCategories}</p>
          <p className="clamp-body text-muted-foreground uppercase tracking-wider font-medium">N/A</p>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
