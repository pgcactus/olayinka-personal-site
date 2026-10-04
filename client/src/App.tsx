import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollReset from "./components/ScrollReset";
import Home from "./pages/Home";
import Nato from "./pages/Nato";
import Pace from "./pages/Pace";
import SmallThings from "./pages/SmallThings";
import Vinyls from "./pages/Vinyls";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Vinyls is the only Things page; Books and Places are retired. */}
      <Route path="/things">
        <Redirect to="/things/vinyls" />
      </Route>
      <Route path="/things/books">
        <Redirect to="/things/vinyls" />
      </Route>
      <Route path="/things/places">
        <Redirect to="/things/vinyls" />
      </Route>
      <Route path="/things/vinyls" component={Vinyls} />
      <Route path="/nato" component={Nato} />
      <Route path="/pace" component={Pace} />
      <Route path="/small-things" component={SmallThings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollReset />
      <Router />
    </ErrorBoundary>
  );
}

export default App;
