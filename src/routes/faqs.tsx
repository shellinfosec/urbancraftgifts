import { createFileRoute } from "@tanstack/react-router";
import { ContactCTA, FaqList, PageHeader } from "@/components/common/PageParts";
import { FAQ_GROUPS } from "@/config/content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faqs")({
  head: () =>
    pageHead({
      title: "Frequently Asked Questions",
      description:
        "Answers on logo customization, quantities, timelines, artwork, delivery and samples for corporate gift orders.",
      path: "/faqs",
    }),
  component: () => (
    <>
      <PageHeader
        crumbs={[{ label: "FAQs" }]}
        eyebrow="FAQs"
        title="Frequently asked questions"
        intro="From choosing a gift to artwork and delivery - find answers by topic."
      />
      <div className="container-site grid items-start gap-8 pb-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <nav
          aria-label="FAQ topics"
          className="sticky top-[calc(var(--header-h)+1rem)] z-10 flex gap-2 overflow-x-auto bg-background py-2 lg:flex-col lg:gap-1"
        >
          {FAQ_GROUPS.map(({ id, title, icon: Icon }) => (
            <a
              key={id}
              href={`#faq-${id}`}
              className="flex min-h-12 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-olive transition-colors hover:bg-header-category"
            >
              <Icon className="size-4 shrink-0 text-brown" />
              {title}
            </a>
          ))}
        </nav>
        <div className="min-w-0 space-y-12">
          {FAQ_GROUPS.map(({ id, title, description, icon: Icon, items }) => (
            <section
              key={id}
              id={`faq-${id}`}
              className="scroll-mt-[calc(var(--header-h)+5rem)]"
              aria-labelledby={`title-${id}`}
            >
              <div className="mb-5 flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-header-category text-brown">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 id={`title-${id}`} className="text-xl text-olive">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-slate">{description}</p>
                </div>
              </div>
              <FaqList items={items} />
            </section>
          ))}
        </div>
      </div>
      <ContactCTA title="Didn't find your answer?" />
    </>
  ),
});
