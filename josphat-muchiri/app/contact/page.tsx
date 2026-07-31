import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: "Contact Josphat Muchiri for cybersecurity, SOC, Python automation, and technical support opportunities."
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass rounded-3xl p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Contact</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">Work with Josphat</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          For cybersecurity, SOC, Python automation, technical support, or documentation-focused opportunities, reach out through email, LinkedIn, or GitHub.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ContactItem icon={<Mail className="h-5 w-5" />} label="Email" value={site.email} href={`mailto:${site.email}`} />
          <ContactItem icon={<Phone className="h-5 w-5" />} label="Phone" value={site.phone} href={`tel:${site.phone.replace(/\s/g, "")}`} />
          <ContactItem icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" value="muchiri-josphat-965396114" href={site.linkedin} />
          <ContactItem icon={<Github className="h-5 w-5" />} label="GitHub" value="JomuChiri" href={site.github} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`mailto:${site.email}`}>Email Josphat</ButtonLink>
          <ButtonLink href="/resume" variant="secondary">View Resume</ButtonLink>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="rounded-2xl border border-white/10 bg-white/6 p-5 transition hover:bg-white/10">
      <div className="flex items-center gap-3 text-blue-200">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-3 break-words text-slate-200">{value}</p>
    </a>
  );
}

