import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.04] backdrop-blur-xl shadow-lg overflow-hidden",
        className
      )}
      style={{ backgroundColor: "#1B1B1B" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-white/[0.04] backdrop-blur-xl overflow-hidden",
        className
      )}
      style={{ backgroundColor: "#1B1B1B" }}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
