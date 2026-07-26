import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ROUTE_META } from "@/site-meta";

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <PageMeta meta={ROUTE_META.notFound} />
      <main className="content">
        <h1 className="para para-bold">Page not found.</h1>
        <p className="para">The link is broken or the page has moved.</p>
        <p className="para">
          <Link href="/" className="highlight">
            &#8592; back home
          </Link>
        </p>
      </main>
    </div>
  );
}
