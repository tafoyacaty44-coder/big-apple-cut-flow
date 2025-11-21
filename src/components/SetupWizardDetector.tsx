import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSetupNeeded, wasSetupSkipped } from "@/lib/api/setup";
import { Loader2 } from "lucide-react";

export const SetupWizardDetector = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const { data: needsSetup, isLoading } = useQuery({
    queryKey: ['setup-needed'],
    queryFn: checkSetupNeeded,
    staleTime: 0, // Always check fresh
    gcTime: 0, // Don't cache
  });

  useEffect(() => {
    if (isLoading) return;

    // Don't redirect if already on setup wizard or if user skipped setup
    if (location.pathname === '/setup-wizard' || wasSetupSkipped()) {
      setIsChecking(false);
      return;
    }

    // Redirect to setup wizard if setup is needed
    if (needsSetup) {
      navigate('/setup-wizard', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [needsSetup, isLoading, navigate, location.pathname]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
