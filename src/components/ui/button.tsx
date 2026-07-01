import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 animate-press",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-foreground/20 bg-transparent hover:bg-foreground/5 hover:border-foreground/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base shadow-lg hover:shadow-xl",
        bulk: "bg-accent text-accent-foreground hover:bg-accent/90 font-bold border-2 border-accent",
        cta: "bg-foreground text-background hover:bg-foreground/90 font-bold shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-8 px-4 py-1",
        xs: "h-7 rounded-md px-2 text-xs ",
        sm: "h-9 rounded-md px-4 text-xs",
        md: "h-12 px-8 text-sm",
        lg: "h-14 rounded-lg px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  showArrow?: boolean; // New prop to control arrow visibility
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, size, asChild = false, showArrow = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        {...props}
        className={cn(
          "group",
          buttonVariants({ variant, size, className })
        )}
      >
        {showArrow ? (
          <span className="inline-flex items-center gap-2">
            {children}
            <MoveRight className="w-5 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };