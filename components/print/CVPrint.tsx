import type { CSSProperties, ReactNode } from "react";
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { getCvAccent } from "@/lib/cv-accents";
import { cvTemplateUsesSingleColumn, normalizeCvTemplate } from "@/lib/cv-templates";
import type { CVData, Details, ExperienceItem, SkillCategoryId } from "@/lib/cv-schema";
import {
  effectivePhotoMode,
  initialsFromName,
  showHeaderAvatar,
} from "@/lib/cv-photo";
import { cn } from "@/lib/cn";
import {
  formatExperiencePeriod,
  hasExperiencePeriod,
} from "@/lib/experience-dates";

/** Section headings aligned with classic resume PDF export. */
const SKILL_PRINT_LABELS: Record<SkillCategoryId, string> = {
  frontEnd: "Front-End Development",
  uiUx: "UI/UX Design",
  tools: "Tools",
  aiAutomation: "AI & Automation",
  principles: "Principles",
  cms: "Content Management Systems",
  os: "Operating Systems",
};

function hasText(s?: string | null) {
  return Boolean(s?.trim());
}


function experienceHasContent(exp: ExperienceItem): boolean {
  return (
    hasText(exp.role) ||
    hasText(exp.company) ||
    hasText(exp.country) ||
    hasText(exp.intro) ||
    hasText(exp.outro) ||
    (exp.bullets?.some(hasText) ?? false) ||
    hasExperiencePeriod(
      exp.startMonth,
      exp.startYear,
      exp.endMonth,
      exp.endYear,
    )
  );
}

function PrintSectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="cv-print-section-title mt-0 first:mt-0">{children}</h2>;
}

function DetailRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] leading-snug text-slate-800">
      <span className="cv-print-detail-icon flex shrink-0 items-center justify-center text-(--cv-print-accent) [&>svg]:size-3">
        {icon}
      </span>
      <span className="min-w-0 wrap-break-word">{children}</span>
    </div>
  );
}

function DetailsBlock({ details }: { details?: Details }) {
  if (!details) return null;
  const rows: { key: string; icon: ReactNode; value?: string }[] = [
    { key: "loc", icon: <MapPin />, value: details.location },
    { key: "em", icon: <Mail />, value: details.email },
    { key: "ph", icon: <Phone />, value: details.phone },
    { key: "web", icon: <Globe />, value: details.website },
    { key: "li", icon: <Linkedin />, value: details.linkedIn },
    { key: "gh", icon: <Github />, value: details.gitHub },
  ];
  const visible = rows.filter((r) => hasText(r.value));
  if (visible.length === 0) return null;
  return (
    <section className="cv-print-sidebar-section">
      <PrintSectionTitle>DETAILS</PrintSectionTitle>
      <div className="space-y-2.5">
        {visible.map((r) => (
          <DetailRow key={r.key} icon={r.icon}>
            {r.value}
          </DetailRow>
        ))}
      </div>
    </section>
  );
}

