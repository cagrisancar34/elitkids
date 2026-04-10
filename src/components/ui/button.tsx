import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#0f63ea,#004dc2)] text-primary-foreground shadow-[0_18px_32px_rgba(12,87,220,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_36px_rgba(12,87,220,0.3)]",
        secondary: "border border-white/60 bg-white/72 text-secondary-foreground shadow-[0_12px_22px_rgba(18,43,84,0.04)] hover:bg-white/92",
        ghost: "bg-transparent text-foreground hover:bg-white/64",
        outline: "border border-[#dbe5f2] bg-white/82 text-card-foreground shadow-[0_10px_24px_rgba(18,43,84,0.04)] hover:bg-white",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-[0.95rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
