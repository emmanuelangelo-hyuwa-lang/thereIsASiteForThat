import { z } from "zod";

export const searchRequestSchema = z.object({
  query: z.string().trim().min(2).max(200),
  limit: z.number().int().min(1).max(20).optional().default(8),
  /** Let the model look for sites outside the catalog. Costs a call, so opt-in. */
  discover: z.boolean().optional().default(false),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;
