"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Disclosure } from "@/components/ui/Disclosure";

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

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
      formElement.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "done") {
    return (
      <div className="slab-accent p-8 sm:p-12">
        <p className="label text-[var(--on-accent)]/75">Received</p>
        <p className="display mt-6 text-[clamp(2rem,6vw,4rem)] text-[var(--on-accent)]">
          In the queue.
        </p>
        <p className="copy mt-6 max-w-md text-[var(--on-accent)]/85">
          A human reads every submission. If it earns a place, it goes in the
          catalog.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn mt-10 h-12 bg-[var(--on-accent)] px-6 text-[var(--accent)] hover:bg-[var(--on-accent)]/85"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Field index={1} label="Site name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          className="field"
          placeholder="ILovePDF"
        />
      </Field>

      <Field index={2} label="Website URL" htmlFor="url">
        <input
          id="url"
          name="url"
          type="url"
          required
          className="field"
          placeholder="https://example.com"
        />
      </Field>

      <Field index={3} label="What does it help people do?" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          minLength={40}
          maxLength={500}
          rows={4}
          className="field resize-none"
          placeholder="Describe the task it solves in plain language (at least ~40 characters)."
        />
      </Field>

      <Field index={4} label="Category" htmlFor="categorySlug">
        <select id="categorySlug" name="categorySlug" required className="field">
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Disclosure summary="Add tags and your email" hint="Optional">
        <div className="space-y-8 pt-2">
          <Field index={5} label="Tags" htmlFor="tags">
            <input
              id="tags"
              name="tags"
              className="field"
              placeholder="compress pdf, merge pdf"
            />
          </Field>

          <Field index={6} label="Your email" htmlFor="submitterEmail">
            <input
              id="submitterEmail"
              name="submitterEmail"
              type="email"
              className="field"
              placeholder="you@example.com"
            />
          </Field>
        </div>
      </Disclosure>

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? (
        <p className="label" style={{ color: "#ff5c1a" }}>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="btn btn-accent h-14 px-8"
      >
        {status === "saving" ? "Sending" : "Submit for review"}
      </button>
    </form>
  );
}

function Field({
  index,
  label,
  htmlFor,
  children,
}: {
  index: number;
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline gap-3">
        <span className="numeral text-sm text-[var(--muted)]">
          {String(index).padStart(2, "0")}
        </span>
        <span className="label text-[var(--ink)]">{label}</span>
      </label>
      <div className="mt-3">{children}</div>
    </div>
  );
}
