import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "surface-muted flex h-12 w-full rounded-[1.15rem] border border-transparent px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary/20 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
