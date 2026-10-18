import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ContactCTA } from "@/components/common/PageParts";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PRODUCTS } from "@/lib/catalog";
import { validateCatalogSearch } from "@/lib/catalog-search";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products")({
  validateSearch: validateCatalogSearch,
  head: () =>
    pageHead({
      title: "All Corporate Gifts & Products",
      description:
        "Browse corporate gift sets, laptop bags, backpacks, drinkware, welcome kits and more, with logo branding and bulk-order assistance.",
      path: "/products",
    }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "All Products" }]}
        eyebrow="Full catalogue"
        title="All products"
        intro="Gift sets, bags, drinkware and welcome kits, with logo branding and bulk-order assistance."
      />
      <CatalogView base={PRODUCTS} search={search} showCategoryFacet />
      <ContactCTA />
    </>
  );
}
