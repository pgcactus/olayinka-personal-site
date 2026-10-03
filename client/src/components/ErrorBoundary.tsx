/**
 * Catches a crash anywhere in the app and shows a calm page in the site's
 * style, with a way to reload or go home. Error details stay in the console.
 */

import { Component, type ReactNode } from "react";
import { useLang } from "@/lib/lang";
import "@/pages/not-found.css";

const STRINGS = {
  en: {
    title: "Something went wrong.",
    body: "The page hit a problem it couldn’t recover from.",
    reload: "try again",
    home: "← back home",
  },
  fr: {
    title: "Un problème est survenu.",
    body: "La page a rencontré une erreur dont elle n’a pas pu se remettre.",
    reload: "réessayer",
    home: "← retour à l’accueil",
  },
};

function ErrorPage() {
  const t = STRINGS[useLang()];
  return (
    <div className="site-page">
      <main className="nf">
        <div className="nf-copy">
          <h1 className="nf-title">{t.title}</h1>
          <p className="nf-body">{t.body}</p>
          <p className="nf-links">
            <button type="button" onClick={() => window.location.reload()}>
              {t.reload}
            </button>
            {/* A full page load, in case the router is what broke. */}
            <a href="/">{t.home}</a>
          </p>
        </div>
      </main>
    </div>
  );
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <ErrorPage /> : this.props.children;
  }
}

export default ErrorBoundary;
