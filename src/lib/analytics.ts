"use client";

import { GA_MEASUREMENT_ID } from "@/lib/analytics-config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | null | undefined>;

function getCurrentPagePath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}`;
}

export function pageview(url: string) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, {
    ...params,
    page_path: params.page_path ?? getCurrentPagePath(),
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackButtonClick(buttonName: string, buttonLocation: string) {
  trackEvent("button_click", {
    button_name: buttonName,
    button_location: buttonLocation,
  });
}

export function trackWhatsAppClick(buttonLocation: string) {
  trackEvent("whatsapp_click", {
    button_location: buttonLocation,
  });
}

export function trackPhoneClick(buttonLocation: string) {
  trackEvent("phone_click", {
    button_location: buttonLocation,
  });
}

export function trackFormSubmit(formName: string, params: EventParams = {}) {
  trackEvent("form_submit", {
    form_name: formName,
    ...params,
  });
}
