import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdmin } from "../contexts/AdminContext";

export default function Header() {
  const { isAdmin, login, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (ok) {
      setOpen(false);
      setPassword("");
      setError(false);
      toast.success("Admin mode unlocked");
    } else {
      setError(true);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setPassword("");
      setError(false);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Team Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/generated/knights-logo-transparent.dim_120x120.png"
                alt="The Knights Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight leading-none">
                The Knights
              </h1>
              <p className="text-primary-foreground/70 text-xs font-body">
                Lacrosse Team Stats
              </p>
            </div>
          </div>

          {/* Auth controls */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Badge
                variant="outline"
                className="border-accent text-accent bg-accent/10 font-semibold hidden sm:flex"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}

            {isAdmin ? (
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                data-ocid="header.logout.button"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Lock
              </Button>
            ) : (
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                data-ocid="header.login.button"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                <Lock className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Field stripe accent */}
      <div className="h-1 bg-accent" />

      {/* Password dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent data-ocid="header.login.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Admin Access</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                data-ocid="header.password.input"
                autoFocus
              />
              {error && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="header.login.error_state"
                >
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                data-ocid="header.login.submit_button"
                className="w-full bg-foreground hover:bg-foreground/90 text-background"
              >
                Unlock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
