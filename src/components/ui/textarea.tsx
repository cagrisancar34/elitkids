import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "surface-muted min-h-32 w-full rounded-[1.15rem] border border-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary/20 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
