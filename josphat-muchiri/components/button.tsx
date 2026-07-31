import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function ButtonLink({ href, children, className, variant = "primary", ...props }: ButtonLinkProps) {
  const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
  const classNames = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
    variant === "primary" && "bg-accent text-white shadow-glow hover:bg-blue-400",
    variant === "secondary" && "border border-white/12 bg-white/8 text-white hover:bg-white/12",
    variant === "ghost" && "text-slate-300 hover:text-white",
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={classNames}
        rel={props.target === "_blank" ? "noreferrer" : props.rel}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classNames}
      {...props}
    >
      {children}
    </Link>
  );
}
