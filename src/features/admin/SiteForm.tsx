import type { SiteFormInput } from "@/lib/validators/site";

type CategoryOption = {
  id: string;
  name: string;
};

type SiteFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: CategoryOption[];
  siteId?: string;
  initial?: Partial<SiteFormInput>;
  submitLabel: string;
};

export function SiteForm({
  action,
  categories,
  siteId,
  initial,
  submitLabel,
}: SiteFormProps) {
  return (
    <form action={action} className="space-y-5">
      {siteId ? <input type="hidden" name="id" value={siteId} /> : null}

      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="slug">
        <input
          id="slug"
          name="slug"
          defaultValue={initial?.slug ?? ""}
          placeholder="auto from name if blank"
          className={inputClass}
        />
      </Field>

      <Field label="URL" htmlFor="url">
        <input
          id="url"
          name="url"
          type="url"
          required
          defaultValue={initial?.url ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={initial?.description ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Category" htmlFor="categoryId">
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initial?.categoryId ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pricing" htmlFor="pricing">
          <select
            id="pricing"
            name="pricing"
            defaultValue={initial?.pricing ?? "freemium"}
            className={inputClass}
          >
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
            <option value="free_trial">Free trial</option>
          </select>
        </Field>

        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>

      <Field label="Rating (1 to 5)" htmlFor="rating">
        <input
          id="rating"
          name="rating"
          type="number"
          min={1}
          max={5}
          step={0.1}
          required
          defaultValue={initial?.rating ?? 4.5}
          className={inputClass}
        />
      </Field>

      <Field label="Tags (comma-separated)" htmlFor="tags">
        <input
          id="tags"
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Pros (one per line)" htmlFor="pros">
        <textarea
          id="pros"
          name="pros"
          rows={4}
          required
          defaultValue={initial?.pros?.join("\n") ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Cons (one per line)" htmlFor="cons">
        <textarea
          id="cons"
          name="cons"
          rows={3}
          required
          defaultValue={initial?.cons?.join("\n") ?? ""}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        className="rounded-[var(--r-s)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "mt-2 w-full rounded-[var(--r-s)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--ink)] outline-none focus:shadow-[inset_0_0_0_2px_var(--accent)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      {children}
    </div>
  );
}
