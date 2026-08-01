import { z } from "zod";

export const submissionFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  url: z.string().trim().url().max(300),
  description: z.string().trim().min(40).max(500),
  categorySlug: z.string().trim().min(2).max(80),
  tags: z.string().trim().max(200).optional().default(""),
  submitterEmail: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default("")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Invalid email",
    }),
  website: z.string().max(0).optional().default(""), // honeypot
});

export type SubmissionFormInput = z.infer<typeof submissionFormSchema>;
