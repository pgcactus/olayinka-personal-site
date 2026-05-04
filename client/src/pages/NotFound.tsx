import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <main className="content">
        <p className="para para-bold">Page not found.</p>
        <p className="para">
          The link is broken or the page has moved.
        </p>
        <p className="para">
          <Link href="/" className="highlight">← back home</Link>
        </p>
      </main>
    </div>
  );
}
