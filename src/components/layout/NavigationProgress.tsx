import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/** Keep the current page untouched; only slow navigation gets an unobtrusive indicator. */
export function NavigationProgress() {
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 220);
    return () => window.clearTimeout(timer);
  }, [pending]);
  return pending && visible ? (
    <div
      role="status"
      aria-label="Loading page"
      className="navigation-progress pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-gold/30"
    >
      <span className="block h-full w-1/3 bg-olive" />
    </div>
  ) : null;
}
