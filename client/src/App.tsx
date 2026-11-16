import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Library from "./pages/Library";
import ScenarioDetail from "./pages/ScenarioDetail";
import Practice from "./pages/Practice";
import Assignments from "./pages/Assignments";
import Coach from "./pages/Coach";
import Interview from "./pages/Interview";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/library"} component={Library} />
      <Route path={"/scenarios/:slug"} component={ScenarioDetail} />
      <Route path={"/practice/:slug"} component={Practice} />
      <Route path={"/assignments"} component={Assignments} />
      <Route path={"/coach"} component={Coach} />
      <Route path={"/interview"} component={Interview} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
