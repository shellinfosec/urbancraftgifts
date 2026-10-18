import { createFileRoute } from "@tanstack/react-router";
import { HomeHero, TrustStrip } from "@/components/home/HomeHero";
import {
  BagsMosaic,
  CuratedRail,
  EcoSection,
  GiftSetShowcase,
  ProcessStory,
  ShopByCategory,
  WelcomeKitsFeature,
} from "@/components/home/HomeMerch";
import {
  FaqPreview,
  ServicesSection,
  TestimonialsSection,
  WhyUsSection,
} from "@/components/home/HomeTrust";
import { ContactCTA } from "@/components/common/PageParts";
import { InlineInquiry } from "@/components/home/InlineInquiry";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Urban Craft & Co. - Corporate Gift Sets, Welcome Kits & Branded Bags",
      description:
        "Corporate gift sets, employee welcome kits, laptop bags and drinkware from New Delhi, with logo customization and help with bulk orders.",
      path: "/",
    }),
  component: Index,
});

function Index() {
  return (
    <>
      <HomeHero />
      <TrustStrip />
      <ShopByCategory />
      <GiftSetShowcase />
      <ProcessStory />
      <CuratedRail />
      <WelcomeKitsFeature />
      <BagsMosaic />
      <EcoSection />
      <ServicesSection />
      <TestimonialsSection />
      <WhyUsSection />
      <FaqPreview />
      <InlineInquiry />
      <ContactCTA />
    </>
  );
}
