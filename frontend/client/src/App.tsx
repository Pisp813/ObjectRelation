import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ObjectProvider } from "@/contexts/ObjectContext";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import Admin from "@/pages/admin";

import NotFound from "@/pages/not-found";

function Router() {
  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = currentUser?.username === 'admin';

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ObjectProvider>
          <Toaster />
          <Router />
        </ObjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
