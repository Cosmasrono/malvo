"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { buttonStyles } from "@/components/ui";
import { assignableCategories, productIconKeys } from "@/lib/products";

export type Draft = {
  name: string;
  description: string;
  category: string;
  icon: string;
  image: string;
  badge: string;
  published: boolean;
  sortOrder: number;
};

const fieldStyles =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100";
const labelStyles = "block text-xs font-semibold uppercase tracking-wider text-ink-500";

interface ProductFormProps {
  draft: Draft;
  isEditing: boolean;
  busy: boolean;
  onChange: (draft: Draft) => void;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  onUploadError: (message: string) => void;
}

/** Create/edit form. Photo uploads go straight to the database via /api/admin/upload. */
export function ProductForm({
  draft,
  isEditing,
  busy,
  onChange,
  onSubmit,
  onCancel,
  onUploadError,
}: ProductFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    onChange({ ...draft, [key]: value });
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        onUploadError(data.error ?? "Could not upload that image.");
        return;
      }
      update("image", data.url);
    } catch {
      onUploadError("Network problem — the image was not uploaded.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:grid-cols-2"
    >
      <h2 className="text-lg font-bold tracking-tight text-ink-900 sm:col-span-2">
        {isEditing ? "Edit product" : "New product"}
      </h2>

      <div className="sm:col-span-2">
        <label className={labelStyles} htmlFor="product-name">Name</label>
        <input
          id="product-name"
          className={`${fieldStyles} mt-2`}
          value={draft.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="e.g. 200L Twin-Cylinder Air Compressor"
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelStyles} htmlFor="product-description">Description</label>
        <textarea
          id="product-description"
          rows={4}
          className={`${fieldStyles} mt-2 resize-y`}
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Specs, sizes and what the machine is used for."
          required
        />
      </div>

      <div>
        <label className={labelStyles} htmlFor="product-category">Category</label>
        <select
          id="product-category"
          className={`${fieldStyles} mt-2`}
          value={draft.category}
          onChange={(event) => update("category", event.target.value)}
        >
          {assignableCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelStyles} htmlFor="product-icon">Fallback icon</label>
        <select
          id="product-icon"
          className={`${fieldStyles} mt-2`}
          value={draft.icon}
          onChange={(event) => update("icon", event.target.value)}
        >
          {productIconKeys.map((icon) => (
            <option key={icon} value={icon}>{icon.replace("Icon", "")}</option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-ink-400">Shown on the card when there is no photo.</p>
      </div>

      <div className="sm:col-span-2">
        <label className={labelStyles} htmlFor="product-image">Photo</label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className={buttonStyles.outline}
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>

          {draft.image ? (
            <>
              <span className="relative size-14 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
                <Image src={draft.image} alt="" fill sizes="56px" className="object-cover" unoptimized />
              </span>
              <button
                type="button"
                onClick={() => update("image", "")}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove photo
              </button>
            </>
          ) : null}
        </div>

        <input
          id="product-image"
          className={`${fieldStyles} mt-3`}
          value={draft.image}
          onChange={(event) => update("image", event.target.value)}
          placeholder="/products/photo.jpg or an https:// image URL"
        />
        <p className="mt-1.5 text-xs text-ink-400">
          Max 4MB — JPEG, PNG, WebP or AVIF. Leave blank to show the icon instead.
        </p>
      </div>

      <div>
        <label className={labelStyles} htmlFor="product-badge">Badge (optional)</label>
        <input
          id="product-badge"
          className={`${fieldStyles} mt-2`}
          value={draft.badge}
          onChange={(event) => update("badge", event.target.value)}
          placeholder="e.g. In stock, New arrival"
        />
      </div>

      <div>
        <label className={labelStyles} htmlFor="product-order">Sort order</label>
        <input
          id="product-order"
          type="number"
          className={`${fieldStyles} mt-2`}
          value={draft.sortOrder}
          onChange={(event) => update("sortOrder", Number(event.target.value))}
        />
        <p className="mt-1.5 text-xs text-ink-400">Lower numbers appear first.</p>
      </div>

      <label className="inline-flex items-center gap-3 text-sm font-medium text-ink-700 sm:col-span-2">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(event) => update("published", event.target.checked)}
          className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
        />
        Show this product on the public shop
      </label>

      <div className="flex flex-wrap gap-3 border-t border-ink-100 pt-5 sm:col-span-2">
        <button type="submit" disabled={busy || uploading} className={buttonStyles.primary}>
          {busy ? "Saving…" : isEditing ? "Save changes" : "Add product"}
        </button>
        <button type="button" onClick={onCancel} className={buttonStyles.outline}>
          Cancel
        </button>
      </div>
    </form>
  );
}
