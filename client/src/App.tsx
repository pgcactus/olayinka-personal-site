import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Nato from "./pages/Nato";
import Things from "./pages/Things";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/things" component={Things} />
      <Route path="/nato" component={Nato} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
