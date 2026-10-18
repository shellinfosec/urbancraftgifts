import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { whatsappUrl } from "@/lib/whatsapp";

/** Desktop-only WhatsApp action (mobile uses the bottom nav) + back to top. */
export function FloatingActions() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="no-print fixed bottom-6 right-6 z-30 hidden flex-col items-end gap-3 md:flex">
      <AnimatePresence>
        {show && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-olive shadow-soft hover:bg-muted cursor-pointer"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
      <a
        href={whatsappUrl({ kind: "general" })}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="inline-flex h-12 items-center gap-2 rounded-full border border-[#FAF8F5]/85 bg-olive pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-olive-deep transition-all"
      >
        <WhatsAppIcon className="size-5 text-whatsapp" /> Chat with us
      </a>
    </div>
  );
}

const CONSENT_KEY = "uc:cookie-consent:v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(CONSENT_KEY));
    } catch {
      setShow(false);
    }
  }, []);
  if (!show) return null;
  const decide = (v: string) => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="no-print fixed inset-x-3 bottom-[76px] z-40 rounded-2xl border border-border bg-card p-4 shadow-lift md:bottom-6 md:left-6 md:right-auto md:max-w-sm"
    >
      <p className="text-sm text-slate">
        We use essential browser storage to remember your favourites and preferences. See our{" "}
        <a href="/cookie-policy" className="font-medium text-olive underline">
          cookie policy
        </a>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="h-10 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          OK
        </button>
        <button
          type="button"
          onClick={() => decide("essential")}
          className="h-10 flex-1 rounded-xl border border-border text-sm font-medium"
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
