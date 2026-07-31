export const site = {
  name: "Josphat Muchiri",
  title: "Josphat Muchiri | Cybersecurity Analyst and Python Developer",
  description:
    "Josphat Muchiri is a cybersecurity analyst, SOC-focused engineer, and Python developer building practical security projects, labs, investigations, and technical documentation.",
  url: "https://jomuchiri.github.io/Portfolio/",
  email: "muchirijosmuchiri@gmail.com",
  phone: "+254 725 873 673",
  linkedin: "https://linkedin.com/in/muchiri-josphat-965396114",
  github: "https://github.com/JomuChiri",
  resumePdf: "/resume/Josphat_Muchiri_CV2.pdf",
  portrait: "/images/josphat-muchiri.jpg",
  ogImage: "/images/og-image.jpg"
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Labs", href: "/labs" },
  { label: "Knowledge Base", href: "/knowledge" },
  { label: "Investigations", href: "/investigations" },
  { label: "Timeline", href: "/timeline" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" }
];

export const sectionConfig = {
  projects: {
    label: "Projects",
    description: "Security automation, SOC tooling, and practical software builds.",
    singular: "Project"
  },
  labs: {
    label: "Labs",
    description: "Hands-on lab environments documented like Microsoft Learn modules.",
    singular: "Lab"
  },
  investigations: {
    label: "Investigations",
    description: "SOC-style reports with timelines, indicators, evidence, and MITRE mappings.",
    singular: "Investigation"
  },
  knowledge: {
    label: "Knowledge Base",
    description: "Frameworks, detection notes, operating systems, networking, and interview notes.",
    singular: "Knowledge Note"
  },
  writeups: {
    label: "Write-ups",
    description: "TryHackMe, LetsDefend, incident analysis, and security learning write-ups.",
    singular: "Write-up"
  },
  blog: {
    label: "Blog",
    description: "Learning essays and technical reflections.",
    singular: "Post"
  },
  certifications: {
    label: "Certifications",
    description: "Credential notes, learning evidence, and certification summaries.",
    singular: "Certification"
  }
} as const;

export type ContentSection = keyof typeof sectionConfig;

