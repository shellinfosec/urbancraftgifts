import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "Terms & Conditions",
      description: "Terms for using the Urban Craft & Co. website and catalogue.",
      path: "/terms",
    }),
  component: () => (
    <>
      <PageHeader crumbs={[{ label: "Terms & Conditions" }]} title="Terms & Conditions" />
      <Prose>
        <p>
          This website presents the {BUSINESS.name} catalogue for information and enquiry purposes.
          No purchase is made on this website.
        </p>
        <h2>Product information</h2>
        <p>
          Product images and descriptions are indicative. Colours, materials, contents of sets and
          branding options are confirmed in writing for each order.
        </p>
        <h2>Quotes and orders</h2>
        <p>
          Prices, quantities, timelines and delivery terms are agreed individually through a written
          quote. An enquiry does not create an order.
        </p>
        <h2>Artwork</h2>
        <p>
          You confirm that you have the right to use any logo or artwork you send us for branding.
        </p>
        <h2>Contact</h2>
        <p>Questions about these terms: {BUSINESS.email}.</p>
      </Prose>
    </>
  ),
});
