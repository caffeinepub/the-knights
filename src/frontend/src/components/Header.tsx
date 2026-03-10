import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Shield, User } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Header() {
  const { login, clear, loginStatus, identity, loginError } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Show a toast if login fails so the user knows what went wrong
  useEffect(() => {
    if (loginStatus === "loginError" && loginError) {
      toast.error("Sign in failed", {
        description: loginError.message,
      });
    }
  }, [loginStatus, loginError]);

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
            {isLoggedIn && (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Badge
                    variant="outline"
                    className="border-accent text-accent bg-accent/10 font-semibold"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">
                    {identity.getPrincipal().toString().slice(0, 12)}...
                  </span>
                </div>
              </div>
            )}

            {isLoggedIn ? (
              <Button
                onClick={clear}
                variant="outline"
                size="sm"
                data-ocid="header.logout.button"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={login}
                size="sm"
                data-ocid="header.login.button"
                disabled={isLoggingIn}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Field stripe accent */}
      <div className="h-1 bg-accent" />
    </header>
  );
}
