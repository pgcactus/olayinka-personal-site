import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollReset from "./components/ScrollReset";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Nato from "./pages/Nato";
import Things from "./pages/Things";
import Vinyls from "./pages/Vinyls";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Vinyls is the public Things landing page; Books remains archived. */}
      <Route path="/things">
        <Redirect to="/things/vinyls" />
      </Route>
      <Route path="/things/books">
        <Redirect to="/things/vinyls" />
      </Route>
      <Route path="/things/vinyls" component={Vinyls} />
      <Route path="/things/:tab" component={Things} />
      <Route path="/nato" component={Nato} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <ScrollReset />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
