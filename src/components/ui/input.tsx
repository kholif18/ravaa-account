import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium dark:text-zinc-200 text-zinc-300"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 rounded-lg text-sm transition-colors",
            "dark:bg-[#1A1A1A] dark:border-white/[0.04] dark:text-zinc-200 dark:placeholder:text-zinc-500",
            "bg-white border-zinc-200 text-white placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error
              ? "border-red-500 focus:ring-red-500"
              : "",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
