import { Badge } from "@/components/badge";

export const metadata = {
  title: "Timeline",
  description: "Cybersecurity learning, project, and certification timeline for Josphat Muchiri."
};

const timeline = [
  {
    year: "2024",
    items: ["Started Security+ learning path", "Built first security lab", "Completed ISC2 CC learning milestone"]
  },
  {
    year: "2025",
    items: ["Expanded Candor", "Built OpenVAS practice workflows", "Documented Wazuh and Active Directory lab notes"]
  },
  {
    year: "2026",
    items: ["BreakBuddy", "Cisco CyberOps", "Fortinet learning", "University of the People", "Micro1 interview preparation"]
  },
  {
    year: "Future",
    items: ["More SOC investigations", "Detection engineering write-ups", "Security automation tooling", "Long-term knowledge base growth"]
  }
];

export default function TimelinePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Milestones</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">Timeline</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        A living record of learning, lab work, certifications, projects, and security documentation.
      </p>
      <div className="relative mt-12 space-y-8 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-blue-300/30 sm:before:left-1/2">
        {timeline.map((block, index) => (
          <div key={block.year} className="relative grid gap-6 sm:grid-cols-2">
            <div className={index % 2 === 0 ? "sm:text-right" : "sm:col-start-2"}>
              <Badge>{block.year}</Badge>
            </div>
            <div className={index % 2 === 0 ? "sm:col-start-2" : "sm:row-start-1"}>
              <div className="glass rounded-2xl p-5">
                <ul className="space-y-3 text-sm leading-6 text-slate-300">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

