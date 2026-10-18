import type { LucideIcon } from "lucide-react";
import {
  Gift,
  Users,
  CalendarDays,
  PenTool,
  PackageCheck,
  Layers,
  MessageCircle,
  ClipboardList,
  BadgeCheck,
  Truck,
  Boxes,
  Sparkles,
  Handshake,
} from "lucide-react";

export interface Service {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: LucideIcon;
  categories: string[];
}

export const SERVICES: Service[] = [
  {
    id: "corporate-gifting",
    title: "Corporate Gifting",
    summary: "Festive, milestone and thank-you gifts for employees, clients and partners.",
    detail:
      "Tell us who the gift is for, how many people and roughly when. We shortlist sets and individual pieces from the catalogue, then help you settle on a final selection and branding.",
    icon: Gift,
    categories: ["3-in-1-gift-sets", "5-in-1-gift-sets", "premium-bigger-gift-sets"],
  },
  {
    id: "onboarding-kits",
    title: "Employee Onboarding Kits",
    summary: "Welcome kits that new joiners receive on their first day.",
    detail:
      "Combine a bag, bottle, notebook, pen and desk items into a kit that matches your brand. Useful for one-off hiring drives and for ongoing onboarding.",
    icon: Users,
    categories: ["employee-welcome-kits", "backpacks", "bottles-drinkware"],
  },
  {
    id: "event-gifting",
    title: "Event & Conference Gifting",
    summary: "Delegate kits, speaker gifts and giveaways for conferences and offsites.",
    detail:
      "Folders, carry bags, drinkware and compact sets that are practical for delegates to carry and easy to brand in volume.",
    icon: CalendarDays,
    categories: ["conference-folders", "jute-carry-bags", "2-in-1-gift-sets"],
  },
  {
    id: "custom-branding",
    title: "Custom Branding",
    summary: "Your logo applied with a method suited to each product.",
    detail:
      "Depending on the material, products can typically be branded with laser engraving, screen printing, UV printing, debossing or embossing. We confirm what is feasible for each item before you order.",
    icon: PenTool,
    categories: ["leather-laptop-bags", "4-in-1-gift-sets"],
  },
  {
    id: "bulk-orders",
    title: "Bulk Order Assistance",
    summary: "One point of contact from shortlist to dispatch.",
    detail:
      "Share your quantity, timeline and delivery locations. We coordinate selection, branding approval and packing so your team does not have to manage multiple vendors.",
    icon: PackageCheck,
    categories: ["6-in-1-gift-sets", "7-in-1-gift-sets", "duffle-bags"],
  },
];

export const PROCESS_STEPS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Browse & shortlist",
    body: "Save products to favourites or send us a category you like.",
    icon: Layers,
  },
  {
    title: "Share your brief",
    body: "Quantity, timeline, logo and delivery location - whatever you know so far.",
    icon: ClipboardList,
  },
  {
    title: "Review options",
    body: "We confirm branding methods and suggest alternatives where needed.",
    icon: MessageCircle,
  },
  {
    title: "Approve & dispatch",
    body: "Approve the final selection and artwork; we take it from there.",
    icon: BadgeCheck,
  },
];

export const VALUE_PROPS: { title: string; body: string; icon: LucideIcon }[] = [
  { title: "Curated gift sets", body: "Boxed selections, ready to brand", icon: Boxes },
  { title: "Logo customization", body: "Engraving, printing, debossing and more", icon: PenTool },
  { title: "Bulk-order help", body: "One contact from shortlist to dispatch", icon: Handshake },
  {
    title: "Delivery coordination",
    body: "Discuss single or multi-location delivery",
    icon: Truck,
  },
];

export const WHY_US: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Range in one place",
    body: "Gift sets, bags, drinkware, folders and onboarding kits in one place - fewer vendors to manage.",
    icon: Layers,
  },
  {
    title: "Branding checked per product",
    body: "We confirm which customization method suits each material before you commit.",
    icon: PenTool,
  },
  {
    title: "Guided enquiries",
    body: "Share as much or as little as you know. We help narrow the options.",
    icon: MessageCircle,
  },
  {
    title: "Considered presentation",
    body: "Sets arrive boxed and arranged, so the gift feels finished when it is opened.",
    icon: Sparkles,
  },
];

export interface Faq {
  q: string;
  a: string;
}

const CORE_FAQS: Faq[] = [
  {
    q: "Can you add our company logo to the products?",
    a: "Yes. Most products can be branded. The method depends on the material - for example laser engraving on metal, screen or UV printing on bottles and bags, and debossing on leather finishes. We confirm what works for each item when you enquire.",
  },
  {
    q: "Is there a minimum order quantity?",
    a: "Minimum quantities vary by product and branding method. Share the items you are interested in and an approximate quantity, and we will tell you what is possible.",
  },
  {
    q: "How long does a corporate order take?",
    a: "Timelines depend on the products, quantity and customization involved. Let us know your required date when you enquire so we can confirm whether it can be met.",
  },
  {
    q: "How do I share our logo or artwork?",
    a: "After we discuss your requirement, you can send your logo over email or WhatsApp. Vector files (AI, EPS, SVG or PDF) give the best results.",
  },
  {
    q: "Can you deliver to multiple office locations?",
    a: "Tell us the delivery locations in your enquiry and we will discuss what can be arranged for your order.",
  },
  {
    q: "Can I see a sample before placing a bulk order?",
    a: "Ask us about samples for the products you are considering, and we will let you know what is available.",
  },
  {
    q: "Do you show prices on the website?",
    a: "Pricing depends on quantity, the set configuration and branding, so we share quotes on enquiry rather than listing fixed prices.",
  },
  {
    q: "How do I place an enquiry?",
    a: "Use the Enquire button on any page, message us on WhatsApp, or email us. Adding products to favourites first makes it easier to share your shortlist.",
  },
];

