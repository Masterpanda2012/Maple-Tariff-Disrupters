"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/Button";
import { useEffect, useState } from "react";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  inventory: string;
  inventory: number;
  imageUrl: string;
  tags: string;
};

export type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
};

function defaultValues(
  initial?: Partial<ProductFormValues>,
): ProductFormValues {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? "",
    inventory: initial?.inventory ?? "0",
    imageUrl: initial?.imageUrl ?? "",
    tags: initial?.tags ?? "",
  };
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function ProductForm({ mode, productId, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(() =>
    defaultValues(initialValues),
const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  inventory: 0,
  imageUrl: "",
  tags: "",
};

function tagsToString(tags: string[]): string {
  return tags.join(", ");
}

export type ProductFormInitial = {
  name: string;
  description: string;
  price: string;
  inventory: number;
  imageUrl: string | null;
  tags: string[];
};

function toFormValues(initial?: ProductFormInitial): ProductFormValues {
  if (!initial) return emptyValues;
  return {
    name: initial.name,
    description: initial.description,
    price: initial.price,
    inventory: initial.inventory,
    imageUrl: initial.imageUrl ?? "",
    tags: tagsToString(initial.tags),
  };
}

export type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initial?: ProductFormInitial;
  onSuccess: () => void;
  onCancel?: () => void;
};

export function ProductForm({
  mode,
  productId,
  initial,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    toFormValues(initial),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function setField<K extends keyof ProductFormValues>(
    key: K,
    v: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(values.price);
    const invNum = Number.parseInt(values.inventory, 10);
    if (!values.name.trim() || !values.description.trim()) {
      setError("Name and description are required.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!Number.isFinite(invNum) || invNum < 0) {
      setError("Inventory must be zero or a positive whole number.");
      return;
    }

    const tags = parseTags(values.tags);
    const imageUrl = values.imageUrl.trim();
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: priceNum,
      inventory: invNum,
      imageUrl: imageUrl.length > 0 ? imageUrl : "",
      tags,
    };

  useEffect(() => {
    setValues(toFormValues(initial));
  }, [initial, mode, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const tagList = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const priceNum = Number(values.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Enter a valid price.");
      return;
    }
    setPending(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Could not create product");
          body: JSON.stringify({
            name: values.name.trim(),
            description: values.description.trim(),
            price: priceNum,
            inventory: values.inventory,
            imageUrl: values.imageUrl.trim() || null,
            tags: tagList,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Could not create product.");
          return;
        }
      } else {
        if (!productId) {
          setError("Missing product id.");
          return;
        }
        const res = await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Could not update product");
        }
      }
      router.push("/business/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
          body: JSON.stringify({
            name: values.name.trim(),
            description: values.description.trim(),
            price: priceNum,
            inventory: values.inventory,
            imageUrl: values.imageUrl.trim() || null,
            tags: tagList,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Could not update product.");
          return;
        }
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-xl flex-col gap-4 rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-charcoal">
        {mode === "create" ? "Add product" : "Edit product"}
      </h1>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Name</span>
        <input
          className="rounded-lg border border-charcoal/20 bg-cream px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          required
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-charcoal">
        {mode === "create" ? "Add product" : "Edit product"}
      </h2>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Name</span>
        <input
          required
          className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Description</span>
        <textarea
          className="min-h-28 rounded-lg border border-charcoal/20 bg-cream px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          required
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Price (CAD)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className="rounded-lg border border-charcoal/20 bg-cream px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
            required
          required
          rows={3}
          className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Price (CAD)</span>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={values.price}
            onChange={(e) =>
              setValues((v) => ({ ...v, price: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Inventory</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className="rounded-lg border border-charcoal/20 bg-cream px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={values.inventory}
            onChange={(e) => setField("inventory", e.target.value)}
            required
            required
            type="number"
            min={0}
            step={1}
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={values.inventory}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                inventory: Number.parseInt(e.target.value, 10) || 0,
              }))
            }
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Image URL (optional)</span>
        <input
          type="url"
          className="rounded-lg border border-charcoal/20 bg-cream px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.imageUrl}
          onChange={(e) => setField("imageUrl", e.target.value)}
          type="text"
          inputMode="url"
          className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.imageUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, imageUrl: e.target.value }))
          }
          placeholder="https://"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Tags</span>
        <input
          className="rounded-lg border border-charcoal/20 bg-cream px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.tags}
          onChange={(e) => setField("tags", e.target.value)}
          placeholder="e.g. automotive, steel, ontario"
        />
        <span className="text-xs text-charcoal/50">
          Comma-separated — used to match tariff and trade news to your
          catalogue.
        </span>
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" isLoading={pending} disabled={pending}>
          {mode === "create" ? "Create product" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/business/products")}
          disabled={pending}
        >
          Cancel
        </Button>
          className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
          value={values.tags}
          onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
          placeholder="comma-separated, e.g. organic, local, apparel"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2 border-t border-charcoal/10 pt-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-charcoal/20 px-4 py-2 text-sm font-medium text-charcoal hover:bg-cream disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
