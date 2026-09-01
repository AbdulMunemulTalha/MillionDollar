"use client";

import { useEffect } from "react";
import { initDataFast } from "datafast";

/**
 * Client-side DataFast analytics via the official SDK. Auto-captures pageviews
 * (including App Router client navigations). Renders nothing. No-ops when the
 * public website id is unset, so local/preview builds stay quiet.
 */
export function DataFast({
  websiteId,
  domain,
}: {
  websiteId?: string;
  domain?: string;
}) {
  useEffect(() => {
    if (!websiteId) return;
    let disposed = false;
    let client: { reset?: () => void } | undefined;

    initDataFast({
      websiteId,
      domain,
      autoCapturePageviews: true,
      cookieless: true,
    })
      .then((c) => {
        if (disposed) c.reset?.();
        else client = c;
      })
      .catch(() => {
        // Analytics must never break the app; swallow init errors.
      });

    return () => {
      disposed = true;
      client?.reset?.();
    };
  }, [websiteId, domain]);

  return null;
}
