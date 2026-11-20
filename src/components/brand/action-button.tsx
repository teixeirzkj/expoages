import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const actionButton = cva(
  "group relative inline-flex select-none items-center whitespace-nowrap justify-center gap-2.5 overflow-hidden rounded-full font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-expo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-navy text-white hover:bg-blue",
        light: "bg-cream text-navy hover:bg-white",
        accent: "bg-white text-navy hover:bg-sky",
        outline: "border border-current/30 text-current hover:border-current/70",
        ghost: "text-current hover:bg-current/8",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        xl: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Common = VariantProps<typeof actionButton> & { children: ReactNode; className?: string; icon?: ReactNode };

/** Ícone que desliza no hover (sem depender de hover para funcionar). */
function Content({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <>
      <span className="relative inline-flex items-center gap-2">{children}</span>
      {icon ? (
        <span className="relative inline-flex size-5 items-center justify-center overflow-hidden" aria-hidden>
          <span className="transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:translate-x-0.5">{icon}</span>
        </span>
      ) : null}
    </>
  );
}

export function ActionButton({ variant, size, className, children, icon, ...props }: Common & ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" className={cn(actionButton({ variant, size }), className)} {...props}>
      <Content icon={icon}>{children}</Content>
    </button>
  );
}

export function ActionLink({
  variant,
  size,
  className,
  children,
  icon,
  href,
  ...props
}: Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  return (
    <Link href={href} className={cn(actionButton({ variant, size }), className)} {...props}>
      <Content icon={icon}>{children}</Content>
    </Link>
  );
}
