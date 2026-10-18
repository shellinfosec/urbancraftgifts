import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ContactCTA, PageHeader } from "@/components/common/PageParts";
import { Reveal } from "@/components/common/Reveal";
import { STAGE_TONE } from "@/components/product/ProductImageStage";
import { CATEGORY_GROUPS, categoriesInGroup } from "@/config/categories";
import { categoryCount, pickFrom } from "@/lib/catalog";
import { BrandImage } from "@/components/common/BrandImage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/categories/")({
  head: () =>
    pageHead({
      title: "All Gift Categories",
      description:
        "Browse corporate gifting categories - gift sets, laptop bags, backpacks, jute and felt bags, drinkware, folders and welcome kits.",
      path: "/categories",
    }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Categories" }]}
        eyebrow="The collection"
        title="Shop by category"
        intro="Grouped by type so it's easy to find a starting point. Every category can be branded and ordered in bulk."
      />
      <div className="container-site space-y-14 pb-6">
        {CATEGORY_GROUPS.map((g) => (
          <section key={g.id} aria-labelledby={`g-${g.id}`}>
            <div className="mb-5 flex items-end justify-between border-b border-border pb-3">
              <div>
                <h2 id={`g-${g.id}`} className="font-display text-2xl text-olive">
                  {g.label}
                </h2>
                <p className="text-sm text-muted-foreground">{g.blurb}</p>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categoriesInGroup(g.id).map((c, i) => {
                const img = pickFrom(c.slug, 1)[0];
                return (
                  <Reveal as="li" key={c.slug} delay={i * 0.05}>
                    <Link
                      to="/categories/$slug"
                      params={{ slug: c.slug }}
                      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-border transition hover:shadow-lift ${STAGE_TONE[c.tone]}`}
                    >
                      <span className="relative block aspect-square">
                        {img && (
                          <BrandImage
                            src={img.images[0]}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full"
                            imgClassName="object-contain p-[12%] transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        )}
                      </span>
                      <span className="flex items-center justify-between gap-2 bg-card px-4 py-3.5">
                        <span>
                          <span className="block text-sm font-semibold text-olive">{c.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {categoryCount(c.slug)} products
                          </span>
                        </span>
                        <ArrowRight className="size-4 text-olive transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <ContactCTA />
    </>
  );
}
