import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/common/PageParts";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/shipping-policy")({
  head: () =>
    pageHead({
      title: "Shipping & Delivery Policy",
      description:
        "Detailed pan-India shipping and delivery guidelines for Urban Craft & Co. corporate gifts, customized employee welcome hampers, and bulk consignments.",
      path: "/shipping-policy",
    }),
  component: () => (
    <>
      <PageHeader
        crumbs={[{ label: "Shipping & Delivery" }]}
        eyebrow="Logistics & Pan-India Dispatch"
        title="Shipping & Delivery Policy"
        intro="Understand our end-to-end shipping process, custom production lead times, pan-India courier coverage, freight charges, and consignment receipt guidelines."
      />
      <Prose>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Last Updated: 8 November 2026 &bull; Status: Draft for Review
        </p>

        <h2>1. Pan-India Delivery Scope &amp; Geographic Reach</h2>
        <p>
          Urban Craft &amp; Co. coordinates reliable, nationwide delivery across India for standard
          and custom-branded corporate gifts. Our logistics network encompasses:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Tier-1 &amp; Metro Cities:</strong> New Delhi &amp; NCR (Gurugram, Noida,
            Faridabad, Ghaziabad), Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, and
            Ahmedabad.
          </li>
          <li>
            <strong>Tier-2 &amp; Tier-3 Commercial Hubs:</strong> Chandigarh, Jaipur, Lucknow,
            Kochi, Indore, Surat, Coimbatore, Nagpur, Bhubaneswar, Patna, Visakhapatnam, and
            surrounding industrial corridors.
          </li>
          <li>
            <strong>Special Economic Zones &amp; Business Parks:</strong> Corporate tech campuses,
            SEZ units, and industrial estates subject to verified gate security protocols.
          </li>
          <li>
            <strong>Remote &amp; Non-Metro PIN Codes:</strong> Delivery feasibility, courier
            serviceability, and transit times for remote or special postal codes are confirmed
            during the quotation stage prior to order confirmation.
          </li>
        </ul>

        <h2>2. Dual-Stage Order Timelines: Production vs. Transit</h2>
        <p>
          Corporate gifting consignments involve two distinct phases: pre-dispatch customization and
          in-transit delivery. Timelines are evaluated and established for each order individually:
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 not-prose text-sm space-y-3">
          <div>
            <span className="font-semibold text-olive block">
              Phase 1: Production &amp; Custom Branding Lead Time
            </span>
            <span className="text-slate text-xs leading-relaxed block mt-1">
              Begins only after written client approval of digital artwork proofs and confirmation
              of agreed advance commercial terms. Ready-stock catalog items without branding
              typically require 2–4 business days for QC and packing. Custom-branded hampers,
              laser-engraved sets, or bespoke presentation boxes typically require 5–12 business
              days depending on volume and branding technique.
            </span>
          </div>
          <div className="border-t border-border/70 pt-3">
            <span className="font-semibold text-olive block">
              Phase 2: In-Transit Courier &amp; Cargo Time
            </span>
            <span className="text-slate text-xs leading-relaxed block mt-1">
              Begins upon handover to our contracted courier partner. Metro-to-metro air shipments
              typically deliver within 2–4 business days. Regional destinations, Tier-2/3 hubs, or
              heavy surface cargo consignments typically deliver within 4–7 business days following
              dispatch.
            </span>
          </div>
        </div>

        <h2>3. Freight Modes &amp; Dispatch Options</h2>
        <p>
          Depending on order volume, consignment weight, budget preferences, and delivery urgency,
          we provide multiple dispatch options:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Express Air Cargo / Courier:</strong> Recommended for time-sensitive deliveries,
            compact gift sets, executive presentation kits, and samples. Dispatched via tier-1 air
            express carriers (e.g., Blue Dart, Delhivery Air).
          </li>
          <li>
            <strong>Surface Cargo &amp; Bulk Logistics:</strong> Cost-effective solution for
            palletized consignments, high-volume bulk sets, heavy drinkware cartons, and large
            luggage or bag orders. Dispatched through verified commercial cargo transporters (e.g.,
            V-Trans, TCI, Safechem, Delhivery Surface).
          </li>
          <li>
            <strong>Local NCR Dedicated Dispatch:</strong> For large-scale consignments within
            Delhi, Gurugram, and Noida, dedicated direct-vehicle transport may be scheduled for
            direct dock delivery.
          </li>
        </ul>

        <h2>4. Freight Charges, Packaging &amp; Local Levies</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Transparent Quotations:</strong> Estimated freight charges, fuel surcharges, and
            handling fees are itemized in your written quotation. Unless expressly agreed otherwise,
            freight is billed as part of the overall commercial invoice.
          </li>
          <li>
            <strong>Freight-to-Pay / Client Logistics:</strong> Corporate enterprise clients with
            existing contracted logistics accounts may arrange freight pickup from our New Delhi
            warehouse on a freight-collect basis by mutual agreement.
          </li>
          <li>
            <strong>Protective Master Packaging:</strong> All merchandise is packed in export-grade,
            heavy-duty corrugated outer master cartons with corner protectors, internal cushioning,
            bubble cushioning, and waterproof strapping to withstand handling during transit.
          </li>
          <li>
            <strong>Local Permits &amp; Entry Levies:</strong> Any destination-specific municipal
            levies, state entry permits, or special SEZ gate clearances required by local
            authorities must be facilitated by the consignee.
          </li>
        </ul>

        <h2>5. Multi-Location &amp; Work-From-Home (WFH) Dispatches</h2>
        <p>
          For distributed teams, national sales meets, and remote employee welcome kits, we support
          direct-to-home multi-address dispatches across India:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Validated Address Template:</strong> Clients must provide a standardized
            Excel/CSV recipient sheet containing validated full names, complete residential street
            addresses, correct PIN codes, and active mobile numbers.
          </li>
          <li>
            <strong>Individual Packing &amp; Courier Dockets:</strong> Each kit is individually
            packed, barcoded, and dispatched with an individual courier tracking docket.
          </li>
          <li>
            <strong>Handling Surcharges:</strong> Multi-address kitting, individual boxing, and
            individual tracking administration are quoted as an itemized service fee in the
            proposal.
          </li>
        </ul>

        <h2>6. Consignee Responsibilities &amp; Failed Deliveries</h2>
        <p>To ensure timely, seamless delivery, the client or consignee is responsible for:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Providing accurate, comprehensive address details (including building name, floor, wing,
            gate number, landmark, and correct PIN code).
          </li>
          <li>
            Ensuring a designated recipient or security team is available to accept delivery during
            standard business hours.
          </li>
          <li>
            Securing any advance gate passes or corporate security clearances required for delivery
            trucks entering private commercial IT parks or gated campuses.
          </li>
        </ul>
        <p>
          If a delivery fails or is returned to our warehouse due to incorrect address information,
          prolonged consignee unavailability, or gate refusal, the client will be responsible for
          all associated return freight (RTO charges) and re-dispatch costs.
        </p>

        <h2>7. Consignment Tracking &amp; Dispatch Alerts</h2>
        <p>
          Upon handover to the logistics carrier, our operations desk generates a formal dispatch
          advice email or message. This communication includes the carrier name, airway bill /
          docket number, number of master cartons, and an online tracking portal link so your team
          can monitor the shipment in real time.
        </p>

        <h2>8. Delivery Inspection &amp; Proof of Delivery (POD)</h2>
        <p>
          To safeguard against carrier transit mishaps, please adhere to our receiving protocol:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>External Carton Inspection:</strong> Before signing the physical delivery
            receipt or acknowledging digital OTP, visually inspect the exterior of all master
            cartons.
          </li>
          <li>
            <strong>Noting Discrepancies on POD:</strong> If any master box exhibits noticeable
            tampering, crushed edges, tear, water damage, or damaged sealing tape, explicitly note
            &quot;Received in Damaged Condition / Subject to Verification&quot; on the
            courier&apos;s delivery manifest before signing.
          </li>
          <li>
            <strong>Photographic Evidence:</strong> Take clear photographs or video of the affected
            cartons from multiple angles before moving or opening them.
          </li>
          <li>
            <strong>Internal Verification:</strong> Unpack and inspect contents promptly. Any
            shortage, damage, or defect must be reported in accordance with our{" "}
            <a href="/cancellation-returns" className="font-medium text-olive underline">
              Cancellation, Returns &amp; Refunds Policy
            </a>
            .
          </li>
        </ol>

        <h2>9. Force Majeure &amp; Transit Disruptions</h2>
        <p>
          While we partner exclusively with reputable national logistics carriers, transit timelines
          remain realistic operational estimates. Urban Craft &amp; Co. is not liable for
          unavoidable transit delays caused by courier routing congestion, festive peak volume,
          severe weather, highway blockages, regional transport strikes, or civil restrictions. In
          the event of a known delay, our team will proactively follow up with carrier dispatchers
          to expedite clearance.
        </p>

        <h2>10. Logistics Support Desk</h2>
        <p>
          For live tracking updates, address modifications prior to dispatch, or delivery support,
          please contact our logistics desk:
        </p>
        <div className="rounded-2xl border border-border bg-card p-5 not-prose text-sm space-y-1.5">
          <p className="font-semibold text-olive">
            {BUSINESS.name} — Logistics &amp; Dispatch Desk
          </p>
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
          <p className="text-slate">Operational Hours: {BUSINESS.hours}</p>
        </div>
      </Prose>
    </>
  ),
});
