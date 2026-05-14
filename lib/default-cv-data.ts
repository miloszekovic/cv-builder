import type { CVData, SkillCategoryId, SkillLibrary } from "./cv-schema";
import { SKILL_CATEGORY_LABELS } from "./cv-schema";

/** Ensures `meta.accent` is set when binding accent radios in the form. */
export function withDefaultMetaAccent(cv: CVData): CVData {
  return {
    ...cv,
    meta: { ...cv.meta, accent: cv.meta.accent ?? "teal" },
  };
}

export const defaultSkillLibraryTags: Record<SkillCategoryId, string[]> = {
  frontEnd: [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue",
    "Nuxt",
    "SvelteKit",
    "Astro",
    "Tailwind CSS",
    "Vite",
    "Responsive UI",
  ],
  uiUx: [
    "Figma",
    "FigJam",
    "Design systems",
    "Design tokens",
    "Prototyping",
    "WCAG",
    "User flows",
    "Usability testing",
    "Design–dev handoff",
    "Interaction design",
  ],
  tools: [
    "Git",
    "GitHub",
    "GitHub Actions",
    "Docker",
    "Vercel",
    "Cloudflare",
    "npm",
    "pnpm",
    "Bun",
    "Turborepo",
    "Playwright",
    "Vitest",
    "Linear",
    "Notion",
  ],
  aiAutomation: [
    "ChatGPT",
    "Claude",
    "Cursor",
    "GitHub Copilot",
    "OpenAI API",
    "Anthropic API",
    "MCP",
    "Prompt engineering",
    "RAG",
    "Agentic workflows",
    "n8n",
  ],
  principles: [
    "Accessibility",
    "Core Web Vitals",
    "Performance optimization",
    "SEO",
    "Semantic HTML",
    "Mobile-first",
    "Maintainable architecture",
    "Type safety",
    "Secure coding",
    "Documentation",
  ],
  cms: [
    "WordPress",
    "Sanity",
    "Contentful",
    "Strapi",
    "Payload CMS",
    "MDX",
    "Headless CMS",
    "Astro Content Collections",
  ],
  os: ["macOS", "Windows", "Linux", "WSL 2"],
};

export function createDefaultSkillLibrary(): SkillLibrary {
  const lib = {} as SkillLibrary;
  (Object.keys(defaultSkillLibraryTags) as SkillCategoryId[]).forEach((id) => {
    lib[id] = {
      label: SKILL_CATEGORY_LABELS[id],
      tags: [...defaultSkillLibraryTags[id]],
    };
  });
  return lib;
}

/** All tags visible per category by default. */
export function defaultSkillSelectionsFromLibrary(lib: SkillLibrary) {
  return (Object.keys(lib) as SkillCategoryId[]).map((categoryId) => ({
    categoryId,
    visibleTags: [...lib[categoryId].tags],
  }));
}

/** One row per skill category with nothing selected (for new / blank CVs). */
export function emptySkillSelections(): NonNullable<CVData["sidebar"]["skills"]> {
  return (Object.keys(defaultSkillLibraryTags) as SkillCategoryId[]).map(
    (categoryId) => ({
      categoryId,
      visibleTags: [],
    }),
  );
}

export const blankCvData = (): CVData => {
  return {
    meta: {
      sidebarPosition: "right",
      accent: "teal",
    },
    body: {
      experience: [],
      photoMode: "none",
    },
    sidebar: {
      details: {},
      skills: emptySkillSelections(),
      education: [],
      certificates: [],
      languages: [],
      hobbies: [],
    },
  };
};

/**
 * Full demo CV — every optional field filled for screenshots and PDF samples.
 * Fictional data only.
 */