function ExperienceBlock({ items }: { items?: ExperienceItem[] }) {
  if (!items?.length) return null;
  const any = items.some(experienceHasContent);
  if (!any) return null;
  return (
    <section className="cv-print-experience-group space-y-6">
      <PrintSectionTitle>EXPERIENCE</PrintSectionTitle>
      <div className="space-y-6">
        {items.map((exp, i) => (
          <div key={i} className="cv-print-experience-item">
            <ExperienceItemView exp={exp} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperienceItemView({ exp }: { exp: ExperienceItem }) {
  const period = formatExperiencePeriod(
    exp.startMonth,
    exp.startYear,
    exp.endMonth,
    exp.endYear,
  );
  const bullets = (exp.bullets ?? []).filter(hasText);
  const hasRole = hasText(exp.role);
  const hasCompany = hasText(exp.company);
  const hasCountry = hasText(exp.country);
  const hasBlock =
    hasRole ||
    hasCompany ||
    hasCountry ||
    hasText(exp.intro) ||
    hasText(exp.outro) ||
    bullets.length > 0 ||
    period;
  if (!hasBlock) return null;

  return (
    <article className="cv-print-job space-y-2">
      {(hasRole || hasCompany || hasCountry) && (
        <p className="text-[11.5px] leading-snug text-slate-950">
          {hasRole && (
            <span className="font-bold">{exp.role!.trim()}</span>
          )}
          {hasRole && hasCompany && " – "}
          {hasCompany && (
            <span className="font-bold">{exp.company!.trim()}</span>
          )}
          {hasCountry && (
            <>
              {(hasRole || hasCompany) && ", "}
              <span className="font-normal italic text-slate-500">
                {exp.country!.trim()}
              </span>
            </>
          )}
        </p>
      )}
      {period && (
        <p className="text-[10px] italic tabular-nums text-slate-500">
          {period}
        </p>
      )}
      {hasText(exp.intro) && (
        <p className="text-[10.5px] leading-relaxed text-slate-800">
          {exp.intro}
        </p>
      )}
      {bullets.length > 0 && (
        <>
          <p className="text-[10.5px] font-bold text-slate-950">
            Key achievements:
          </p>
          <ul className="list-disc pl-[1.1em] space-y-1 text-[10.5px] leading-relaxed text-slate-800 marker:text-slate-900">
            {bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
        </>
      )}
      {hasText(exp.outro) && (
        <p className="text-[10px] leading-relaxed italic text-slate-600 border-l-2 border-slate-200 pl-3">
          {exp.outro}
        </p>
      )}
    </article>
  );
}

function SidebarColumn({
  cv,
  d,
}: {
  cv: CVData;
  d?: Details;
}) {
  const edu = cv.sidebar.education?.filter(
    (e) => hasText(e.university) || hasText(e.title),
  );
  const certs = cv.sidebar.certificates?.filter(
    (c) => c.year != null || hasText(c.name),
  );
  const langs = cv.sidebar.languages?.filter(
    (l) => hasText(l.name) || hasText(l.level),
  );
  const hasHobbies = hasText(cv.sidebar.hobbiesText);

  const skillBlocks = (cv.sidebar.skills ?? [])
    .map((s) => ({
      ...s,
      title: SKILL_PRINT_LABELS[s.categoryId],
      tags: (s.visibleTags ?? []).filter(hasText),
    }))
    .filter((s) => s.tags.length > 0);

  return (
    <aside className="min-w-0 space-y-7">
      <DetailsBlock details={d} />
      {edu && edu.length > 0 && (
        <section className="cv-print-sidebar-section">
          <PrintSectionTitle>EDUCATION</PrintSectionTitle>
          <div className="space-y-3 text-[10.5px] leading-snug text-slate-800">
            {edu.map((e, i) => (
              <div key={i} className="cv-print-edu-entry">
                {hasText(e.university) && (
                  <p>
                    <span className="font-bold text-slate-950">University:</span>{" "}
                    {e.university}
                  </p>
                )}
                {hasText(e.title) && (
                  <p className="mt-1">
                    <span className="font-bold text-slate-950">Title:</span>{" "}
                    {e.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {skillBlocks.length > 0 && (
        <section className="cv-print-sidebar-section cv-print-sidebar-skills">
          <PrintSectionTitle>SKILLS</PrintSectionTitle>
          <div className="space-y-3.5">
            {skillBlocks.map((s) => (
              <div key={s.categoryId} className="cv-print-skill-category">
                <p className="text-[10.5px] font-bold text-slate-950">
                  {s.title}:
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-800">
                  {s.tags.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      {certs && certs.length > 0 && (
        <section className="cv-print-sidebar-section">
          <PrintSectionTitle>CERTIFICATES</PrintSectionTitle>
          <ul className="space-y-2 text-[10.5px] text-slate-800">
            {certs.map((c, i) => (
              <li key={i} className="leading-snug">
                {c.year != null && (
                  <span className="font-bold tabular-nums text-slate-950">
                    {c.year}
                  </span>
                )}
                {c.year != null && hasText(c.name) && " "}
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {langs && langs.length > 0 && (
        <section className="cv-print-sidebar-section">
          <PrintSectionTitle>LANGUAGES</PrintSectionTitle>
          <p className="text-[10.5px] leading-relaxed text-slate-800">
            {langs
              .map((l) =>
                hasText(l.level)
                  ? `${l.name?.trim()} (${l.level?.trim()})`
                  : (l.name ?? "").trim(),
              )
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>
      )}
      {hasHobbies && (
        <section className="cv-print-sidebar-section">
          <PrintSectionTitle>HOBBIES &amp; INTERESTS</PrintSectionTitle>
          <p className="text-[10.5px] leading-relaxed text-slate-800">
            {cv.sidebar.hobbiesText}
          </p>
        </section>
      )}
    </aside>
  );
}

export function CVPrint({
  cv,
  variant = "app",
}: {
  cv: CVData;
  /** `pdf`: tighter, equal L / T / R inset for Playwright PDF export. */
  variant?: "app" | "pdf";
}) {
  const accent = getCvAccent(cv.meta.accent);
  const templateId = normalizeCvTemplate(cv.meta.template) ?? "classic";
  const singleColumn = cvTemplateUsesSingleColumn(templateId);
  const sidebarLeft = cv.meta.sidebarPosition === "left";
  const d = cv.sidebar.details;
  const photoMode = effectivePhotoMode(cv.body);
  const showAvatar = showHeaderAvatar(cv.body);
  const showName = hasText(cv.body.name) || hasText(cv.body.mainRole);
  const showProfile = hasText(cv.body.profile);

  const header = (showName || showAvatar) && (
    <header
      className={cn(
        "cv-print-page-header mb-8 flex gap-4 items-end",
        templateId === "nordic" && "cv-print-nordic-header flex-col items-center text-center gap-2 mb-10",
        templateId === "mono" && "cv-print-mono-header border-b border-slate-300 pb-6 mb-7",
      )}
    >
      {photoMode === "image" && hasText(cv.body.image) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cv.body.image}
          alt=""
          className={cn(
            "size-[68px] shrink-0 object-cover border border-slate-200/90",
            templateId === "studio" ? "rounded-2xl" : templateId === "modern" ? "rounded-md" : "rounded-lg",
          )}
        />
      )}
      {photoMode === "initials" && hasText(cv.body.name) && (
        <div
          className={cn(
            "flex size-[68px] shrink-0 items-center justify-center border border-slate-200/90 text-[22px] font-bold text-(--cv-print-accent)",
            templateId === "studio" ? "rounded-2xl" : templateId === "modern" ? "rounded-md" : "rounded-lg",
          )}
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${accent.initialsFrom}, ${accent.initialsTo})`,
          }}
          aria-hidden
        >
          {initialsFromName(cv.body.name)}
        </div>
      )}
      <div
        className={cn(
          "min-w-0 flex-1",
          templateId === "nordic" && "flex flex-col items-center",
        )}
      >
        {hasText(cv.body.name) && (
          <h1 className="cv-print-name m-0 text-[28px] font-bold leading-tight tracking-tight">
            {cv.body.name}
          </h1>
        )}
        {hasText(cv.body.mainRole) && (
          <p className="cv-print-subtitle mt-1 text-[14px] font-normal text-slate-600">
            {cv.body.mainRole}
          </p>
        )}
      </div>
    </header>
  );

  const profileSection = showProfile && (
    <section className="cv-print-main-section">
      <PrintSectionTitle>PROFILE</PrintSectionTitle>
      <p className="text-[10.5px] leading-relaxed text-slate-800">
        {cv.body.profile}
      </p>
    </section>
  );

  const mainColumn = (
    <div className="min-w-0 space-y-0">
      {profileSection}
      <ExperienceBlock items={cv.body.experience} />
    </div>
  );

  const sidebarColumn = (
    <div
      className={cn(
        templateId === "studio" && "cv-print-studio-sidebar",
        templateId === "executive" && "cv-print-executive-sidebar",
        templateId === "nordic" && "cv-print-nordic-sidebar",
      )}
    >
      <SidebarColumn cv={cv} d={d} />
    </div>
  );

  const bodyLayout = singleColumn ? (
    <div className="cv-print-single-column space-y-8">
      <div className="cv-print-column-main min-w-0">{mainColumn}</div>
      <div className="cv-print-column-sidebar cv-print-mono-stack min-w-0">{sidebarColumn}</div>
    </div>
  ) : (
    <div
      className={cn(
        "grid items-start gap-x-11 gap-y-0",
        templateId === "nordic" && "gap-x-14",
        templateId === "studio" && "gap-x-8",
        sidebarLeft
          ? "grid-cols-[228px_minmax(0,1fr)]"
          : "grid-cols-[minmax(0,1fr)_228px]",
      )}
    >
      {sidebarLeft ? (
        <>
          <div className="cv-print-column-sidebar min-w-0">{sidebarColumn}</div>
          <div className="cv-print-column-main min-w-0">{mainColumn}</div>
        </>
      ) : (
        <>
          <div className="cv-print-column-main min-w-0">{mainColumn}</div>
          <div className="cv-print-column-sidebar min-w-0">{sidebarColumn}</div>
        </>
      )}
    </div>
  );

  return (
    <div
      data-cv-print-root
      data-cv-template={templateId}
      className="cv-print-root bg-white text-slate-900 antialiased scheme-light"
      style={{ "--cv-print-accent": accent.accent } as CSSProperties}
    >
      <div
        className={cn(
          "mx-auto w-[210mm] max-w-full box-border pb-[8mm]",
          variant === "pdf"
            ? "px-[8mm] pt-0"
            : "px-[12mm] pt-[11mm]",
          templateId === "nordic" && "cv-print-nordic-page",
        )}
      >
        {header}
        {bodyLayout}
      </div>
    </div>
  );
}
