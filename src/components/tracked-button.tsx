"use client";

import { type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { trackButtonClick } from "@/lib/analytics";

type TrackedButtonProps = ComponentProps<typeof Button> & {
  trackingName: string;
  trackingLocation: string;
};

export function TrackedButton({
  trackingName,
  trackingLocation,
  onClick,
  ...props
}: TrackedButtonProps) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        trackButtonClick(trackingName, trackingLocation);
        onClick?.(event);
      }}
    />
  );
}