export const exampleCvData = (): CVData => {
  const lib = createDefaultSkillLibrary();
  return {
    meta: {
      versionName: "Demo Showcase CV",
      targetRole: "Senior Front-End Engineer",
      sidebarPosition: "right",
      accent: "indigo",
    },
    body: {
      photoMode: "initials",
      name: "Jordan Demo",
      mainRole: "Senior Front-End Engineer / UI Developer",
      profile:
        "Product-minded front-end engineer with a strong eye for layout, typography, and interaction design. I enjoy turning ambiguous product ideas into clear UI flows, measurable performance budgets, and accessible components that scale across teams. I collaborate closely with design systems owners, backend engineers, and stakeholders to ship features without sacrificing quality. I care about pragmatic documentation, meaningful code review, and mentoring teammates through pairing and lightweight RFCs. Outside delivery work I stay current with the web platform, tooling, and responsible use of AI in engineering workflows.",
      experience: [
        {
          role: "Lead Front-End Engineer",
          company: "Nimbus Analytics (demo)",
          startYear: 2022,
          endYear: "present",
          intro:
            "B2B analytics platform used by operations teams at mid-market companies. I own the web shell, navigation, and shared UI primitives used across six product areas.",
          bullets: [
            "Cut median LCP on primary dashboards from 3.8s to 1.9s using route-based code splitting, tuned image pipelines, and font-display strategy.",
            "Shipped a token-based design system in React + Storybook with automated visual regression and accessibility checks in CI.",
            "Partnered with design on WCAG 2.2 AA remediation across high-traffic flows; documented patterns for focus order and live regions.",
            "Introduced feature flags and staged rollouts for UI changes, reducing rollback incidents during peak season.",
          ],
          outro:
            "This role deepened my skills in performance profiling, cross-team facilitation, and balancing roadmap pressure with sustainable engineering practices.",
        },
        {
          role: "Senior Front-End Developer",
          company: "Harbor Studio (demo agency)",
          startYear: 2019,
          endYear: 2022,
          intro:
            "Digital agency building marketing sites, design systems, and light product UI for SaaS and fintech clients.",
          bullets: [
            "Delivered fifteen+ production sites on React, Next.js, or Vue with CMS-driven content and component libraries.",
            "Implemented analytics, consent, and SEO foundations including JSON-LD, sitemap strategy, and Core Web Vitals budgets per client.",
            "Led accessibility audits and remediation sprints; trained designers on semantic structure and contrast requirements.",
          ],
          outro:
            "Learned to estimate realistically, communicate trade-offs early, and leave each client with documentation they could maintain.",
        },
        {
          role: "UI Developer",
          company: "Brightline Health Tech (demo)",
          startYear: 2017,
          endYear: 2019,
          intro:
            "Patient-facing scheduling and account tools for a regional healthcare network.",
          bullets: [
            "Rebuilt appointment booking flows with clearer error states and reduced drop-off in usability tests.",
            "Integrated REST APIs with optimistic UI where safe; added retry and offline messaging for flaky networks.",
          ],
        },
        {
          role: "Junior Web Developer",
          company: "Pixel Foundry (demo)",
          startYear: 2015,
          endYear: 2017,
          intro:
            "Small studio producing marketing sites and WordPress themes for local businesses.",
          bullets: [
            "Implemented responsive templates from Photoshop and Sketch handoffs using HTML5, SCSS, and jQuery.",
            "Maintained hosting deployments and basic Linux server configuration for a handful of retained clients.",
          ],
          outro:
            "Foundation years: attention to detail, client communication, and learning not to ship on a Friday without a rollback plan.",
        },
      ],
    },
    sidebar: {
      details: {
        location: "Oslo, Norway (demo)",
        email: "jordan.demo@example.com",
        phone: "+47 12 34 56 78",
        website: "https://demo-cv.example.com",
        linkedIn: "linkedin.com/in/jordan-demo",
        gitHub: "github.com/jordan-demo",
      },
      education: [
        {
          university: "Example Polytechnic (demo)",
          title: "B.Sc. Information Systems and Software Engineering",
        },
        {
          university: "Example Summer School (demo)",
          title: "Certificate in Human-Computer Interaction",
        },
      ],
      skills: defaultSkillSelectionsFromLibrary(lib),
      certificates: [
        {
          year: 2024,
          name: "Certified Web Application Developer (demo credential)",
        },
        { year: 2022, name: "Accessibility for Teams (demo workshop series)" },
        { name: "Internal security awareness completion (demo, no year)" },
      ],
      languages: [
        { name: "English", level: "Fluent (C2)" },
        { name: "Norwegian", level: "Professional working proficiency" },
        { name: "Serbian", level: "Native" },
        { name: "German", level: "Basic" },
      ],
      hobbies: [],
      hobbiesText:
        "I contribute small patches to OSS UI libraries and occasionally mentor bootcamp graduates through mock interviews and portfolio reviews. Outside work I enjoy film photography, gravel cycling, and local meetups.",
    },
  };
};
