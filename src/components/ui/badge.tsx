import { cn } from "../../lib/utils";

type BadgeProps = {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[#f5f5f5] text-zinc-300 dark:bg-[#232323] dark:text-zinc-300":
            variant === "default",
          "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400":
            variant === "success",
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400":
            variant === "warning",
          "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400":
            variant === "danger",
          "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400":
            variant === "info",
        }
      )}
    >
      {children}
    </span>
  );
}
