import { z } from "zod";

export const pricingSchema = z.enum(["free", "freemium", "paid", "free_trial"]);
export const siteStatusSchema = z.enum(["draft", "published", "archived"]);

export const siteFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  url: z.string().trim().url(),
  description: z.string().trim().min(20).max(500),
  categoryId: z.string().uuid(),
  pricing: pricingSchema,
  pros: z.array(z.string().trim().min(2)).min(1).max(8),
  cons: z.array(z.string().trim().min(2)).min(1).max(8),
  rating: z.number().min(1).max(5),
  tags: z.array(z.string().trim().min(1)).min(1).max(12),
  status: siteStatusSchema,
});

export type SiteFormInput = z.infer<typeof siteFormSchema>;
