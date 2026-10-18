/**
 * Client-side error reporting utility.
 * Logs unhandled errors from route boundaries and provides a hook for future monitoring services.
 */

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message = describeThrown(error);
  console.error("[App Error]", message, {
    route: window.location.pathname,
    ...context,
    error,
  });
}

const MAX_SERIALIZED_LENGTH = 2000;

function describeThrown(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  const { message } = (error ?? {}) as { message?: unknown };
  if (typeof message === "string" && message.length > 0) return message;
  try {
    return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
  } catch {
    return String(error);
  }
}
