import { Download } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { Badge } from "@/components/badge";
import { resume } from "@/lib/resume-data";
import { site } from "@/lib/site";

export const metadata = {
  title: "Resume",
  description: "Web resume for Josphat Muchiri, optimized from the downloadable PDF resume."
};

export default function ResumePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Web resume</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">{resume.name}</h1>
            <p className="mt-3 text-lg text-slate-300">{resume.headline}</p>
            <p className="mt-2 text-sm text-slate-400">
              {resume.location} | {resume.phone} | {resume.email}
            </p>
          </div>
          <ButtonLink href={site.resumePdf}>
            <Download className="h-4 w-4" />
            Download PDF
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {resume.summary.map((paragraph) => (
            <p key={paragraph} className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm leading-6 text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.72fr]">
        <div className="space-y-8">
          <Section title="Professional Experience">
            <div className="space-y-6">
              {resume.experience.map((job) => (
                <div key={`${job.company}-${job.role}`} className="rounded-2xl border border-white/10 bg-white/6 p-5">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white">{job.role}</h3>
                      <p className="text-blue-200">{job.company}</p>
                    </div>
                    <Badge>{job.period}</Badge>
                  </div>
                  {job.summary ? <p className="mt-4 text-sm leading-6 text-slate-300">{job.summary}</p> : null}
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                    {job.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Projects">
            {resume.projects.map((project) => (
              <div key={project.name} className="rounded-2xl border border-white/10 bg-white/6 p-5">
                <h3 className="font-display text-2xl font-bold text-white">{project.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        </div>

        <aside className="space-y-8">
          <Section title="Technical Skills">
            <div className="space-y-5">
              {Object.entries(resume.skills).map(([group, skills]) => (
                <div key={group}>
                  <h3 className="font-semibold text-white">{group}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Certifications">
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {resume.certifications.map((cert) => (
                <li key={cert}>{cert}</li>
              ))}
            </ul>
          </Section>

          <Section title="Selected Achievements">
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {resume.achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </Section>

          <Section title="Education">
            {resume.education.map((item) => (
              <div key={item.degree} className="text-sm leading-6 text-slate-300">
                <p className="font-semibold text-white">{item.degree}</p>
                <p>{item.school}</p>
                <p>{item.year}</p>
              </div>
            ))}
          </Section>
        </aside>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="mb-5 font-display text-2xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

