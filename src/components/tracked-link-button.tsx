"use client";

import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  trackButtonClick,
  trackPhoneClick,
  trackWhatsAppClick,
} from "@/lib/analytics";

type TrackedLinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  trackingName: string;
  trackingLocation: string;
  eventType?: "button_click" | "phone_click" | "whatsapp_click";
  target?: string;
  rel?: string;
};

type InternalHref = ComponentProps<typeof Link>["href"];

export function TrackedLinkButton({
  href,
  children,
  className,
  variant = "default",
  trackingName,
  trackingLocation,
  eventType = "button_click",
  target,
  rel,
}: TrackedLinkButtonProps) {
  const handleTrack = () => {
    if (eventType === "phone_click") {
      trackPhoneClick(trackingLocation);
      return;
    }

    if (eventType === "whatsapp_click") {
      trackWhatsAppClick(trackingLocation);
      return;
    }

    trackButtonClick(trackingName, trackingLocation);
  };

  const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <Button asChild variant={variant} className={className}>
        <a href={href} target={target} rel={rel} onClick={handleTrack}>
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} className={className}>
      <Link href={href as InternalHref} onClick={handleTrack}>
        {children}
      </Link>
    </Button>
  );
}
