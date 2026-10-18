import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    pageHead({
      title: "Privacy Policy",
      description: "How Urban Craft & Co. handles information you share through enquiries.",
      path: "/privacy-policy",
    }),
  component: () => (
    <>
      <PageHeader crumbs={[{ label: "Privacy Policy" }]} title="Privacy Policy" />
      <Prose>
        <p>
          We collect only the information you choose to share with us - such as your name, company,
          email, phone number and gifting requirements - when you contact us or send an enquiry.
        </p>
        <h2>How we use it</h2>
        <p>
          To respond to your enquiry, prepare quotes and coordinate your order. We do not sell your
          information.
        </p>
        <h2>On this device</h2>
        <p>
          Favourites and an unfinished enquiry draft are stored in your browser only, and are not
          sent to us until you choose to send an enquiry.
        </p>
        <h2>Contact</h2>
        <p>To ask about or remove your information, email {BUSINESS.email}.</p>
      </Prose>
    </>
  ),
});
