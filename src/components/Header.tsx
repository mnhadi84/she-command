import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Header = () => {
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      localStorage.removeItem("she-auth");
      sessionStorage.clear();
      navigate("/", { replace: true });
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally { setLoggingOut(false); }
  };
  return (
    <>
    <header className="glass-strong sticky top-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Circular helmet logo */}
          <div className="flex h-11 w-11 items-center justify-center rounded-full glass border border-accent/30 glow-blue">
            <HardHat className="h-6 w-6 text-accent" />
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
          <Button variant="ghost" size="icon" aria-label="Logout" title="Logout" onClick={() => setConfirmLogout(true)} className="text-muted-foreground hover:text-foreground"><LogOut /></Button>
        </div>
      </div>
    </header>
    <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
      <AlertDialogContent className="max-w-sm rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to exit? Any unsaved inspection draft may need to be re-entered.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loggingOut} onClick={(e) => { e.preventDefault(); void logout(); }}>Log Out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default Header;
