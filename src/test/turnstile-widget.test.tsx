import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";

describe("TurnstileWidget", () => {
  let originalTurnstile: unknown;

  beforeEach(() => {
    originalTurnstile = window.turnstile;
    document.querySelectorAll("#cf-turnstile-script").forEach((el) => el.remove());
  });

  afterEach(() => {
    window.turnstile = originalTurnstile as typeof window.turnstile;
    document.querySelectorAll("#cf-turnstile-script").forEach((el) => el.remove());
  });

  it("renders container without calling turnstile.ready()", async () => {
    const readyMock = vi.fn();
    const renderMock = vi.fn().mockReturnValue("widget-123");
    const removeMock = vi.fn();

    window.turnstile = {
      ready: readyMock,
      render: renderMock,
      reset: vi.fn(),
      remove: removeMock,
    };

    const onVerify = vi.fn();

    const { unmount } = render(<TurnstileWidget onVerify={onVerify} />);

    // Wait for effect execution
    await act(async () => {
      await Promise.resolve();
    });

    // CRITICAL: turnstile.ready() must NOT be called because it throws TurnstileError with async/defer
    expect(readyMock).not.toHaveBeenCalled();

    // turnstile.render() must be called directly
    expect(renderMock).toHaveBeenCalled();

    // On unmount, remove should be called cleanly
    unmount();
    expect(removeMock).toHaveBeenCalledWith("widget-123");
  });

  it("handles repeated navigation / mount-unmount cycles without throwing", async () => {
    const renderMock = vi.fn().mockImplementation((container, params) => {
      // Simulate verification callback
      params.callback("dummy-token");
      return "widget-abc";
    });
    const removeMock = vi.fn();

    window.turnstile = {
      render: renderMock,
      reset: vi.fn(),
      remove: removeMock,
    };

    const onVerify1 = vi.fn();
    const { unmount: unmount1 } = render(<TurnstileWidget onVerify={onVerify1} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(onVerify1).toHaveBeenCalledWith("dummy-token");
    expect(screen.getByText("Security verification completed")).toBeInTheDocument();

    unmount1();
    expect(removeMock).toHaveBeenCalledWith("widget-abc");

    // Remount (simulating navigating back to a page with Turnstile)
    const onVerify2 = vi.fn();
    const { unmount: unmount2 } = render(<TurnstileWidget onVerify={onVerify2} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(onVerify2).toHaveBeenCalledWith("dummy-token");
    unmount2();
  });
});

