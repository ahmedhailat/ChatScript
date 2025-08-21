import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AIDemo from "@/pages/ai-demo";
import NotFound from "@/pages/not-found";
import TutorialPage from "@/pages/tutorial";
import FaceAppPage from "@/pages/faceapp";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import SubscriptionPage from "@/pages/subscription";
import PaymentPage from "@/pages/payment";
import ThreeDModelingPage from "@/pages/3d-modeling";
import CommunicationPage from "@/pages/communication";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo" component={AIDemo} />
      <Route path="/tutorial" component={TutorialPage} />
      <Route path="/faceapp" component={FaceAppPage} />
      <Route path="/3d-modeling" component={ThreeDModelingPage} />
      <Route path="/communication" component={CommunicationPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route component={NotFound} />
    </Switch>
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
