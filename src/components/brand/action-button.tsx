import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const actionButton = cva(
  "group relative inline-flex select-none items-center whitespace-nowrap justify-center gap-2.5 overflow-hidden rounded-full font-semibold tracking-[-0.01em] transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-petrol text-ivory hover:bg-charcoal",
        light: "bg-ivory text-petrol hover:bg-white",
        terracotta: "bg-terracotta text-ink hover:bg-[#df9d83]",
        outline: "border border-current/25 text-current hover:border-current/60 hover:bg-current/5",
        ghost: "text-current hover:bg-current/8",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-[0.95rem]",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-8 text-[1.05rem]",
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
          <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-[140%]">{icon}</span>
          <span className="absolute -translate-x-[140%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0">{icon}</span>
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
