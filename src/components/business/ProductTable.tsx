"use client";

import { format } from "date-fns";

export type ProductTableRow = {
  id: string;
  name: string;
  price: string;
  inventory: number;
  createdAt: string;
};

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
