import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/Logo_SHE_Analytics.png";

const Login = () => {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ppeConfirmed, setPpeConfirmed] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim() || !password.trim()) {
      toast({ title: "Missing Fields", description: "Please enter Staff ID and Password.", variant: "destructive" });
      return;
    }
    if (!ppeConfirmed) {
      toast({ title: "PPE Verification Required", description: "You must confirm your PPE is inspected and site-ready.", variant: "destructive" });
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(170deg, hsl(220 20% 8%) 0%, hsl(215 25% 12%) 50%, hsl(220 20% 8%) 100%)" }}>
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo - seamless, no container */}
        <img
          src={logo}
          alt="SHE-Analytics Logo"
          className="w-40 h-40 object-contain mb-2 select-none"
          draggable={false}
        />

        {/* Brand Text */}
        <h1 className="font-display text-2xl font-bold tracking-[0.15em] text-[hsl(210,60%,25%)] mb-0.5">
          SHE-ANALYTICS
        </h1>
        <p className="text-xs tracking-[0.25em] text-[hsl(120,45%,40%)] font-medium mb-10">
          INSPECTION INTELLIGENCE
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-6 px-2">
          {/* Staff ID */}
          <div className="relative">
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Staff ID"
              className="w-full bg-transparent border-0 border-b border-muted-foreground/30 pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Project Code */}
          <div className="relative">
            <input
              type="text"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              placeholder="NEOM-01"
              className="w-full bg-transparent border-0 border-b border-muted-foreground/30 pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent border-0 border-b border-muted-foreground/30 pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* PPE Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="ppe"
              checked={ppeConfirmed}
              onCheckedChange={(v) => setPpeConfirmed(v === true)}
              className="mt-0.5 border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <label htmlFor="ppe" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
              <span className="text-foreground font-medium">Pre-Entry:</span> I confirm my PPE is inspected and site-ready.
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-accent/90 hover:bg-accent text-accent-foreground font-display font-semibold text-sm tracking-widest uppercase transition-all duration-200 hover:shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
          >
            Secure Login
          </button>
        </form>

        {/* Security Footer */}
        <div className="flex items-center gap-1.5 mt-10 opacity-40">
          <ShieldCheck className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground tracking-wide">
            Verified by ASCF Framework Logic | Secure Edge-Cloud Sync
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
