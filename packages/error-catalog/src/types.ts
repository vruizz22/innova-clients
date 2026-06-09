// SuperProfes error catalog — v8 hierarchical taxonomy (ADR-110/113).
// IDs are stable: <DOMAIN>_<SUBDOMAIN>_<ERROR>_<GRADE_HINT>. Never renamed.

export const GRADES = [
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6',
  'G7', 'G8', 'G9', 'G10', 'G11', 'G12',
] as const;
export type Grade = (typeof GRADES)[number];

export interface GradeBand {
  code: string;
  name_es: string;
  short_es: string;
  grades: Grade[];
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';
export type CatalogSource = 'CURATED' | 'LLM_GENERATED' | 'FIELD_REPORTED';
export type CatalogStatus = 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ExerciseSource = 'SYSTEM' | 'TEACHER_AUTHORED' | 'LLM_GENERATED';

export interface Subdomain {
  code: string;
  domain_code: string;
  name_es: string;
  name_en: string;
}

export interface Domain {
  code: string;
  name_es: string;
  name_en: string;
  display_order: number;
  grades: Grade[];
  subdomains: Subdomain[];
}

export interface ErrorTag {
  code: string;
  domain_code: string;
  subdomain_code: string;
  name_es: string;
  name_en: string;
  description_es: string;
  detection_pattern?: string;
  example_problem?: string;
  example_canonical?: string;
  example_student_answer?: string;
  applicable_grades: Grade[];
  oa_codes: string[];
  prerequisites: string[];
  severity: Severity;
  source: CatalogSource;
  status: CatalogStatus;
  created_at: string;
  deprecated_by?: string | null;
  notes?: string;
}

export const SPECIAL_ERROR_CODES = [
  'CORRECT',
  'UNCLASSIFIED',
  'IRRELEVANT_INPUT',
  'EMPTY_RESPONSE',
] as const;
export type SpecialErrorCode = (typeof SPECIAL_ERROR_CODES)[number];
