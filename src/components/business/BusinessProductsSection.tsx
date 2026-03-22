"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductTable, type ProductTableRow } from "~/components/business/ProductTable";

type SerializedProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  inventory: number;
  imageUrl: string | null;
  tags: string[];
  createdAt: string;
};

type BusinessProductsSectionProps = {
  products: SerializedProduct[];
};

export function BusinessProductsSection({
  products,
}: BusinessProductsSectionProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows: ProductTableRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    inventory: p.inventory,
    createdAt: p.createdAt,
  }));

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        alert(data.error ?? "Could not delete product.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Products</h1>
          <p className="mt-1 text-sm text-charcoal/70">
            Create and manage listings for the marketplace.
          </p>
        </div>
        <Link
          href="/business/products/new"
          className="rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
        >
          Add new product
        </Link>
      </div>

      <ProductTable
        products={rows}
        busyId={busyId}
        onEdit={(id) => router.push(`/business/products/${id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
