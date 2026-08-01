import { chatCompletion } from "@/lib/ai/chat";

type SummaryCandidate = {
  name: string;
  description: string;
  pricing: string;
  confidencePercent: number;
};

export async function summarizeSearchResults(input: {
  query: string;
  results: SummaryCandidate[];
  mode: "soft" | "empty";
}): Promise<string | null> {
  if (input.results.length === 0 && input.mode === "empty") {
    return "No strong catalog match. Try a simpler task phrase, or browse categories.";
  }

  const candidates = input.results.slice(0, 6).map((result, index) => ({
    rank: index + 1,
    name: result.name,
    description: result.description,
    pricing: result.pricing,
    confidencePercent: result.confidencePercent,
  }));

  try {
    const content = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You help users pick websites for a task. Only use the provided candidates. " +
            "Be concise (1–2 sentences). Never invent sites. Prefer free/freemium when quality is equal. " +
            "If matches are weak, say so clearly.",
        },
        {
          role: "user",
          content: JSON.stringify({
            query: input.query,
            mode: input.mode,
            candidates,
          }),
        },
      ],
      { temperature: 0.2 },
    );
    return content;
  } catch (error) {
    console.error("AI summary failed:", error);
    return null;
  }
}
