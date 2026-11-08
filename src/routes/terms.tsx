import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "Terms & Conditions",
      description:
        "Comprehensive commercial and operational terms for browsing the Urban Craft & Co. catalogue, submitting enquiries, and commissioning corporate gifting orders.",
      path: "/terms",
    }),
  component: () => (
    <>
      <PageHeader
        crumbs={[{ label: "Terms & Conditions" }]}
        eyebrow="Commercial & Operational Guidelines"
        title="Terms & Conditions"
        intro="These Terms & Conditions explain how Urban Craft & Co. operates its website, handles product enquiries, issues commercial quotations, and fulfills customized corporate orders across India."
      />
      <Prose>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Last Updated: 8 November 2026 &bull; Status: Draft for Review
        </p>

        <h2>1. About Urban Craft & Co. & Commercial Status</h2>
        <p>
          Urban Craft &amp; Co. is a sole proprietorship based in New Delhi, India, engaged in the
          curation, bespoke branding, assembly, and pan-India supply of corporate gift sets,
          employee onboarding kits, promotional merchandise, executive leatherette accessories, and
          lifestyle drinkware.
        </p>
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and interaction
          with our website (<span>{BUSINESS.siteUrl}</span>), digital product catalogues, and online
          enquiry forms. By accessing our website, browsing our collections, or submitting an
          enquiry, you acknowledge that you have read, understood, and agreed to be bound by these
          Terms.
        </p>

        <h2>2. Scope of Website: Enquiry-Only Platform</h2>
        <p>
          <strong>No Direct E-Commerce Checkout:</strong> Our website operates exclusively as an
          online portfolio, digital showcase, and business enquiry facility. It does not contain an
          automated shopping cart, payment gateway, or instantaneous checkout mechanism.
        </p>
        <p>
          <strong>Enquiries Do Not Create Orders:</strong> Submitting an enquiry through our online
          forms, shortlisting items in your favorites list, or requesting a catalog download does{" "}
          <em>not</em> constitute a binding purchase contract, nor does it place, confirm, or
          reserve an order with Urban Craft &amp; Co.
        </p>
        <p>
          An order is created and confirmed only through a separate, bilateral written process,
          typically involving an approved formal quotation, signed Purchase Order (PO), or mutually
          confirmed commercial statement of work.
        </p>

        <h2>3. Quotations, Pricing &amp; Commercial Terms</h2>
        <p>
          Because corporate gifting orders vary significantly based on volume, branding complexity,
          materials, and logistics, all pricing is customized:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Written Quotations:</strong> Following receipt of your enquiry, our team will
            prepare and issue a formal written quotation specifying unit prices, applicable Goods
            and Services Tax (GST), branding setup fees, packaging specifications, and delivery
            charges.
          </li>
          <li>
            <strong>Validity:</strong> Quotations remain valid for the period stated on the quote
            document (typically 15 calendar days from issuance) to account for raw material and
            freight fluctuations.
          </li>
          <li>
            <strong>Taxes &amp; Statutory Compliance:</strong> Invoices are raised in accordance
            with Indian tax laws, displaying our registered Goods and Services Tax Identification
            Number (GSTIN: <code>07AEGPF3058P1Z7</code>).
          </li>
          <li>
            <strong>Payment Milestones:</strong> Standard B2B terms generally require an advance
            deposit upon order confirmation to fund raw material procurement and production setup,
            with the remaining balance due against dispatch proof or delivery as mutually agreed in
            the quotation. Payments are accepted through standard banking channels (NEFT, RTGS,
            IMPS, UPI, or corporate cheques).
          </li>
        </ul>

        <h2>4. Product Representation, Materials &amp; Tolerances</h2>
        <p>
          We pride ourselves on superior craftsmanship and make every reasonable effort to display
          product dimensions, materials, colours, and finishing options accurately.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Natural &amp; Handcrafted Variations:</strong> Many of our gifts incorporate
            natural materials such as bamboo, cork, canvas, jute, natural leather, or handcrafted
            paper. Inherent variations in grain, texture, natural colour tones, and dye lots are
            normal characteristics of genuine materials and do not constitute manufacturing defects.
          </li>
          <li>
            <strong>Screen &amp; Digital Calibration:</strong> Digital product photography and
            screen displays may show slight colour nuances compared to tangible physical products
            under different ambient lighting.
          </li>
          <li>
            <strong>Material Tolerances:</strong> Minor dimensional tolerances within industry
            standards (&plusmn;2–5% for soft goods and textiles) are standard across bulk
            manufacturing.
          </li>
        </ul>

        <h2>5. Customisation, Branding &amp; Digital Proofing</h2>
        <p>
          Personalized branding—including laser engraving, screen printing, UV flatbed printing,
          debossing, foil stamping, and embroidery—is executed to precise specifications:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Proof Approval Obligation:</strong> Before any branding or manufacturing begins,
            we generate a digital artwork mockup or 2D/3D proof for client review. The client is
            strictly responsible for reviewing and verifying all elements, including spelling,
            designations, Pantone colour matches, logo scale, and positioning.
          </li>
          <li>
            <strong>Production Commences Upon Approval:</strong> Branding setup and production will
            not proceed without explicit, written client approval (via email or authorized
            messaging).
          </li>
          <li>
            <strong>Client Intellectual Property Warranty:</strong> You represent and warrant that
            your organization owns or holds all necessary licences and authorisations for any logo,
            trademark, graphic, or design supplied to us. You agree to hold Urban Craft &amp; Co.
            harmless from any third-party intellectual property infringement claims arising from
            your supplied artwork.
          </li>
        </ul>

        <h2>6. Order Confirmation &amp; Execution</h2>
        <p>
          An order is deemed confirmed and scheduled for production only when all of the following
          conditions are met:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>The written quotation or Purchase Order is formally accepted by both parties.</li>
          <li>The digital artwork proofs have been approved in writing by the client.</li>
          <li>
            The agreed advance payment or credit terms have been received and verified by our
            finance desk.
          </li>
        </ol>

        <h2>7. Shipping, Delivery &amp; Transit</h2>
        <p>
          We arrange delivery across India through contracted express courier networks and surface
          cargo transporters. Specific delivery schedules, freight charges, and logistics terms are
          governed by our dedicated{" "}
          <a href="/shipping-policy" className="font-medium text-olive underline">
            Shipping &amp; Delivery Policy
          </a>
          .
        </p>

        <h2>8. Cancellation, Returns &amp; Quality Remedies</h2>
        <p>
          Submitting a website enquiry carries zero financial obligation and may be abandoned at any
          time prior to order confirmation.
        </p>
        <p>
          Once an order is confirmed, bespoke procurement and custom branding begin. Cancellations,
          returns, and quality remediations are governed by our{" "}
          <a href="/cancellation-returns" className="font-medium text-olive underline">
            Cancellation, Returns &amp; Refunds Policy
          </a>
          . Because customized goods cannot be restocked or repurposed, change-of-mind cancellations
          after production begins are subject to actual costs incurred. Genuine transit damage,
          manufacturing defects, or material deviations from approved specifications will be
          promptly remedied.
        </p>

        <h2>9. Website Content &amp; Intellectual Property</h2>
        <p>
          All content published on this website—including text, editorial narratives, curated
          product names, photography, graphics, logos, and user interface styling—is the proprietary
          property of Urban Craft &amp; Co. or used under licence. You may not reproduce, scrape,
          mirror, distribute, or republish any website content for commercial gain without prior
          written authorization.
        </p>

        <h2>10. Acceptable Use &amp; Platform Security</h2>
        <p>
          You agree to use this website solely for bona fide commercial or personal gifting
          enquiries. You agree not to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Transmit false, deceptive, or automated spam enquiries.</li>
          <li>
            Attempt to interfere with website infrastructure, circumvent security controls, reverse
            engineer scripts, or introduce malicious payloads.
          </li>
          <li>Extract bulk catalog data or pricing models via automated scrapers.</li>
        </ul>

        <h2>11. Limitation of Liability &amp; Force Majeure</h2>
        <p>
          While we exercise commercial diligence to fulfill every order to the highest standard and
          on schedule, Urban Craft &amp; Co. shall not be held liable for delays or failures in
          performance resulting from events beyond our reasonable control (&quot;Force
          Majeure&quot;). These include, but are not limited to: natural calamities, extreme
          weather, strikes, regional transportation disruptions, courier network paralysis, supply
          chain blockades, government restrictions, or utility outages.
        </p>
        <p>
          In all circumstances, our maximum aggregate commercial liability in connection with any
          order shall not exceed the actual amount received by us for the specific affected
          products.
        </p>

        <h2>12. Preservation of Statutory Rights &amp; Amendments</h2>
        <p>
          Nothing in these Terms is intended to limit or exclude any statutory rights, warranties,
          or remedies that cannot lawfully be disclaimed or limited under applicable Indian consumer
          protection or contract laws.
        </p>
        <p>
          We reserve the right to revise these Terms as our commercial offerings and legal
          obligations evolve. Updated versions will be published on this page with a revised
          &quot;Last Updated&quot; date.
        </p>

        <h2>13. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms, and all commercial contracts arising from confirmed orders, shall be governed
          by and construed in accordance with the laws of the Republic of India. Subject to mutual
          good-faith dispute resolution, any legal proceedings shall be subject to the exclusive
          jurisdiction of the competent courts in New Delhi, India.
        </p>

        <h2>14. Commercial Contact Details</h2>
        <p>
          For any questions, commercial clarifications, or formal communications regarding these
          Terms &amp; Conditions, please reach out to:
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 not-prose text-sm space-y-1.5">
          <p className="font-semibold text-olive">{BUSINESS.name}</p>
          <p className="text-slate">
            Email:{" "}
            <a href={`mailto:${BUSINESS.email}`} className="text-olive underline">
              {BUSINESS.email}
            </a>
          </p>
          <p className="text-slate">
            Phone:{" "}
            <a href={`tel:${BUSINESS.phoneE164}`} className="text-olive underline">
              {BUSINESS.phoneDisplay}
            </a>
          </p>
          <p className="text-slate">
            GSTIN: <code>07AEGPF3058P1Z7</code>
          </p>
          <p className="text-xs text-muted-foreground pt-1">
            Official business inquiries and registered vendor documentation are processed during
            standard business hours: {BUSINESS.hours}.
          </p>
        </div>
      </Prose>
    </>
  ),
});
