import type { ReactNode } from "react";
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { CVData, Details, ExperienceItem, SkillCategoryId } from "@/lib/cv-schema";
import {
  effectivePhotoMode,
  initialsFromName,
  showHeaderAvatar,
} from "@/lib/cv-photo";
import { cn } from "@/lib/cn";

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

function formatYears(
  start?: number,
  end?: number | "present",
): string | null {
  if (start == null && end == null) return null;
  const endStr =
    end === "present" ? "Present" : end != null ? String(end) : "";
  const startStr = start != null ? String(start) : "";
  if (startStr && endStr) return `${startStr} – ${endStr}`;
  return startStr || endStr || null;
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
      <span className="flex shrink-0 items-center justify-center text-(--cv-print-accent) [&>svg]:size-3.5">
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
  const any = items.some(
    (e) =>
      hasText(e.role) ||
      hasText(e.company) ||
      hasText(e.intro) ||
      hasText(e.outro) ||
      (e.bullets?.some(hasText) ?? false) ||
      formatYears(e.startYear, e.endYear),
  );
  if (!any) return null;
  return (
    <section className="cv-print-main-section space-y-6">
      <PrintSectionTitle>EXPERIENCE</PrintSectionTitle>
      <div className="space-y-6">
        {items.map((exp, i) => (
          <ExperienceItemView key={i} exp={exp} />
        ))}
      </div>
    </section>
  );
}

function ExperienceItemView({ exp }: { exp: ExperienceItem }) {
  const years = formatYears(exp.startYear, exp.endYear);
  const bullets = (exp.bullets ?? []).filter(hasText);
  const hasBlock =
    hasText(exp.role) ||
    hasText(exp.company) ||
    hasText(exp.intro) ||
    hasText(exp.outro) ||
    bullets.length > 0 ||
    years;
  if (!hasBlock) return null;

  const titleParts: string[] = [];
  if (hasText(exp.role)) titleParts.push(exp.role!.trim());
  if (hasText(exp.company)) titleParts.push(exp.company!.trim());
  const titleLine =
    titleParts.length === 2
      ? `${titleParts[0]} – ${titleParts[1]}`
      : titleParts[0] ?? "";

  return (
    <article className="cv-print-job space-y-2">
      {hasText(titleLine) && (
        <p className="text-[11.5px] font-bold leading-snug text-slate-950">
          {titleLine}
        </p>
      )}
      {years && (
        <p className="text-[10px] tabular-nums text-slate-500">
          {years}
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
  const hobbiesTags = (cv.sidebar.hobbies ?? []).filter(hasText);
  const hasHobbies = hobbiesTags.length > 0 || hasText(cv.sidebar.hobbiesText);

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
          {hasText(cv.sidebar.hobbiesText) && (
            <p className="text-[10.5px] leading-relaxed text-slate-800">
              {cv.sidebar.hobbiesText}
            </p>
          )}
          {hobbiesTags.length > 0 && (
            <p className="mt-1 text-[10.5px] leading-relaxed text-slate-800">
              {hobbiesTags.join(", ")}
            </p>
          )}
        </section>
      )}
    </aside>
  );
}

export function CVPrint({ cv }: { cv: CVData }) {
  const sidebarLeft = cv.meta.sidebarPosition === "left";
  const d = cv.sidebar.details;
  const photoMode = effectivePhotoMode(cv.body);
  const showAvatar = showHeaderAvatar(cv.body);
  const showName = hasText(cv.body.name) || hasText(cv.body.mainRole);
  const showProfile = hasText(cv.body.profile);

  const header = (showName || showAvatar) && (
    <header className="mb-8 flex gap-4 items-end">
      {photoMode === "image" && hasText(cv.body.image) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cv.body.image}
          alt=""
          className="size-[68px] shrink-0 rounded-lg object-cover border border-slate-200/90"
        />
      )}
      {photoMode === "initials" && hasText(cv.body.name) && (
        <div
          className="flex size-[68px] shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-linear-to-br from-teal-50 to-teal-100/90 text-[22px] font-bold text-(--cv-print-accent)"
          aria-hidden
        >
          {initialsFromName(cv.body.name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {hasText(cv.body.name) && (
          <h1 className="cv-print-name m-0 text-[26px] font-bold leading-tight tracking-tight">
            {cv.body.name}
          </h1>
        )}
        {hasText(cv.body.mainRole) && (
          <p className="cv-print-subtitle mt-1 text-[11px] font-normal text-slate-600">
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

  const sidebarColumn = <SidebarColumn cv={cv} d={d} />;

  return (
    <div
      data-cv-print-root
      className="cv-print-root bg-white text-slate-900 antialiased scheme-light"
    >
      <div className="mx-auto w-[210mm] max-w-full min-h-[297mm] box-border px-[12mm] py-[11mm]">
        {header}
        <div
          className={cn(
            "grid items-start gap-x-11 gap-y-0",
            sidebarLeft
              ? "grid-cols-[228px_minmax(0,1fr)]"
              : "grid-cols-[minmax(0,1fr)_228px]",
          )}
        >
          {sidebarLeft ? (
            <>
              <div className="min-w-0">{sidebarColumn}</div>
              <div className="min-w-0">{mainColumn}</div>
            </>
          ) : (
            <>
              <div className="min-w-0">{mainColumn}</div>
              <div className="min-w-0">{sidebarColumn}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
