"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/Button";

export type ProductTableRow = {
  id: string;
  name: string;
  priceLabel: string;
  price: string;
  inventory: number;
  createdAt: string;
};

export type ProductTableProps = {
  products: ProductTableRow[];
};

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Could not delete product");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-charcoal/10 bg-white p-6 text-sm text-charcoal/60 shadow-sm">
        No products yet. Add your first product to appear on the marketplace.
type ProductTableProps = {
  products: ProductTableRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  busyId?: string | null;
};

export function ProductTable({
  products,
  onEdit,
  onDelete,
  busyId,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-charcoal/20 bg-cream/40 px-4 py-8 text-center text-sm text-charcoal/70">
        No products yet. Add your first listing above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 bg-cream/80 text-charcoal/70">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Inventory</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const created = new Date(p.createdAt);
              return (
                <tr
                  key={p.id}
                  className="border-b border-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-charcoal/85">{p.priceLabel}</td>
                  <td className="px-4 py-3 text-charcoal/85">{p.inventory}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {format(created, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/business/products/${p.id}/edit`}
                        className="inline-flex min-h-9 items-center rounded-lg border border-charcoal/25 bg-cream px-3 text-xs font-semibold text-charcoal hover:bg-charcoal/5"
                      >
                        Edit
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-9 px-3 text-xs"
                        onClick={() => void onDelete(p.id)}
                        isLoading={deletingId === p.id}
                        disabled={deletingId !== null}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white shadow-sm">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-charcoal/10 bg-cream/60">
            <th className="px-4 py-3 font-semibold text-charcoal">Name</th>
            <th className="px-4 py-3 font-semibold text-charcoal">Price</th>
            <th className="px-4 py-3 font-semibold text-charcoal">Inventory</th>
            <th className="px-4 py-3 font-semibold text-charcoal">Created</th>
            <th className="px-4 py-3 text-right font-semibold text-charcoal">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const created = format(new Date(p.createdAt), "MMM d, yyyy");
            const busy = busyId === p.id;
            return (
              <tr
                key={p.id}
                className="border-b border-charcoal/5 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-charcoal">{p.name}</td>
                <td className="px-4 py-3 tabular-nums text-charcoal/90">
                  ${Number(p.price).toFixed(2)}
                </td>
                <td className="px-4 py-3 tabular-nums text-charcoal/90">
                  {p.inventory}
                </td>
                <td className="px-4 py-3 text-charcoal/75">{created}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(p.id)}
                      className="rounded-md px-2 py-1 text-maple hover:underline disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (
                          typeof window !== "undefined" &&
                          window.confirm(
                            `Delete “${p.name}”? This cannot be undone.`,
                          )
                        ) {
                          onDelete(p.id);
                        }
                      }}
                      className="rounded-md px-2 py-1 text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
