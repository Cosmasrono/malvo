"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui";
import { ProductForm, type Draft } from "@/components/admin/product-form";
import { assignableCategories, type AdminProduct } from "@/lib/products";
import { PriceCell } from "@/components/admin/price-cell";

const emptyDraft = (sortOrder: number): Draft => ({
  name: "",
  description: "",
  category: assignableCategories[0],
  icon: "ToolIcon",
  image: "",
  badge: "",
  price: "",
  published: true,
  sortOrder,
});

const toDraft = (product: AdminProduct): Draft => ({
  name: product.name,
  description: product.description,
  category: product.category,
  icon: product.icon,
  image: product.image ?? "",
  badge: product.badge ?? "",
  price: typeof product.price === "number" ? String(product.price) : "",
  published: product.published,
  sortOrder: product.sortOrder,
});

/**
 * Full CRUD over the shop catalogue. Every write goes through
 * /api/admin/products, which re-checks admin rights server-side — the UI
 * gating here is convenience only.
 */
export function ProductManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(initialProducts.length));
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sorted = useMemo(
    () =>
      [...products].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    [products],
  );

  const visibleCount = products.filter((product) => product.published).length;
  // Unpriced items cannot be bought online, so surface them for the owner.
  const unpricedCount = products.filter(
    (product) => typeof product.price !== "number",
  ).length;

  function startCreate() {
    setEditingId(null);
    setDraft(emptyDraft(products.length));
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  function startEdit(product: AdminProduct) {
    setEditingId(product.id);
    setDraft(toDraft(product));
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setError("");
  }

  async function save() {
    setBusy(true);
    setError("");

    const payload = {
      ...draft,
      image: draft.image.trim() || null,
      badge: draft.badge.trim() || null,
      price: draft.price.trim() === "" ? null : Number(draft.price),
    };

    try {
      const response = await fetch(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not save the product.");
        return;
      }

      const saved = data.product as AdminProduct;
      setProducts((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? { ...item, ...saved } : item))
          : [...current, saved],
      );
      setNotice(editingId ? "Product updated." : `"${saved.name}" added to the catalogue.`);
      closeForm();
      router.refresh();
    } catch {
      setError("Network problem — the product was not saved.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(product: AdminProduct) {
    const next = !product.published;
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, published: next } : item)),
    );

    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: next }),
    });

    if (!response.ok) {
      // Roll the optimistic flip back so the list matches the database.
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, published: product.published } : item,
        ),
      );
      setError("Could not change visibility. Please try again.");
      return;
    }
    router.refresh();
  }

  async function remove(product: AdminProduct) {
    const confirmed = window.confirm(
      `Remove "${product.name}" from the catalogue? This cannot be undone.`,
    );
    if (!confirmed) return;

    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete that product.");
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    if (editingId === product.id) closeForm();
    setNotice(`"${product.name}" removed.`);
    router.refresh();
  }

  /** Copies the shipped starter catalogue into the database, skipping duplicates. */
  async function importStarter() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-starter" }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }

      const listing = await fetch("/api/admin/products").then((res) => res.json());
      setProducts(listing.products ?? []);
      setNotice(`Imported ${data.imported} product${data.imported === 1 ? "" : "s"}.`);
      router.refresh();
    } catch {
      setError("Network problem — nothing was imported.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
        <div>
          <p className="text-sm font-bold text-ink-900">
            {products.length} product{products.length === 1 ? "" : "s"} in the catalogue
          </p>
          <p className="text-xs text-ink-500">
            {visibleCount} visible on the shop · {products.length - visibleCount} hidden
            {unpricedCount > 0 ? (
              <>
                {" · "}
                <span className="font-semibold text-amber-700">
                  {unpricedCount} without a price
                </span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {products.length === 0 ? (
            <button
              type="button"
              onClick={importStarter}
              disabled={busy}
              className={buttonStyles.outline}
            >
              {busy ? "Importing…" : "Import starter catalogue"}
            </button>
          ) : null}
          <button type="button" onClick={startCreate} className={buttonStyles.primary}>
            Add product
          </button>
        </div>
      </div>

      {notice ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {formOpen ? (
        <ProductForm
          draft={draft}
          isEditing={Boolean(editingId)}
          busy={busy}
          onChange={setDraft}
          onSubmit={save}
          onCancel={closeForm}
          onUploadError={setError}
        />
      ) : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-base font-semibold text-ink-900">No products yet</p>
            <p className="max-w-sm text-sm text-ink-500">
              The shop is currently showing the built-in starter list. Import it to
              take over management from here, or add your own products.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {sorted.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-[10px] font-semibold text-ink-400">
                      No photo
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink-900">{product.name}</p>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      {product.category}
                    </span>
                    {product.published ? null : (
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{product.description}</p>
                  <PriceCell
                    productId={product.id}
                    price={product.price}
                    onSaved={(price) => {
                      setProducts((current) =>
                        current.map((item) =>
                          item.id === product.id ? { ...item, price } : item,
                        ),
                      );
                      setNotice(`Price updated for "${product.name}".`);
                      router.refresh();
                    }}
                    onError={setError}
                  />
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublished(product)}
                    className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-400"
                  >
                    {product.published ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-600 hover:text-brand-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
