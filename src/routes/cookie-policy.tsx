import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cookie-policy")({
  head: () =>
    pageHead({
      title: "Cookie Policy",
      description: "How the Urban Craft & Co. website uses browser storage.",
      path: "/cookie-policy",
    }),
  component: () => (
    <>
      <PageHeader crumbs={[{ label: "Cookie Policy" }]} title="Cookie Policy" />
      <Prose>
        <p>This website uses essential browser storage only:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Favourites</strong> - products you save, kept on your device.
          </li>
          <li>
            <strong>Enquiry draft</strong> - kept for your current browser session so you don't lose
            progress.
          </li>
          <li>
            <strong>Cookie notice</strong> - remembers that you've seen this notice.
          </li>
        </ul>
        <p>
          Embedded Google Maps on the contact page may set its own cookies under Google's policies.
        </p>
      </Prose>
    </>
  ),
});
