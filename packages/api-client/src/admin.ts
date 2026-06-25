import { z } from 'zod';

/**
 * Admin error-tag catalog (ADMIN role only). Mirrors the backend
 * `/admin/error-tags` surface: a keyset-paginated view over the LIVE catalog
 * (the backend is the source of truth and the catalog grows continuously), plus
 * promote/deprecate mutations.
 */

export const errorTagStatusSchema = z.enum(['ACTIVE', 'DRAFT', 'DEPRECATED']);
export const errorTagSourceSchema = z.enum(['CURATED', 'LLM_GENERATED', 'FIELD_REPORTED']);
export const errorTagSeveritySchema = z.enum(['LOW', 'MED', 'HIGH', 'CRITICAL']);

export const adminErrorTagSchema = z.object({
  code: z.string(),
  /** Curated es-CL name; may be "" for a freshly imported tag. */
  name: z.string(),
  /** Backend SHORT domain code (e.g. ARITH); null if unassigned. */
  domainCode: z.string().nullable(),
  /** Domain display name (es-CL) straight from the backend — no local lookup. */
  domainName: z.string().nullable(),
  subdomainCode: z.string().nullable(),
  source: errorTagSourceSchema,
  status: errorTagStatusSchema,
  severity: errorTagSeveritySchema,
  applicableGrades: z.array(z.number()),
  diagnosticHint: z.string().nullable(),
});

export const adminErrorTagDomainFacetSchema = z.object({
  code: z.string(),
  name: z.string(),
  count: z.number(),
});

export const adminErrorTagListSchema = z.object({
  items: z.array(adminErrorTagSchema),
  /** Pass back as `cursor` to fetch the next page; null when exhausted. */
  nextCursor: z.string().nullable(),
  /** Count matching the active filters. */
  total: z.number(),
  /** Global status tallies (unfiltered) for the header. */
  statusCounts: z.object({
    active: z.number(),
    draft: z.number(),
    deprecated: z.number(),
  }),
  /** Global domain facet (code + es-CL name + tag count) for the filter. */
  domains: z.array(adminErrorTagDomainFacetSchema),
});

export type AdminErrorTag = z.infer<typeof adminErrorTagSchema>;
export type AdminErrorTagList = z.infer<typeof adminErrorTagListSchema>;
export type AdminErrorTagDomainFacet = z.infer<typeof adminErrorTagDomainFacetSchema>;
export type AdminErrorTagStatus = z.infer<typeof errorTagStatusSchema>;
export type AdminErrorTagSource = z.infer<typeof errorTagSourceSchema>;

// ─── admin/status — pipeline health snapshot ──────────────────────────────────

export const queueStatusSchema = z.object({
  depth: z.number(),
  dlqDepth: z.number(),
  processedLastHour: z.number(),
});

export const costByModelSchema = z.object({
  model: z.string(),
  calls: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  costUsd: z.number(),
});

export const adminStatusSchema = z.object({
  queues: z.record(z.string(), queueStatusSchema),
  pipeline: z.object({
    attemptsLastHour: z.number(),
    submissionsLastHour: z.number(),
    classifiedLastHour: z.number(),
    pendingGuides: z.number(),
  }),
  cost: z.object({
    todayUsd: z.number(),
    monthUsd: z.number(),
    byModel: z.array(costByModelSchema),
  }),
  killswitches: z.record(z.string(), z.boolean()),
});

export type AdminStatus = z.infer<typeof adminStatusSchema>;
export type QueueStatus = z.infer<typeof queueStatusSchema>;
export type CostByModel = z.infer<typeof costByModelSchema>;

// ─── admin/status/killswitches — toggle result ────────────────────────────────

export const killswitchToggleResultSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
});

export type KillswitchToggleResult = z.infer<typeof killswitchToggleResultSchema>;
