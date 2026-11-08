import React, { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      ready?: (fn: () => void) => void;
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          retry?: "auto" | "never";
          "retry-interval"?: number;
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
    __cfTurnstileLoaded?: () => void;
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  action?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err?: string) => void;
  className?: string;
}

const PRODUCTION_SITE_KEY = "0x4AAAAAAF4N2BizrqzpRRny";
const CLOUDFLARE_ALWAYS_PASS_TEST_KEY = "1x00000000000000000000AA";

// Module-level singleton loader for the Cloudflare Turnstile script
let scriptLoadingPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  // If turnstile is already present and its render function is ready, resolve immediately
  if (window.turnstile && typeof window.turnstile.render === "function") {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve) => {
    const callbackName = "__cfTurnstileLoaded";

    const notifyReady = () => {
      // Defensive guard: patch window.turnstile.ready if defined so it never throws TurnstileError
      if (window.turnstile && typeof window.turnstile.ready === "function") {
        try {
          const originalReady = window.turnstile.ready;
          window.turnstile.ready = function (fn: () => void) {
            try {
              return originalReady.call(window.turnstile, fn);
            } catch {
              // Cloudflare throws if script has async/defer; execute fn directly instead
              try {
                fn();
              } catch (inner) {
                console.warn("Turnstile callback error:", inner);
              }
            }
          };
        } catch {
          // ignore patch errors
        }
      }
      resolve();
    };

    window[callbackName] = () => {
      notifyReady();
    };

    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = (err) => {
        console.warn("Cloudflare Turnstile script failed to load:", err);
        notifyReady();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", notifyReady, { once: true });
      script.addEventListener("error", notifyReady, { once: true });
    }

    // Safety polling in case the script was already cached or the event fired early
    const checkInterval = setInterval(() => {
      if (window.turnstile && typeof window.turnstile.render === "function") {
        clearInterval(checkInterval);
        notifyReady();
      }
    }, 100);

    // Timeout safety: unblock after 6s so form can fallback gracefully
    setTimeout(() => {
      clearInterval(checkInterval);
      notifyReady();
    }, 6000);
  });

  return scriptLoadingPromise;
}

export const TurnstileWidget = React.memo(function TurnstileWidget({
  siteKey,
  action = "inquiry",
  onVerify,
  onExpire,
  onError,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stable references for callbacks to avoid re-triggering effects
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Determine site key: use test key on localhost/dev to prevent domain-mismatch loops
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1");

  const effectiveSiteKey = isLocalhost
    ? siteKey === CLOUDFLARE_ALWAYS_PASS_TEST_KEY
      ? siteKey
      : CLOUDFLARE_ALWAYS_PASS_TEST_KEY
    : siteKey || import.meta.env["VITE_TURNSTILE_SITE_KEY"] || PRODUCTION_SITE_KEY;

  useEffect(() => {
    let isMounted = true;

    // Local dummy bypass if no key is configured
    if (!effectiveSiteKey) {
      setVerified(true);
      onVerifyRef.current("cf_dev_dummy_token");
      return;
    }

    const initWidget = () => {
      if (!isMounted || !containerRef.current || renderedRef.current) return;
      if (!window.turnstile || typeof window.turnstile.render !== "function") return;

      try {
        // Clear container before rendering to prevent duplicate widgets
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        const id = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSiteKey,
          action,
          theme: "light",
          retry: "never", // Prevents infinite spinning loops on challenge failures
          callback: (token: string) => {
            if (isMounted) {
              setVerified(true);
              setErrorMessage(null);
              onVerifyRef.current(token);
            }
          },
          "expired-callback": () => {
            if (isMounted) {
              setVerified(false);
              onExpireRef.current?.();
            }
          },
          "error-callback": (errorCode?: string) => {
            if (isMounted) {
              console.warn("Cloudflare Turnstile challenge error:", errorCode);
              // In dev or localhost, auto-pass with test token
              if (import.meta.env.DEV || isLocalhost) {
                setVerified(true);
                setErrorMessage(null);
                onVerifyRef.current(CLOUDFLARE_ALWAYS_PASS_TEST_KEY);
              } else {
                setErrorMessage(
                  "Security verification check encountered an issue. You can still reach us directly on WhatsApp or Email.",
                );
                onErrorRef.current?.(errorCode);
              }
            }
          },
        });

        widgetIdRef.current = id;
        renderedRef.current = true;
      } catch (err) {
        console.warn("Turnstile initialization exception:", err);
      }
    };

    // Load the script and render directly once ready
    loadTurnstileScript()
      .then(() => {
        if (isMounted) {
          initWidget();
        }
      })
      .catch((err) => {
        console.warn("Turnstile script load error:", err);
      });

    // Local dev safety fallback timeout
    const fallbackTimer = setTimeout(() => {
      if ((import.meta.env.DEV || isLocalhost) && !renderedRef.current && isMounted) {
        setVerified(true);
        onVerifyRef.current(CLOUDFLARE_ALWAYS_PASS_TEST_KEY);
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
      renderedRef.current = false;
    };
  }, [effectiveSiteKey, action, isLocalhost]);

  return (
    <div className={`turnstile-container py-1 ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-start" />
      {errorMessage && (
        <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-amber-700">
          <AlertCircle className="size-3.5" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
});
