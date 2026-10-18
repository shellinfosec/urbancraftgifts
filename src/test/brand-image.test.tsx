import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandImage } from "@/components/common/BrandImage";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Contextual image loading", () => {
  it("delays its indicator and removes it as soon as the image loads", () => {
    vi.useFakeTimers();
    render(<BrandImage src="/gift.png" alt="Gift" />);
    expect(screen.queryByRole("status")).toBeNull();
    act(() => vi.advanceTimersByTime(180));
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.load(screen.getByAltText("Gift"));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("terminates loading on failure and resets for a different image", () => {
    vi.useFakeTimers();
    const { rerender } = render(<BrandImage src="/missing.png" alt="Gift" />);
    fireEvent.error(screen.getByAltText("Gift"));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("img", { name: "Gift - image unavailable" })).toBeInTheDocument();
    rerender(<BrandImage src="/next.png" alt="Next gift" />);
    act(() => vi.advanceTimersByTime(180));
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.load(screen.getByAltText("Next gift"));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
