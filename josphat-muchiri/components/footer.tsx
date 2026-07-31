import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { navItems, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Josphat Muchiri</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Cybersecurity analyst, SOC-focused engineer, and Python developer building practical security systems through labs, automation, and documentation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`mailto:${site.email}`} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <Mail className="h-4 w-4" />
              Email
            </Link>
            <Link href={site.linkedin} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Link>
            <Link href={site.github} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-400 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

