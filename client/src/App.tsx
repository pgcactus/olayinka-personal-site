import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Nato from "./pages/Nato";
import Things from "./pages/Things";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Redirect bare /things to /things/books */}
      <Route path="/things">
        <Redirect to="/things/books" />
      </Route>
      <Route path="/things/:tab" component={Things} />
      <Route path="/nato" component={Nato} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

interface AppProps {
  ssrPath?: string;
}

function App({ ssrPath }: AppProps) {
  const content = (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );

  return ssrPath ? (
    <WouterRouter ssrPath={ssrPath}>{content}</WouterRouter>
  ) : (
    content
  );
}

export default App;
