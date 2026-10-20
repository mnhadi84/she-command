import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, UserPlus, X, Wifi } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { registrationSchema } from "@/lib/registration-validation";

const Login = () => {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ppeConfirmed, setPpeConfirmed] = useState(false);

  // Registration state
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regStaffId, setRegStaffId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const validRegistration = registrationSchema.safeParse({ name: regName, staffId: regStaffId, email: regEmail, password: regPassword, confirmPassword: regConfirmPassword }).success;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock auth: bypass backend sign-in for now
    try { localStorage.setItem("she-auth", "true"); } catch { /* ignore */ }
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validRegistration) {
      toast({ title: "Check Registration", description: "Complete every field and make sure both passwords match.", variant: "destructive" });
      return;
    }
    const email = regEmail.trim();
    if (!regName.trim() || !regStaffId.trim() || !email) {
      toast({ title: "Missing Fields", description: "Please fill in all registration fields.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid Email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    setIsRegistering(true);
    try {
      const { error } = await supabase.from("users").insert({
        name: regName.trim(),
        staff_id: regStaffId.trim(),
        email,
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
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-white/20 pb-2.5 pt-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[hsl(var(--brand-magenta))] transition-colors";

  return (
    <div className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Dark Industrial Gradient Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, hsl(222, 33%, 8%) 0%, hsl(222, 33%, 4%) 100%)" }}
      />
      {/* Subtle Glassmorphic Backdrop Overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{
        background: "radial-gradient(circle at 50% 30%, hsl(324 100% 46% / 0.10) 0%, hsl(196 100% 44% / 0.05) 45%, transparent 70%)"
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Logo — large, transparent, seamless */}
         <div aria-label="TIME dotCom logo" className="flex flex-col items-center mb-3 select-none">
          <span className="font-display text-5xl font-bold lowercase leading-none text-[hsl(var(--brand-magenta))] drop-shadow-[0_0_18px_hsl(var(--brand-magenta)/0.6)]">time</span>
          <Wifi className="h-6 text-[hsl(var(--brand-magenta))] drop-shadow-[0_0_12px_hsl(var(--brand-magenta)/0.8)]" />
        </div>

        {/* Brand Text */}
        <h1 className="font-display text-xl font-bold tracking-[0.18em] text-white mb-1 drop-shadow-lg">
          TIME SHE - ANALYTICS
        </h1>
        <p className="text-[10px] tracking-[0.2em] text-[hsl(var(--brand-cyan))] font-semibold mb-5 text-center uppercase">
          Environmental &amp; Occupational Safety Intelligence
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
              className="mt-0.5 border-[hsl(var(--brand-magenta))] data-[state=checked]:bg-[hsl(var(--brand-magenta))] data-[state=checked]:border-[hsl(var(--brand-magenta))]"
            />
            <label htmlFor="ppe" className="text-xs text-white/60 leading-relaxed cursor-pointer select-none">
              <span className="text-white font-medium">Pre-Entry:</span> I confirm my PPE is inspected and site-ready.
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[hsl(var(--brand-magenta))] hover:brightness-110 text-white font-display font-semibold text-sm tracking-[0.2em] uppercase transition-all duration-200 hover:shadow-[0_0_25px_hsl(var(--brand-magenta)/0.45)]"
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
            Verified by SHE Management System Logic | Secure Encrypted Sync
          </p>
        </div>
      </div>

      {/* Registration Overlay */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="registration-title" className="relative w-full max-w-[400px] max-h-[90dvh] overflow-y-auto rounded-lg border border-border bg-card p-8 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => { setShowRegister(false); setRegPassword(""); setRegConfirmPassword(""); }}
              aria-label="Close registration"
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="registration-title" className="font-display text-lg font-bold tracking-[0.12em] text-accent mb-1">
              NEW REGISTRATION
            </h2>
            <p className="text-xs text-white/40 mb-6">Create your SHE-Analytics field account</p>

            <form onSubmit={handleRegister} className="space-y-5">
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full Name"
                aria-label="Full Name"
                maxLength={100}
                required
                className={inputClass}
              />
              <input
                type="text"
                value={regStaffId}
                onChange={(e) => setRegStaffId(e.target.value)}
                placeholder="TTxxxx"
                aria-label="Registration Staff ID"
                maxLength={100}
                required
                className={inputClass}
              />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="supervisor@time.com.my"
                aria-label="Email Address"
                maxLength={255}
                required
                className={inputClass}
              />

              {[
                { label: "Password", value: regPassword, set: setRegPassword, visible: showRegPassword, toggle: () => setShowRegPassword((v) => !v) },
                { label: "Confirm Password", value: regConfirmPassword, set: setRegConfirmPassword, visible: showRegConfirmPassword, toggle: () => setShowRegConfirmPassword((v) => !v) },
              ].map((field) => (
                <div className="relative" key={field.label}>
                  <input type={field.visible ? "text" : "password"} aria-label={field.label} placeholder={field.label} value={field.value} onChange={(e) => field.set(e.target.value)} required maxLength={128} autoComplete="new-password" className={`${inputClass} pr-10`} />
                  <Button type="button" variant="ghost" size="icon" aria-label={`${field.visible ? "Hide" : "Show"} ${field.label.toLowerCase()}`} title={`${field.visible ? "Hide" : "Show"} ${field.label.toLowerCase()}`} onClick={field.toggle} className="absolute right-0 top-0 text-muted-foreground">
                    {field.visible ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              ))}
              {regConfirmPassword && regPassword !== regConfirmPassword && <p role="alert" className="text-xs text-destructive">Passwords must match.</p>}
              <Button
                type="submit"
                disabled={isRegistering || !validRegistration}
                className="w-full font-display font-semibold tracking-[0.15em] uppercase"
              >
                {isRegistering ? "Registering..." : "Create Account"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
