import aboutShowcase from "@/assets/about-showcase.png";
import contactShowcase from "@/assets/contact-showcase.png";
import servicesShowcase from "@/assets/services-showcase.png";

export const PAGE_INTROS = {
  about: {
    label: "About us",
    title: "Urban Craft & Co.",
    body: "Corporate gifts chosen for the people receiving them. From the first shortlist to the final branding approval, we help you put a considered gift together.",
    category: "5-in-1-gift-sets",
    image: aboutShowcase,
    imageAlt: "Olive gift box with bottle, notebook and pen alongside a laptop sleeve",
    action: "Explore the collection",
  },
  contact: {
    label: "Contact us",
    title: "Let’s talk gifting.",
    body: "A product you like, an occasion, or a rough brief - share your starting point. We’ll help with the selection, branding and next steps.",
    category: "4-in-1-gift-sets",
    image: contactShowcase,
    imageAlt: "Presentation gift box with notebook, bottle, pen and card holder",
    action: "Write to us",
  },
  services: {
    label: "Our services",
    title: "Corporate gifting, with a personal touch.",
    body: "Welcome kits, client gifts and event essentials. We coordinate the selection, logo branding and packing around your brief.",
    category: "3-in-1-gift-sets",
    image: servicesShowcase,
    imageAlt: "Backpack, laptop sleeve, bottle and boxed corporate gift collection",
    action: "Discuss your brief",
  },
} as const;
