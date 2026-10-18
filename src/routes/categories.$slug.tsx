import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CategoryBanner, ContactCTA, PageHeader } from "@/components/common/PageParts";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CATEGORY_MAP, getCategory, requireCategory } from "@/config/categories";
import { pickFrom, productsInCategory } from "@/lib/catalog";
import { validateCatalogSearch } from "@/lib/catalog-search";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { STAGE_TONE } from "@/components/product/ProductImageStage";
import { BrandImage } from "@/components/common/BrandImage";

export const Route = createFileRoute("/categories/$slug")({
  validateSearch: validateCatalogSearch,
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { slug: category.slug };
  },
  head: ({ loaderData }) => {
    const c = loaderData ? CATEGORY_MAP[loaderData.slug] : undefined;
    if (!c)
      return {
        meta: [
          { title: "Category unavailable | Urban Craft & Co." },
          { name: "robots", content: "noindex" },
        ],
      };
    const path = `/categories/${c.slug}`;
    const h = pageHead({
      title: `${c.name} for Corporate Gifting`,
      description: c.seoDescription,
      path,
      image: c.banner,
    });
    return {
      ...h,
      scripts: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "All Products", path: "/products" },
          { name: c.name, path },
        ]),
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useLoaderData();
  const search = Route.useSearch();
  const c = requireCategory(slug);
  const products = productsInCategory(slug);
  return (
    <>
      <PageHeader
        crumbs={[{ label: "All Products", to: "/products" }, { label: c.name }]}
        title={c.name}
        intro={c.intro}
      />
      <CategoryBanner src={c.banner} alt={`${c.name} - Urban Craft & Co.`} />
      <div className="h-8 md:h-12" />
      <CatalogView key={slug} base={products} search={search} />

      <section className="container-site pt-10" aria-labelledby="related">
        <h2 id="related" className="font-display text-xl text-olive">
          Related categories
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {c.related.map((s) => {
            const r = CATEGORY_MAP[s];
            const img = pickFrom(s, 1)[0];
            if (!r) return null;
            return (
              <li key={s}>
                <Link
                  to="/categories/$slug"
                  params={{ slug: s }}
                  className={`group flex items-center gap-3 rounded-2xl border border-border p-3 transition hover:shadow-soft ${STAGE_TONE[r.tone]}`}
                >
                  {img && (
                    <BrandImage
                      src={img.images[0]}
                      alt=""
                      className="h-14 w-14 shrink-0 object-contain"
                      loading="lazy"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-semibold text-olive">
                      {r.shortName}
                      <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <ContactCTA
        title={`Need help choosing ${c.name.toLowerCase()}?`}
        prefill={{ categories: [slug] }}
        whatsapp={{ kind: "category", slug }}
      />
    </>
  );
}
