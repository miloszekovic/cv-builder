import {
  cvDataSchema,
  cvExportBundleSchema,
  skillCategoryIdSchema,
  type CVData,
  type CVVersionMeta,
  type SkillCategoryId,
  type SkillLibrary,
} from "./cv-schema";
import { blankCvData, createDefaultSkillLibrary } from "./default-cv-data";

const PREFIX = "cv-gen:";
const VERSIONS_KEY = `${PREFIX}versions`;
const ACTIVE_KEY = `${PREFIX}activeVersionId`;
const SKILL_LIB_KEY = `${PREFIX}skillLibrary`;

function versionKey(id: string) {
  return `${PREFIX}version:${id}`;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface CvStoragePort {
  listVersions(): CVVersionMeta[];
  getActiveVersionId(): string | null;
  setActiveVersionId(id: string | null): void;
  getCv(versionId: string): CVData | null;
  saveCv(versionId: string, cv: CVData): void;
  createVersion(name?: string): CVVersionMeta;
  duplicateVersion(versionId: string): CVVersionMeta | null;
  deleteVersion(versionId: string): void;
  getSkillLibrary(): SkillLibrary;
  setSkillLibrary(lib: SkillLibrary): void;
  exportJson(versionId: string): string;
  importJson(json: string): { cv: CVData; skillLibrary?: SkillLibrary } | null;
}

function readVersions(): CVVersionMeta[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParseJson<CVVersionMeta[]>(localStorage.getItem(VERSIONS_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function writeVersions(v: CVVersionMeta[]) {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v));
}

function ensureSkillLibrary(): SkillLibrary {
  const raw = localStorage.getItem(SKILL_LIB_KEY);
  const parsed = raw ? safeParseJson<SkillLibrary>(raw) : null;
  if (parsed && typeof parsed === "object") {
    const result = createDefaultSkillLibrary();
    (Object.keys(result) as (keyof SkillLibrary)[]).forEach((id) => {
      const incoming = parsed[id];
      if (incoming?.tags?.length) {
        result[id] = {
          label: incoming.label || result[id].label,
          tags: [...new Set(incoming.tags.map(String))],
        };
      }
    });
    return result;
  }
  const fresh = createDefaultSkillLibrary();
  localStorage.setItem(SKILL_LIB_KEY, JSON.stringify(fresh));
  return fresh;
}

function migrateIfEmpty(): CVVersionMeta | null {
  const versions = readVersions();
  if (versions.length > 0) return null;
  const id = newId();
  ensureSkillLibrary();
  const cv = blankCvData();
  const meta: CVVersionMeta = {
    id,
    name: "Untitled",
    updatedAt: new Date().toISOString(),
  };
  writeVersions([meta]);
  localStorage.setItem(versionKey(id), JSON.stringify(cv));
  localStorage.setItem(ACTIVE_KEY, id);
  return meta;
}

export const localCvStorage: CvStoragePort = {
  listVersions() {
    if (typeof window === "undefined") return [];
    migrateIfEmpty();
    return readVersions().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  getActiveVersionId() {
    if (typeof window === "undefined") return null;
    migrateIfEmpty();
    return localStorage.getItem(ACTIVE_KEY);
  },

  setActiveVersionId(id) {
    if (typeof window === "undefined") return;
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  },

  getCv(versionId) {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(versionKey(versionId));
    const parsed = raw ? safeParseJson<unknown>(raw) : null;
    const r = cvDataSchema.safeParse(parsed);
    return r.success ? r.data : null;
  },

  saveCv(versionId, cv) {
    if (typeof window === "undefined") return;
    localStorage.setItem(versionKey(versionId), JSON.stringify(cv));
    const versions = readVersions();
    const idx = versions.findIndex((v) => v.id === versionId);
    const name = cv.meta.versionName?.trim() || versions[idx]?.name || "Untitled";
    const next: CVVersionMeta = {
      id: versionId,
      name,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      versions[idx] = next;
    } else {
      versions.push(next);
    }
    writeVersions(versions);
  },

  createVersion(name) {
    if (typeof window === "undefined") {
      return { id: "", name: name?.trim() || "Untitled", updatedAt: new Date().toISOString() };
    }
    const id = newId();
    ensureSkillLibrary();
    const cv = blankCvData();
    const listName = name?.trim() || "Untitled";
    const meta: CVVersionMeta = {
      id,
      name: listName,
      updatedAt: new Date().toISOString(),
    };
    const versions = readVersions();
    versions.push(meta);
    writeVersions(versions);
    localStorage.setItem(versionKey(id), JSON.stringify(cv));
    localStorage.setItem(ACTIVE_KEY, id);
    return meta;
  },

  duplicateVersion(versionId) {
    if (typeof window === "undefined") return null;
    const source = this.getCv(versionId);
    if (!source) return null;
    const id = newId();
    const copy: CVData = JSON.parse(JSON.stringify(source));
    copy.meta.versionName = `${copy.meta.versionName || "CV"} (copy)`;
    const meta: CVVersionMeta = {
      id,
      name: copy.meta.versionName,
      updatedAt: new Date().toISOString(),
    };
    const versions = readVersions();
    versions.push(meta);
    writeVersions(versions);
    localStorage.setItem(versionKey(id), JSON.stringify(copy));
    localStorage.setItem(ACTIVE_KEY, id);
    return meta;
  },

  deleteVersion(versionId) {
    if (typeof window === "undefined") return;
    const versions = readVersions().filter((v) => v.id !== versionId);
    localStorage.removeItem(versionKey(versionId));
    if (versions.length === 0) {
      writeVersions([]);
      this.createVersion("Untitled");
      return;
    }
    writeVersions(versions);
    const active = this.getActiveVersionId();
    if (active === versionId) {
      this.setActiveVersionId(versions[0].id);
    }
  },

  getSkillLibrary() {
    if (typeof window === "undefined") return createDefaultSkillLibrary();
    return ensureSkillLibrary();
  },

  setSkillLibrary(lib) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SKILL_LIB_KEY, JSON.stringify(lib));
  },

  exportJson(versionId) {
    const cv = this.getCv(versionId);
    if (!cv) return "{}";
    const bundle = { cv, skillLibrary: this.getSkillLibrary() };
    return JSON.stringify(bundle, null, 2);
  },

  importJson(json) {
    const parsed = safeParseJson<unknown>(json);
    if (!parsed || typeof parsed !== "object") return null;
    const asBundle = cvExportBundleSchema.safeParse(parsed);
    if (asBundle.success) {
      const incomingLib = asBundle.data.skillLibrary;
      let skillLibrary: SkillLibrary | undefined;
      if (incomingLib) {
        const base = createDefaultSkillLibrary();
        for (const [key, cat] of Object.entries(incomingLib)) {
          const id = skillCategoryIdSchema.safeParse(key);
          if (id.success) {
            base[id.data as SkillCategoryId] = {
              label: cat.label || base[id.data].label,
              tags: [...new Set((cat.tags || []).map(String))],
            };
          }
        }
        skillLibrary = base;
      }
      return { cv: asBundle.data.cv, skillLibrary };
    }
    const asCv = cvDataSchema.safeParse(parsed);
    if (asCv.success) return { cv: asCv.data };
    return null;
  },
};
