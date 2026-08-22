import NotFound from "@/pages/NotFound";
import { Route, Router, useLocation } from "wouter";
import { ComponentType, LazyExoticComponent, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollReset from "./components/ScrollReset";
import { ThemeProvider } from "./contexts/ThemeContext";

export type ClientPage = ComponentType;

type AppProps = {
  initialPath: string;
  InitialPage: ClientPage;
  loadPage: (path: string) => LazyExoticComponent<ClientPage>;
};

function routePattern(path: string) {
  if (path.startsWith("/things/")) return "/things/:tab";
  return path || "/";
}

function ClientRoute({ initialPath, InitialPage, loadPage }: AppProps) {
  const [location] = useLocation();
  const currentPath = location.replace(/\/+$/, "") || "/";
  const initial = currentPath === initialPath;
  const Page = initial ? InitialPage : loadPage(currentPath);
  const RoutedPage: ComponentType = () => <Page />;

  return (
    <Suspense fallback={null}>
      <Route path={routePattern(currentPath)} component={RoutedPage} />
    </Suspense>
  );
}

function App(props: AppProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <Router>
          <ScrollReset />
          <ClientRoute {...props} />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
