import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err?: string) => void;
  className?: string;
}

export function TurnstileWidget({
  siteKey = import.meta.env["VITE_TURNSTILE_SITE_KEY"] || "0x4AAAAAAF4N2BizrqzpRRny",
  onVerify,
  onExpire,
  onError,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // If no sitekey provided or localhost dev bypass active
    if (!siteKey) {
      onVerify("cf_dev_dummy_token");
      setVerified(true);
      return;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore removal error on re-render
        }
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token: string) => {
            if (isMounted) {
              setVerified(true);
              onVerify(token);
            }
          },
          "expired-callback": () => {
            if (isMounted) {
              setVerified(false);
              onExpire?.();
            }
          },
          "error-callback": (err?: string) => {
            if (isMounted) {
              // In dev mode or network error, provide fallback test token
              if (import.meta.env.DEV) {
                onVerify("1x00000000000000000000AA");
                setVerified(true);
              } else {
                onError?.(err);
              }
            }
          },
        });
        widgetIdRef.current = id;
        setLoaded(true);
      } catch (err) {
        console.warn("Turnstile render error:", err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const scriptId = "cf-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        // Fallback for strict offline development
        if (import.meta.env.DEV && !verified) {
          onVerify("1x00000000000000000000AA");
          setVerified(true);
        }
      }, 4000);

      return () => {
        isMounted = false;
        clearInterval(checkInterval);
        clearTimeout(timeout);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore unmount cleanup error
          }
        }
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore unmount cleanup error
        }
      }
    };
  }, [siteKey, onVerify, onExpire, onError]);

  return (
    <div className={`turnstile-container py-1 ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-start" />
      {verified && (
        <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-emerald-700">
          <ShieldCheck className="size-3.5" />
          <span>Security verification completed</span>
        </p>
      )}
    </div>
  );
}
