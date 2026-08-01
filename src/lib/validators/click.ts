import { z } from "zod";

export const clickRequestSchema = z.object({
  siteId: z.string().uuid(),
  query: z.string().trim().max(200).optional().nullable(),
  source: z.enum(["search", "detail", "collection", "ai_inferred"]),
  confidence: z.number().min(0).max(1).optional().nullable(),
});

export type ClickRequest = z.infer<typeof clickRequestSchema>;
