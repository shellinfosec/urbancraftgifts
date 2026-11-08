import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    pageHead({
      title: "Privacy Policy",
      description:
        "Learn how Urban Craft & Co. collects, processes, protects, and retains client information shared through website enquiries and corporate gifting engagements.",
      path: "/privacy-policy",
    }),
  component: () => (
    <>
      <PageHeader
        crumbs={[{ label: "Privacy Policy" }]}
        eyebrow="Data Protection & Privacy Standards"
        title="Privacy Policy"
        intro="Urban Craft & Co. is committed to protecting your personal and corporate privacy. This Privacy Policy details how we handle information shared through our digital enquiry channels and commercial engagements."
      />
      <Prose>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Last Updated: 8 November 2026 &bull; Status: Draft for Review
        </p>

        <h2>1. Scope &amp; Privacy Commitment</h2>
        <p>
          Urban Craft &amp; Co. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects the
          privacy of every visitor, corporate client, and business partner. We operate an
          enquiry-first platform designed to minimize unnecessary data capture.
        </p>
        <p>
          This Privacy Policy describes the categories of data we collect, why we collect it, how it
          is processed, with whom it is shared, and how you can exercise control over your personal
          data in accordance with the Information Technology Act, 2000, and applicable Indian data
          protection principles.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We collect only information that you voluntarily submit to us or that is technically
          necessary to facilitate your enquiry and ensure website integrity:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Contact &amp; Professional Identity:</strong> Full name, corporate email
            address, mobile/WhatsApp telephone number, company or organization name, job
            designation, and office location.
          </li>
          <li>
            <strong>Gifting Project Specifications:</strong> Target recipient group (e.g., employee
            welcome, executive rewards, Diwali gifting), estimated quantities, target delivery
            deadlines, budget guidelines, and preferred product categories.
          </li>
          <li>
            <strong>Branding Assets &amp; Custom Artwork:</strong> Vector logo files (AI, EPS, SVG,
            PDF), brand identity guidelines, typography preferences, colour codes (Pantone/CMYK),
            and recipient name lists supplied for personalized laser engraving or printing.
          </li>
          <li>
            <strong>Essential Browser Storage:</strong> To provide a seamless user experience, our
            website uses client-side browser storage (such as <code>LocalStorage</code> and{" "}
            <code>SessionStorage</code>) on your own device. This securely stores your product
            shortlist (&quot;Favourites&quot;) and preserves active multi-step enquiry drafts across
            browser refreshes. This data remains on your device until you submit the enquiry form or
            clear your browser cache.
          </li>
          <li>
            <strong>Technical Log Data:</strong> When you access our website, standard web server
            infrastructure logs basic technical metadata (such as IP address, browser type and
            version, device category, referring URL, and server request timestamps). These logs are
            used strictly for website maintenance, capacity planning, and security audits.
          </li>
        </ul>

        <h2>3. Purpose of Data Processing</h2>
        <p>We process the information you share exclusively for lawful commercial purposes:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Enquiry Assessment &amp; Proposal Preparation:</strong> To review your gifting
            brief, verify product availability, formulate pricing structures, and issue formal
            commercial quotations.
          </li>
          <li>
            <strong>Design &amp; Pre-Production Proofing:</strong> To generate visual mockups, 2D/3D
            artwork placements, and custom branding proofs for client sign-off.
          </li>
          <li>
            <strong>Order Execution &amp; Assembly:</strong> To procure inventory, configure
            customized packaging, and oversee production quality.
          </li>
          <li>
            <strong>Pan-India Logistics &amp; Dispatch Coordination:</strong> To generate shipping
            labels, coordinate freight pickups, share consignment tracking dockets, and ensure
            accurate physical delivery.
          </li>
          <li>
            <strong>Tax &amp; Statutory Accounting:</strong> To issue official GST tax invoices,
            record banking remittances, reconcile accounts, and comply with Indian statutory audit
            mandates.
          </li>
          <li>
            <strong>Spam &amp; Threat Mitigation:</strong> To protect our enquiry forms against
            automated bots, distributed attacks, and fraudulent requests.
          </li>
        </ul>

        <h2>4. Explicit Non-Sale of Data</h2>
        <p>
          We do <strong>not</strong> sell, rent, monetize, or lease your personal or corporate data
          to advertising networks, marketing intermediaries, or third-party data brokers. Your
          contact details are used strictly in connection with your business relationship with Urban
          Craft &amp; Co.
        </p>

        <h2>5. Lawful &amp; Operational Information Sharing</h2>
        <p>
          To deliver our corporate gifting services, we may share relevant data on a strictly
          confidential, need-to-know basis with trusted operational partners:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Logistics &amp; Courier Partners:</strong> We share consignee names, delivery
            addresses, and contact phone numbers with reputable express courier companies (e.g.,
            Blue Dart, Delhivery, DTDC) and commercial freight transporters to facilitate delivery
            and SMS/tracking updates.
          </li>
          <li>
            <strong>Specialized Branding Workshops:</strong> Where proprietary branding processes
            (such as precision laser engraving, deep foil embossing, or textile embroidery) are
            performed by contracted specialists, approved artwork files and placement dimensions are
            shared strictly for production execution.
          </li>
          <li>
            <strong>Statutory &amp; Professional Advisers:</strong> Transactional, billing, and
            payment records may be reviewed by our certified chartered accountants, tax auditors, or
            legal advisors to satisfy Indian statutory compliance.
          </li>
          <li>
            <strong>Legal &amp; Regulatory Authorities:</strong> We may disclose information where
            mandated by law, court summons, government investigation, or regulatory decree, or to
            enforce our legal rights and defend against claims.
          </li>
        </ul>

        <h2>6. Security Safeguards &amp; Realistic Expectations</h2>
        <p>
          We implement commercially reasonable administrative, procedural, and technical safeguards
          to shield client information from unauthorized access, accidental alteration, disclosure,
          or destruction. Access to client briefs and proprietary corporate artwork is restricted to
          personnel directly engaged in order fulfillment.
        </p>
        <p>
          However, please recognize that no system of electronic transmission or cloud storage is
          entirely impenetrable. While we take diligent precautions, we cannot guarantee absolute
          security against sophisticated cyber incidents beyond our reasonable control.
        </p>

        <h2>7. Data Retention &amp; Storage Protocols</h2>
        <p>
          We retain enquiry submissions, commercial correspondence, and design files only for as
          long as necessary to fulfill commercial commitments, maintain customer relationship
          histories, and satisfy Indian statutory requirements:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Enquiries Without Orders:</strong> Enquiries that do not convert into confirmed
            orders are routinely archived or deleted after reasonable follow-up periods.
          </li>
          <li>
            <strong>Confirmed Orders &amp; Tax Records:</strong> Invoices, delivery receipts, and
            accounting ledgers are retained for a minimum of 8 years in strict accordance with the
            Goods and Services Tax (GST) Act, Income Tax Act, and Indian corporate record-keeping
            mandates.
          </li>
          <li>
            <strong>Branding Artwork:</strong> We retain approved vector files to streamline
            seamless re-orders for returning corporate clients, unless you request their deletion.
          </li>
        </ul>

        <h2>8. Your Rights &amp; Choices</h2>
        <p>As a valued client, you have clear rights regarding the data we hold:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Access &amp; Review:</strong> You may request a summary of the contact
            information or business details we hold on record.
          </li>
          <li>
            <strong>Correction &amp; Updating:</strong> You may notify us at any time to rectify
            outdated, inaccurate, or incomplete contact details.
          </li>
          <li>
            <strong>Marketing Opt-Out:</strong> If you receive periodic product catalogs or festive
            gifting bulletins from us, you can opt out at any time by replying with
            &quot;Unsubscribe&quot; or contacting our privacy desk.
          </li>
          <li>
            <strong>Data Deletion:</strong> You may request the deletion of your enquiry data,
            subject to our legal obligation to preserve records required for taxation, statutory
            audit, or contractual dispute defense.
          </li>
        </ul>

        <h2>9. Third-Party Integrations &amp; External Links</h2>
        <p>
          Our website incorporates external service links to facilitate communication, including
          direct WhatsApp chat support and embedded Google Maps for location guidance. These
          services operate under their own respective privacy statements. We encourage you to review
          their policies when interacting with third-party platforms.
        </p>

        <h2>10. Updates to This Policy</h2>
        <p>
          We may revise this Privacy Policy periodically to reflect enhancements in our data
          management practices or changes in applicable Indian statutes. Any revisions will be
          published on this page with an updated &quot;Last Updated&quot; date.
        </p>

        <h2>11. Privacy Contact &amp; Grievance Support</h2>
        <p>
          For privacy inquiries, data review requests, or questions regarding our information
          practices, please reach out to:
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 not-prose text-sm space-y-1.5">
          <p className="font-semibold text-olive">{BUSINESS.name} — Data &amp; Privacy Desk</p>
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
            Privacy inquiries are reviewed and addressed within 3–5 Indian business days.
          </p>
        </div>
      </Prose>
    </>
  ),
});
