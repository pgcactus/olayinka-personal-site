import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollReset from "./components/ScrollReset";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Nato from "./pages/Nato";
import NotFound from "./pages/NotFound";
import Things from "./pages/Things";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/things"><Redirect to="/things/vinyls" /></Route>
      <Route path="/things/books"><Redirect to="/things/vinyls" /></Route>
      <Route path="/things/:tab" component={Things} />
      <Route path="/nato" component={Nato} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function AppServer() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <ScrollReset />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
