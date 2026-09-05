"use client";

import { FormEvent, useState } from "react";
import { formatKsh } from "@/lib/money";

/**
 * Inline price editor on a catalogue row — the fastest way to price a whole
 * shop without opening the full form for every item. Blank saves as
 * "price on request", which is what stops an item being sold online.
 */
export function PriceCell({
  productId,
  price,
  onSaved,
  onError,
}: {
  productId: string;
  price: number | null | undefined;
  onSaved: (price: number | null) => void;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(typeof price === "number" ? String(price) : "");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    const next = trimmed === "" ? null : Number(trimmed);

    if (next !== null && (!Number.isFinite(next) || next < 0)) {
      onError("Enter a price in shillings, or leave it blank for “ask us”.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: next }),
      });
      const data = await response.json();

      if (!response.ok) {
        onError(data.error ?? "Could not save that price.");
        return;
      }

      onSaved(next === null ? null : Math.round(next));
      setEditing(false);
    } catch {
      onError("Network problem — the price was not saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition hover:bg-ink-100 ${
          typeof price === "number" ? "text-ink-900" : "text-amber-700"
        }`}
      >
        {typeof price === "number" ? formatKsh(price) : "Set a price"}
        <span aria-hidden="true" className="text-xs text-ink-400">
          ✎
        </span>
      </button>
    );
  }

  return (
    <form onSubmit={save} className="mt-1 flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`price-${productId}`}>
        Price in shillings
      </label>
      <span className="text-sm font-semibold text-ink-500">KSh</span>
      <input
        id={`price-${productId}`}
        type="number"
        min={0}
        step={1}
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="45000"
        className="w-28 rounded-lg border border-ink-200 px-3 py-1.5 text-sm outline-none focus:border-brand-600"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(typeof price === "number" ? String(price) : "");
          setEditing(false);
        }}
        className="text-xs font-semibold text-ink-500 hover:text-ink-900"
      >
        Cancel
      </button>
    </form>
  );
}
