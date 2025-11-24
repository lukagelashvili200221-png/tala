import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import Register from "@/pages/auth/register";
import Home from "@/pages/home";
import Wallet from "@/pages/wallet";
import LuckyWheel from "@/pages/lucky-wheel";
import Trading from "@/pages/trading";
import Profile from "@/pages/profile";
import Referral from "@/pages/referral";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Redirect to register if not logged in
    if (!userId && location !== "/register") {
      setLocation("/register");
    }
  }, [userId, location, setLocation]);

  const showBottomNav = userId && location !== "/register";

  return (
    <>
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/" component={Home} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/lucky-wheel" component={LuckyWheel} />
        <Route path="/trading" component={Trading} />
        <Route path="/profile" component={Profile} />
        <Route path="/referral" component={Referral} />
        <Route component={NotFound} />
      </Switch>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
