import * as React from "react";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "surface-muted flex h-12 w-full rounded-[1.15rem] border border-transparent px-4 text-sm outline-none focus-visible:border-primary/20 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";

export { Select };
