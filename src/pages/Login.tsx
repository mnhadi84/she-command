import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, UserPlus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/Logo_SHE_Analytics.png";

const Login = () => {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ppeConfirmed, setPpeConfirmed] = useState(false);

  // Registration state
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regStaffId, setRegStaffId] = useState("");
  const [regProjectCode, setRegProjectCode] = useState("NEOM-01");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock auth: bypass backend sign-in for now
    try { localStorage.setItem("she-auth", "true"); } catch { /* ignore */ }
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regStaffId.trim() || !regProjectCode.trim()) {
      toast({ title: "Missing Fields", description: "Please fill in all registration fields.", variant: "destructive" });
      return;
    }
    setIsRegistering(true);
    try {
      const { error } = await supabase.from("users").insert({
        name: regName.trim(),
        staff_id: regStaffId.trim(),
        project_code: regProjectCode.trim(),
      });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already Registered", description: "This Staff ID is already in use.", variant: "destructive" });
        } else {
          toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Registered Successfully", description: "Your account has been created. You may now log in." });
        setShowRegister(false);
        setRegName("");
        setRegStaffId("");
        setRegProjectCode("NEOM-01");
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-white/20 pb-2.5 pt-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[hsl(120,45%,45%)] transition-colors";

  return (
    <div className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* NEOM Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/neom-bg.jpg')" }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, rgba(10,14,20,0.55) 0%, rgba(10,14,20,0.4) 35%, rgba(10,14,20,0.7) 65%, rgba(10,14,20,0.95) 100%)"
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Logo — large, transparent, seamless */}
        <img
          src={logo}
          alt="SHE-Analytics Logo"
          className="w-[5.2rem] h-[5.2rem] object-contain mb-1 select-none drop-shadow-[0_0_30px_rgba(0,0,0,0.6)]"
          draggable={false}
          style={{ mixBlendMode: "multiply", filter: "brightness(1.1)" }}
        />

        {/* Brand Text */}
        <h1 className="font-display text-xl font-bold tracking-[0.18em] text-[hsl(210,60%,55%)] mb-0 drop-shadow-lg">
          SHE-ANALYTICS
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-[hsl(120,50%,50%)] font-semibold mb-5 drop-shadow-md">
          INSPECTION INTELLIGENCE
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-3.5 px-1">
          <input
            type="text"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            placeholder="Staff ID"
            className={inputClass}
          />

          <input
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="NEOM-01"
            className={inputClass}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`${inputClass} pr-8`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1.5 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* PPE Checkbox */}
          <div className="flex items-start gap-3 pt-0.5">
            <Checkbox
              id="ppe"
              checked={ppeConfirmed}
              onCheckedChange={(v) => setPpeConfirmed(v === true)}
              className="mt-0.5 border-[hsl(120,45%,45%)] data-[state=checked]:bg-[hsl(120,45%,45%)] data-[state=checked]:border-[hsl(120,45%,45%)]"
            />
            <label htmlFor="ppe" className="text-xs text-white/60 leading-relaxed cursor-pointer select-none">
              <span className="text-white font-medium">Pre-Entry:</span> I confirm my PPE is inspected and site-ready.
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[hsl(120,45%,40%)] hover:bg-[hsl(120,45%,45%)] text-white font-display font-semibold text-sm tracking-[0.2em] uppercase transition-all duration-200 hover:shadow-[0_0_25px_rgba(60,160,60,0.35)]"
          >
            Secure Login
          </button>

          {/* Register Button */}
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="w-full py-2.5 rounded-lg border border-white/20 hover:border-white/40 bg-transparent text-white/70 hover:text-white font-display font-medium text-sm tracking-[0.15em] uppercase transition-all duration-200 flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Register
          </button>
        </form>

        {/* Security Footer */}
        <div className="flex items-center gap-1.5 mt-6 opacity-40">
          <ShieldCheck className="h-3 w-3 text-white/60" />
          <p className="text-[10px] text-white/60 tracking-wide">
            Verified by ASCF Framework Logic | Secure Edge-Cloud Sync
          </p>
        </div>
      </div>

      {/* Registration Overlay */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-[400px] rounded-2xl border border-white/10 bg-[hsl(220,20%,10%)]/95 p-8 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setShowRegister(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-lg font-bold tracking-[0.12em] text-[hsl(210,60%,55%)] mb-1">
              NEW REGISTRATION
            </h2>
            <p className="text-xs text-white/40 mb-6">Create your SHE-Analytics field account</p>

            <form onSubmit={handleRegister} className="space-y-5">
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full Name"
                className={inputClass}
              />
              <input
                type="text"
                value={regStaffId}
                onChange={(e) => setRegStaffId(e.target.value)}
                placeholder="Staff ID"
                className={inputClass}
              />
              <input
                type="text"
                value={regProjectCode}
                onChange={(e) => setRegProjectCode(e.target.value)}
                placeholder="Project Code"
                className={inputClass}
              />

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 rounded-lg bg-[hsl(210,60%,45%)] hover:bg-[hsl(210,60%,50%)] text-white font-display font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_25px_rgba(60,120,200,0.3)]"
              >
                {isRegistering ? "Registering..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
