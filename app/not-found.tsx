import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container closing-section">
        <span className="eyebrow">PAGE NOT FOUND</span>
        <h1>This path ends here.</h1>
        <p>Return to the campaign or start from the homepage.</p>
        <Link className="button" href="/campaign">
          Open campaign
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
