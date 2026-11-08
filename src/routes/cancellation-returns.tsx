import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cancellation-returns")({
  head: () =>
    pageHead({
      title: "Cancellation, Returns & Refunds Policy",
      description:
        "Comprehensive guidelines on order cancellation, bespoke merchandise returns, transit damage claims, and refund processing for Urban Craft & Co.",
      path: "/cancellation-returns",
    }),
  component: () => (
    <>
      <PageHeader
        crumbs={[{ label: "Cancellation & Returns" }]}
        eyebrow="Quality Assurance & Commercial Remedies"
        title="Cancellation, Returns & Refunds Policy"
        intro="Clear, balanced, and startup-appropriate policies regarding order cancellation stages, customized product returns, transit damage inspections, and financial remedies."
      />
      <Prose>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Last Updated: 8 November 2026 &bull; Status: Draft for Review
        </p>

        <h2>1. Website Enquiries Incur Zero Cancellation Liability</h2>
        <p>
          Submitting a product enquiry, building a shortlisted selection, or requesting a commercial
          quotation on our website does not create a binding order. If your gifting project
          timeline, budget, or requirements change prior to formal written confirmation, you may
          withdraw or close your enquiry at any time without incurring any cancellation penalty or
          fee.
        </p>

        <h2>2. Cancellation of Confirmed Commercial Orders</h2>
        <p>
          Once a quotation has been accepted, an official Purchase Order (PO) issued, or an advance
          deposit remitted, commercial commitments (such as inventory reservation, blank stock
          procurement, tool fabrication, and custom branding scheduling) begin immediately.
        </p>
        <p>
          If you need to cancel or adjust a confirmed order, contact us immediately by phone (
          <a href={`tel:${BUSINESS.phoneE164}`} className="text-olive underline">
            {BUSINESS.phoneDisplay}
          </a>
          ) and confirm the request in writing to{" "}
          <a href={`mailto:${BUSINESS.email}`} className="text-olive underline">
            {BUSINESS.email}
          </a>
          . Cancellations are evaluated based on the order stage:
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 not-prose text-sm space-y-4">
          <div>
            <span className="font-semibold text-olive block">
              Stage A: Pre-Procurement &amp; Pre-Production
            </span>
            <p className="text-slate text-xs leading-relaxed mt-1">
              If cancellation is requested before physical stock has been procured from factories
              and before any physical printing setup or tooling has begun, the order may be
              cancelled. Any advance remitted will be refunded minus any actual, provable
              administrative costs or specialized design-proofing fees incurred up to that point.
            </p>
          </div>
          <div className="border-t border-border/70 pt-3">
            <span className="font-semibold text-olive block">
              Stage B: Post-Procurement or After Custom Branding Commences
            </span>
            <p className="text-slate text-xs leading-relaxed mt-1">
              Because corporate gifts and welcome hampers personalized with your corporate logo,
              bespoke colours, or custom typography cannot be repurposed, restocked, or resold,
              cancellation cannot be granted on a full refund basis. The client remains responsible
              for all actual costs incurred, including dedicated raw materials, procured stock,
              setup and die-making expenses, completed branding runs, and customized packaging. Any
              remaining unspent balance from the advance payment will be returned or credited to the
              client.
            </p>
          </div>
        </div>

        <h2>3. Policy on Bespoke &amp; Customised Merchandise</h2>
        <p>
          <strong>No Change-of-Mind Returns:</strong> Customized, corporate-branded merchandise and
          bespoke curated hampers cannot be returned or refunded due to client change of mind,
          internal budget reallocations, excess order estimates, or aesthetic reconsideration after
          delivery has taken place in accordance with the approved artwork proof.
        </p>
        <p>
          <strong>Client Sign-Off Responsibility:</strong> The client is strictly responsible for
          reviewing and signing off on the digital artwork proof, including text spelling, names,
          logo proportions, and Pantone color specifications. Products manufactured in faithful
          compliance with the approved proof cannot be returned for errors that existed in the
          signed-off proof.
        </p>

        <h2>4. Genuine Quality Issues, Transit Damage &amp; Non-Conformity</h2>
        <p>
          Urban Craft &amp; Co. stands behind the craftsmanship and reliability of our gifts. We
          will promptly investigate, inspect, and rectify any order where delivered merchandise
          exhibits:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Transit Damage:</strong> Structural breakage, denting, crushing, or leakage
            incurred during carrier transit.
          </li>
          <li>
            <strong>Manufacturing Defects:</strong> Functional failures (e.g., non-working
            electronic accessories, defective zippers, failed vacuum insulation in drinkware, broken
            stitching).
          </li>
          <li>
            <strong>Incorrect Supply:</strong> Discrepancies in delivered product models, omitted
            components of a gift set, or short-shipped quantities compared to the accepted invoice.
          </li>
          <li>
            <strong>Material Non-Conformity:</strong> Noticeable branding errors, inverted logos, or
            material deviations from the specifications approved in the digital proof.
          </li>
        </ul>

        <h2>5. Recommended Reporting Window &amp; Evidence Submission</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Recommended 48-Hour Inspection:</strong> We strongly encourage client teams to
            open, count, and inspect consignments within <strong>48 hours</strong> of physical
            delivery. Prompt notification is crucial for us to file carrier insurance claims and
            initiate immediate workshop remakes.
          </li>
          <li>
            <strong>Preservation of Statutory Rights:</strong> This 48-hour recommended reporting
            window is an operational guideline designed to expedite rapid claim processing; it does{" "}
            <em>not</em> restrict, shorten, or extinguish any statutory legal rights or remedies
            available to consumers under the <em>Consumer Protection Act, 2019</em> or the{" "}
            <em>Indian Contract Act, 1872</em>.
          </li>
          <li>
            <strong>Required Verification Information:</strong> To assist our prompt investigation,
            please email{" "}
            <a href={`mailto:${BUSINESS.email}`} className="text-olive underline">
              {BUSINESS.email}
            </a>{" "}
            with:
            <ul className="list-circle space-y-1 pl-5 pt-1.5 text-xs">
              <li>Quotation or Invoice reference number.</li>
              <li>A concise description of the defect, damage, or discrepancy.</li>
              <li>
                Clear, well-lit photographs or short unboxing videos showing the outer carton,
                shipping label, and the specific defective units.
              </li>
            </ul>
          </li>
        </ul>

        <h2>6. Available Remediation Options</h2>
        <p>
          Upon verifying a legitimate product defect, transit damage, or specification error, Urban
          Craft &amp; Co. will provide an appropriate, fair resolution agreed upon with the client:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Priority Replacement:</strong> Re-manufacturing and dispatching replacement
            units for defective, damaged, or missing items at our sole expense via express courier.
          </li>
          <li>
            <strong>Rectification &amp; Component Replacement:</strong> Supplying replacement
            modular components (e.g., charging cables, notebook refills, customized pens) where
            complete set replacement is unnecessary.
          </li>
          <li>
            <strong>Commercial Credit Note or Refund:</strong> If replacement is unfeasible due to
            stock exhaustion or urgent event deadlines that have passed, issuing a proportional
            credit note or bank refund for the affected units.
          </li>
        </ol>

        <h2>7. Financial Refund Processing Protocols</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Direct Bank Remittance:</strong> Approved financial refunds are disbursed via
            original electronic banking channels (NEFT, RTGS, or corporate IMPS) to the
            client&apos;s verified business bank account.
          </li>
          <li>
            <strong>Processing Timeline:</strong> Once a refund is mutually agreed upon in writing,
            our finance desk processes the remittance within{" "}
            <strong>7 to 10 Indian business days</strong>.
          </li>
          <li>
            <strong>Proportional Application:</strong> Refunds apply strictly to the defective,
            damaged, or missing units and do not apply to undamaged, fully compliant items accepted
            under the order.
          </li>
        </ul>

        <h2>8. Claims &amp; Quality Resolution Desk</h2>
        <p>
          For quality concerns, damage claims, or cancellation inquiries, please reach out directly
          to our dedicated support desk:
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 not-prose text-sm space-y-1.5">
          <p className="font-semibold text-olive">{BUSINESS.name} — Quality &amp; Claims Desk</p>
          <p className="text-slate">
            Email:{" "}
            <a href={`mailto:${BUSINESS.email}`} className="text-olive underline">
              {BUSINESS.email}
            </a>
          </p>
          <p className="text-slate">
            Direct Phone:{" "}
            <a href={`tel:${BUSINESS.phoneE164}`} className="text-olive underline">
              {BUSINESS.phoneDisplay}
            </a>
          </p>
          <p className="text-slate">
            GSTIN: <code>07AEGPF3058P1Z7</code>
          </p>
          <p className="text-xs text-muted-foreground pt-1">
            Claims are acknowledged within 4 business hours and prioritized for rapid resolution.
          </p>
        </div>
      </Prose>
    </>
  ),
});
