import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm transition-all duration-300 [&>svg~*]:pl-7 sm:[&>svg~*]:pl-8 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-3 sm:[&>svg]:left-4 [&>svg]:top-3 sm:[&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-background/95 text-foreground border border-border",
        destructive: "bg-destructive/10 border border-destructive/30 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & { 
    dismissible?: boolean;
    onClose?: () => void;
  }
>(({ className, variant, dismissible, onClose, children, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), dismissible && "pr-10 sm:pr-12", className)} {...props}>
    {children}
    {dismissible && onClose && (
      <button
        onClick={onClose}
        className={cn(
          "absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full",
          "p-1 flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          variant === "destructive" 
            ? "bg-destructive/20 hover:bg-destructive/30 text-destructive focus:ring-destructive" 
            : "bg-muted hover:bg-muted/80 text-muted-foreground focus:ring-primary"
        )}
        aria-label="Fermer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
