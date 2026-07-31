import { Github, Linkedin, Mail, MessageCircle, MessageSquareText, Phone, Send } from "lucide-react";
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
          Send a short message or use the quick actions for email, WhatsApp, text, or a phone call.
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            action={`mailto:${site.email}`}
            method="post"
            encType="text/plain"
            className="rounded-2xl border border-white/10 bg-white/6 p-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                Name
                <input name="name" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-300" required />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Email or phone
                <input name="reply_to" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-300" required />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-200">
              Message
              <textarea
                name="message"
                rows={6}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-300"
                placeholder="Share the opportunity, project, or question."
                required
              />
            </label>
            <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400 active:scale-[0.98]">
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </form>
          <div className="grid gap-4">
            <ContactItem icon={<Mail className="h-5 w-5" />} label="Email" value={site.email} href={`mailto:${site.email}`} />
            <ContactItem icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={site.phone} href={site.whatsapp} />
            <ContactItem icon={<MessageSquareText className="h-5 w-5" />} label="Text" value={site.phone} href={`sms:+${site.phoneDigits}`} />
            <ContactItem icon={<Phone className="h-5 w-5" />} label="Call" value={site.phone} href={`tel:+${site.phoneDigits}`} />
            <ContactItem icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" value="muchiri-josphat-965396114" href={site.linkedin} />
            <ContactItem icon={<Github className="h-5 w-5" />} label="GitHub" value="JomuChiri" href={site.github} />
          </div>
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
