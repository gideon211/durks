import { cn } from "@/lib/utils";

interface ShimmerBarProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
}

function ShimmerBar({ className, height = "h-4", ...props }: ShimmerBarProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-muted/70", height, className)}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}

export { ShimmerBar };
