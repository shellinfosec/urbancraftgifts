import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductCardGallery } from "@/components/product/ProductCardGallery";

afterEach(cleanup);

describe("Product image pagination", () => {
  it("selects the alternate image on desktop without opening quick view", () => {
    const open = vi.fn();
    render(
      <ProductCardGallery
        images={["/front.png", "/back.png"]}
        name="Gift"
        alt="Gift front"
        onOpen={open}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show image 2 of 2: Gift" }));
    expect(screen.getByAltText("Gift front - view 2")).toHaveAttribute("src", "/back.png");
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "View details: Gift" }));
    expect(open).toHaveBeenCalledOnce();
  });
});
