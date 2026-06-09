import { DOMAINS } from './domains';
import { ERROR_TAGS } from './seed';
import { SPECIAL_ERROR_CODES } from './types';
import type { CatalogStatus, Domain, ErrorTag, Grade, Subdomain } from './types';

const DOMAIN_BY_CODE = new Map<string, Domain>(DOMAINS.map((d) => [d.code, d]));
const SUBDOMAIN_BY_CODE = new Map<string, Subdomain>(
  DOMAINS.flatMap((d) => d.subdomains).map((s) => [s.code, s]),
);
const TAG_BY_CODE = new Map<string, ErrorTag>(ERROR_TAGS.map((t) => [t.code, t]));

const SPECIAL_NAMES: Record<string, string> = {
  CORRECT: 'Respuesta correcta',
  UNCLASSIFIED: 'Sin clasificar',
  IRRELEVANT_INPUT: 'Respuesta irrelevante',
  EMPTY_RESPONSE: 'Respuesta vacía',
};

export function getDomain(code: string): Domain | undefined {
  return DOMAIN_BY_CODE.get(code);
}

export function getSubdomain(code: string): Subdomain | undefined {
  return SUBDOMAIN_BY_CODE.get(code);
}

export function getErrorTag(code: string): ErrorTag | undefined {
  return TAG_BY_CODE.get(code);
}

/** Domain that owns an error tag (by tag or by code). */
export function getDomainOf(errorOrCode: ErrorTag | string): Domain | undefined {
  const code = typeof errorOrCode === 'string' ? errorOrCode : errorOrCode.domain_code;
  const tag = typeof errorOrCode === 'string' ? TAG_BY_CODE.get(errorOrCode) : errorOrCode;
  return DOMAIN_BY_CODE.get(tag?.domain_code ?? code);
}

export function isDeprecated(code: string): boolean {
  return TAG_BY_CODE.get(code)?.status === 'DEPRECATED';
}

/** Friendly es-CL name for any code (error tag, special, or unknown). */
export function formatHumanName(code: string): string {
  if (code in SPECIAL_NAMES) return SPECIAL_NAMES[code];
  const tag = TAG_BY_CODE.get(code);
  if (tag) return tag.name_es;
  return code
    .replace(/_G\d+$/i, '')
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function errorTagsByDomain(domainCode: string): ErrorTag[] {
  return ERROR_TAGS.filter((t) => t.domain_code === domainCode);
}

export function errorTagsForGrade(grade: Grade): ErrorTag[] {
  return ERROR_TAGS.filter((t) => t.applicable_grades.includes(grade));
}

export function activeErrorTags(): ErrorTag[] {
  return ERROR_TAGS.filter((t) => t.status === 'ACTIVE');
}

export interface SearchOptions {
  status?: CatalogStatus;
  domainCode?: string;
  grade?: Grade;
  limit?: number;
}

/** Fuzzy-ish substring search over code / name / description (typeahead). */
export function searchErrorTags(query: string, opts: SearchOptions = {}): ErrorTag[] {
  const q = query.trim().toLowerCase();
  const results = ERROR_TAGS.filter((t) => {
    if (opts.status && t.status !== opts.status) return false;
    if (opts.domainCode && t.domain_code !== opts.domainCode) return false;
    if (opts.grade && !t.applicable_grades.includes(opts.grade)) return false;
    if (!q) return true;
    return (
      t.code.toLowerCase().includes(q) ||
      t.name_es.toLowerCase().includes(q) ||
      t.name_en.toLowerCase().includes(q) ||
      t.description_es.toLowerCase().includes(q)
    );
  });
  return opts.limit ? results.slice(0, opts.limit) : results;
}

export const SPECIAL_CODES = SPECIAL_ERROR_CODES;
