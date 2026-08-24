// Google Analytics wrapper for the predictor app.
//
// The gtag.js snippet lives in index.html and is configured with
// `send_page_view: false`, so this module owns every page view. The predictor
// has no router — screens are component state — so screen changes are reported
// as page views against synthetic paths (`/predictor/pool/standings`). Those
// paths are what shows up in GA's "Pages and screens" report.
//
// Nothing is sent outside production builds; dev logs to the console instead.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

const send = (eventName: string, params: AnalyticsParams) => {
  if (!import.meta.env.PROD) {
    console.debug(`[analytics] ${eventName}`, params);
    return;
  }
  // Missing when an ad blocker drops gtag.js — tracking is best-effort.
  window.gtag?.("event", eventName, params);
};

/**
 * Reports a screen as a page view. `path` is a synthetic path under
 * /predictor/; GA4 builds its page dimensions from `page_location`, so it is
 * sent as a full URL.
 */
export const trackScreenView = (
  path: string,
  title: string,
  params: AnalyticsParams = {},
) =>
  send("page_view", {
    page_location: `${window.location.origin}${path}`,
    page_title: title,
    ...params,
  });

/** Reports a custom event, e.g. `trackEvent("picks_submitted", { poolId })`. */
export const trackEvent = (eventName: string, params: AnalyticsParams = {}) =>
  send(eventName, params);
