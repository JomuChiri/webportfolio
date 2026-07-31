"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Github, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { navItems, site } from "@/lib/site";
import { ButtonLink } from "@/components/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/14 text-blue-200 ring-1 ring-blue-400/30">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-white">Josphat Muchiri</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white",
                  active && "bg-white/10 text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href={site.github} variant="secondary" target="_blank">
            <Github className="h-4 w-4" />
            GitHub
          </ButtonLink>
          <ButtonLink href={site.resumePdf}>
            <Download className="h-4 w-4" />
            Resume
          </ButtonLink>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-background px-4 py-4 lg:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/8"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

