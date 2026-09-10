import { z } from 'zod';

export const TaakSummarySchema = z.object({
  title: z.string(),
  url: z.string(),
  zaak_uuid: z.string().optional(),
  uuid: z.string(),
  einddatum: z.string(),
  is_open: z.boolean(),
  is_afgerond: z.boolean(),
  is_verwerkt: z.boolean(),
  is_gesloten: z.boolean(),
  laatstBewerktOp: z.string(),
  attachments: z.array(z.object({
    title: z.string(),
    url: z.string(),
  }),
  ).optional().nullable(),
}).loose();
export type TaakSummary = z.infer<typeof TaakSummarySchema>;
export const TaakSummariesSchema = z.array(TaakSummarySchema);

/**
 * Response schema from zaakaggregator for taak summaries
 */
export const TaakSummariesResponseSchema = z.object({
  incompleteResults: z.boolean(),
  results: TaakSummariesSchema,
});

/**
 * Response type from zaakaggregator for taak summaries
 */
export type TaakSummariesResponse = z.infer<typeof TaakSummariesResponseSchema>;
