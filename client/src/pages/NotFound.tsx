import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <PageMeta
        title="Page not found — Olayinka Titilola"
        description="This page does not exist."
        path="/404"
        noindex={true}
      />
      <main className="content">
        <p className="para para-bold">Page not found.</p>
        <p className="para">
          The link is broken or the page has moved.
        </p>
        <p className="para">
          <Link href="/" className="highlight">&#8592; back home</Link>
        </p>
      </main>
    </div>
  );
}
