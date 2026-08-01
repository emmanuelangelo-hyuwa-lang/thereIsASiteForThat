"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type CategoryOption = {
  slug: string;
  name: string;
};

type SubmitFormProps = {
  categories: CategoryOption[];
};

export function SubmitForm({ categories }: SubmitFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      url: String(form.get("url") ?? ""),
      description: String(form.get("description") ?? ""),
      categorySlug: String(form.get("categorySlug") ?? ""),
      tags: String(form.get("tags") ?? ""),
      submitterEmail: String(form.get("submitterEmail") ?? ""),
      website: String(form.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as {
        success: boolean;
        error: string | null;
      };
      if (!json.success) {
        throw new Error(json.error ?? "Submission failed");
      }
      setStatus("done");
      event.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <Field label="Site name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          className={inputClass}
          placeholder="ILovePDF"
        />
      </Field>

      <Field label="Website URL" htmlFor="url">
        <input
          id="url"
          name="url"
          type="url"
          required
          className={inputClass}
          placeholder="https://example.com"
        />
      </Field>

      <Field label="What does it help people do?" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          minLength={40}
          maxLength={500}
          rows={4}
          className={inputClass}
          placeholder="Describe the task it solves in plain language (at least ~40 characters)."
        />
      </Field>

      <Field label="Category" htmlFor="categorySlug">
        <select id="categorySlug" name="categorySlug" required className={inputClass}>
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tags (comma-separated)" htmlFor="tags">
        <input
          id="tags"
          name="tags"
          className={inputClass}
          placeholder="compress pdf, merge pdf"
        />
      </Field>

      <Field label="Your email (optional)" htmlFor="submitterEmail">
        <input
          id="submitterEmail"
          name="submitterEmail"
          type="email"
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {status === "done" ? (
        <p className="text-sm text-[var(--accent)]">
          Thanks — your submission is in the moderation queue.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
      >
        {status === "saving" ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]/55";
