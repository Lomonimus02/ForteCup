// =========================================
// Admin UI Components — Shadcn-style
// Tailwind v4 compatible (no tailwind.config)
// =========================================

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Input ───────────────────────────────

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: string }
>(({ className, error, ...props }, ref) => (
  <div className="w-full">
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed",
        error && "border-red-500/50 focus:ring-red-500/20",
        className
      )}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));
Input.displayName = "Input";

// ─── Textarea ────────────────────────────

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }
>(({ className, error, ...props }, ref) => (
  <div className="w-full">
    <textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-600 transition resize-y min-h-[80px] disabled:opacity-50",
        error && "border-red-500/50 focus:ring-red-500/20",
        className
      )}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";

// ─── Select ──────────────────────────────

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(({ className, error, children, ...props }, ref) => (
  <div className="w-full">
    <select
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-neutral-600 transition disabled:opacity-50 appearance-none cursor-pointer",
        error && "border-red-500/50 focus:ring-red-500/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));
Select.displayName = "Select";

// ─── Label ───────────────────────────────

export function Label({
  children,
  htmlFor,
  required,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-neutral-400 mb-1.5", className)}
    >
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ─── Button ──────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-black font-bold hover:bg-neutral-200",
  secondary:
    "bg-neutral-800 text-white font-medium hover:bg-neutral-700 border border-neutral-700",
  danger:
    "bg-red-600 text-white font-bold hover:bg-red-700",
  ghost:
    "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "rounded-lg transition uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Dialog / Modal ──────────────────────

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Table ───────────────────────────────

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-neutral-800 bg-neutral-950">
      {children}
    </thead>
  );
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-neutral-800/50 hover:bg-neutral-900/50 transition", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 text-neutral-300", className)}>
      {children}
    </td>
  );
}

// ─── Badge ───────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-neutral-800 text-neutral-300",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Checkbox ────────────────────────────

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ label, className, ...props }, ref) => (
  <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
    <input
      ref={ref}
      type="checkbox"
      className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-white focus:ring-white/20 accent-white"
      {...props}
    />
    {label && <span className="text-sm text-neutral-300">{label}</span>}
  </label>
));
Checkbox.displayName = "Checkbox";
