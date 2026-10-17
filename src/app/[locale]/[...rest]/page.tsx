import { notFound } from "next/navigation";

// The proxy sends every unmatched URL into [locale]; this renders the localized 404 inside the site layout.
export default function UnmatchedRoute() {
  notFound();
}