export const FAQ_GROUPS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: Faq[];
}[] = [
  {
    id: "selection",
    title: "Choosing your gifts",
    description: "Find the right starting point for your brief.",
    icon: Gift,
    items: [
      {
        q: "What kinds of corporate gifts can I explore?",
        a: "The catalogue includes boxed gift sets, employee welcome kits, bags, drinkware and conference folders. Browse by category or tell us the occasion so we can help shortlist options.",
      },
      {
        q: "Can you help put together employee welcome kits?",
        a: "Yes. We help combine bags, bottles, notebooks, pens and desk items around your onboarding brief, then discuss branding and packing.",
      },
      {
        q: "Can you help with conference or event gifts?",
        a: "We can help shortlist folders, carry bags, drinkware and compact gift sets for delegates, speakers or event teams. Share the occasion and approximate quantity.",
      },
      CORE_FAQS[5],
    ].filter((f): f is Faq => !!f),
  },
  {
    id: "branding",
    title: "Logo & customisation",
    description: "Artwork, materials and branding methods.",
    icon: PenTool,
    items: [
      CORE_FAQS[0],
      CORE_FAQS[3],
      {
        q: "Will the same branding method work on every item?",
        a: "Not necessarily. Engraving, printing, debossing and embossing suit different materials. We confirm the feasible method for each product before you order.",
      },
      {
        q: "When do we approve the artwork?",
        a: "After the selection and branding options are discussed, you review the final artwork and approve it before dispatch is coordinated.",
      },
    ].filter((f): f is Faq => !!f),
  },
  {
    id: "quotes",
    title: "Quantities & quotes",
    description: "What we need to prepare your options.",
    icon: ClipboardList,
    items: [
      CORE_FAQS[1],
      CORE_FAQS[6],
      {
        q: "What should I include when asking for a quote?",
        a: "Include the products or categories you like, approximate quantity, required date, logo branding and delivery location. A rough brief is enough to start the discussion.",
      },
      {
        q: "Can I enquire before deciding on a product?",
        a: "Yes. Share the recipient, occasion and what you know so far. We can help narrow the selection rather than asking you to settle on a product first.",
      },
    ].filter((f): f is Faq => !!f),
  },
  {
    id: "delivery",
    title: "Timing & delivery",
    description: "Plan dates and destinations with us.",
    icon: Truck,
    items: [
      CORE_FAQS[2],
      CORE_FAQS[4],
      {
        q: "What if we have a fixed event date?",
        a: "Include that date in your enquiry along with the quantity and customisation you need. We will confirm what can be arranged; timings are not guaranteed by the catalogue.",
      },
    ].filter((f): f is Faq => !!f),
  },
  {
    id: "enquiries",
    title: "Enquiries & shortlists",
    description: "Save, share and discuss your selection.",
    icon: MessageCircle,
    items: [
      CORE_FAQS[7],
      {
        q: "How can I share several products in one enquiry?",
        a: "Save the products using the heart icon, then open your favourites and choose to enquire about the shortlist.",
      },
      {
        q: "Can I view alternate images of a product?",
        a: "Products with more than one image have dots beneath the image. Select a dot or swipe on a touch screen; the quick view also shows the available gallery.",
      },
    ].filter((f): f is Faq => !!f),
  },
];

export const FAQS: Faq[] = FAQ_GROUPS.flatMap((group) => group.items);

export interface Testimonial {
  name: string;
  role?: string;
  quote: string;
  rating?: number;
}

/**
 * Placeholder reviews approved by the owner until real Google reviews are supplied.
 * Replace with verified review text when available.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Rohit Malhotra",
    role: "HR Manager, IT services firm",
    quote:
      "We ordered welcome kits for a batch of new joiners. The team helped us pick a bag, bottle and notebook combination that fit our budget, and the logo work came out clean. Delivery was coordinated without us chasing anyone.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Admin Lead, consulting company",
    quote:
      "Needed Diwali gift sets for about 150 employees. Urban Craft shortlisted a few options on WhatsApp, we picked a 4-in-1 set, and the boxes arrived neatly packed and arranged. Much easier than dealing with three different vendors.",
    rating: 5,
  },
  {
    name: "Amit Khanna",
    role: "Founder, real estate brokerage",
    quote:
      "Ordered branded jute bags and folders for a client event. They told us upfront which printing method would last on jute instead of just taking the order. That honesty is why we went back for a second order.",
    rating: 5,
  },
  {
    name: "Sneha Kulkarni",
    role: "Marketing Executive, fintech startup",
    quote:
      "The 5-in-1 gift sets looked exactly like the photos on the site, which is rarer than it should be. Engraving on the bottles was sharp. Good communication throughout over WhatsApp.",
    rating: 5,
  },
  {
    name: "Vikram Sethi",
    role: "Operations Head, logistics firm",
    quote:
      "We had a tight timeline for conference giveaways. They were clear about what could and couldn't be done in time, suggested alternatives, and delivered what they promised.",
    rating: 4,
  },
  {
    name: "Ananya Gupta",
    role: "People Ops, edtech company",
    quote:
      "The enquiry form made it easy to explain what we needed, and the follow-up was quick. The welcome kits felt considered - not random items thrown in a box. New hires noticed.",
    rating: 5,
  },
];
