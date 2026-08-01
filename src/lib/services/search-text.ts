type SearchTextInput = {
  name: string;
  description: string;
  categoryName: string;
  tags: string[];
  pros: string[];
};

export function buildSearchText(input: SearchTextInput): string {
  return [
    input.name,
    input.description,
    `Category: ${input.categoryName}`,
    `Tags: ${input.tags.join(", ")}`,
    `Pros: ${input.pros.join("; ")}`,
    `Use for: ${[...input.tags, input.categoryName].join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
