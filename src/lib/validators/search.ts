import { z } from "zod";

export const searchRequestSchema = z.object({
  query: z.string().trim().min(2).max(200),
  limit: z.number().int().min(1).max(20).optional().default(8),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;
