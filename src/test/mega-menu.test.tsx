import type { ComponentProps } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { OverlayProvider } from "@/components/providers/OverlayProvider";

// Mock tanstack router Link
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    onClick,
    ...props
  }: ComponentProps<"a"> & { to?: string; params?: Record<string, string> }) => (
    <a href={to} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

function renderMegaMenu(open = true) {
  return render(
    <OverlayProvider>
      <MegaMenu open={open} onNavigate={vi.fn()} />
    </OverlayProvider>,
  );
}

describe("MegaMenu slider and 1-row layout consistency", () => {
  it("renders gift-sets with previous button disabled and next button enabled initially", () => {
    renderMegaMenu(true);

    // Initial group is gift-sets (7 items, 4 visible at a time)
    expect(screen.getByText("Showing 1–4 of 7")).toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: "Previous category" });
    const nextBtn = screen.getByRole("button", { name: "Next category" });

    // Both arrows are present
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    // Incompatible arrow is unclickable and greyed out
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  it("slides one item at a time and dynamically updates active/inactive states", () => {
    renderMegaMenu(true);

    const prevBtn = screen.getByRole("button", { name: "Previous category" });
    const nextBtn = screen.getByRole("button", { name: "Next category" });

    // Step 1: Click next -> Showing 2–5 of 7
    fireEvent.click(nextBtn);
    expect(screen.getByText("Showing 2–5 of 7")).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Step 2: Click next -> Showing 3–6 of 7
    fireEvent.click(nextBtn);
    expect(screen.getByText("Showing 3–6 of 7")).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Step 3: Click next -> Showing 4–7 of 7 (end of slider)
    fireEvent.click(nextBtn);
    expect(screen.getByText("Showing 4–7 of 7")).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled(); // Reached end, next becomes disabled

    // Step 4: Click prev -> Showing 3–6 of 7
    fireEvent.click(prevBtn);
    expect(screen.getByText("Showing 3–6 of 7")).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  it("resets slide index to 0 when switching category group tabs", () => {
    renderMegaMenu(true);

    const nextBtn = screen.getByRole("button", { name: "Next category" });
    fireEvent.click(nextBtn);
    expect(screen.getByText("Showing 2–5 of 7")).toBeInTheDocument();

    // Switch to Bags tab (4 items, no controls needed)
    const bagsTab = screen.getByRole("tab", { name: /Bags for Work & Travel/i });
    fireEvent.click(bagsTab);
    expect(screen.queryByText(/Showing/)).toBeNull();

    // Switch back to Gift Sets -> reset to 1–4 of 7
    const giftSetsTab = screen.getByRole("tab", { name: /Gift Sets/i });
    fireEvent.click(giftSetsTab);
    expect(screen.getByText("Showing 1–4 of 7")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous category" })).toBeDisabled();
  });
});
