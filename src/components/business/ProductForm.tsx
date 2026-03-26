"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  inventory: number;
  imageUrl: string;
  tags: string;
};

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setValues(toFormValues(initial));
  }, [initial, mode, productId]);

  async function compressImageToDataUrl(file: File): Promise<string> {
    const source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Invalid image source"));
          return;
        }
        const img = document.createElement("img");
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not decode image"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
      reader.readAsDataURL(file);
    });

    const MAX_DIMENSION = 1600;
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(source.naturalWidth, source.naturalHeight),
    );
    const width = Math.max(1, Math.round(source.naturalWidth * scale));
    const height = Math.max(1, Math.round(source.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create canvas context");
    }
    ctx.drawImage(source, 0, 0, width, height);

    // Preserve PNG/GIF, otherwise convert to compressed JPEG.
    const mime = /png|gif|webp/i.test(file.type) ? file.type : "image/jpeg";
    const quality = mime === "image/jpeg" ? 0.82 : undefined;
    const dataUrl = canvas.toDataURL(mime, quality);
    return dataUrl;
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2MB or smaller.");
      return;
    }
    setError(null);
    setUploadingImage(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setValues((v) => ({ ...v, imageUrl: dataUrl }));
    } catch {
      setError("Could not process image. Try a different file.");
    } finally {
      setUploadingImage(false);
    }
  }

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
      <div
        className={`rounded-xl border border-dashed p-3 transition-colors ${
          dragActive
            ? "border-maple/60 bg-maple/5"
            : "border-charcoal/20 bg-cream/40"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleImageFile(file);
        }}
      >
        <label className="flex cursor-pointer flex-col gap-2 text-sm">
          <span className="font-medium text-charcoal">Or upload image</span>
          <input
            type="file"
            accept="image/*"
            className="text-sm text-charcoal/70 file:mr-3 file:rounded-lg file:border-0 file:bg-maple file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:brightness-95"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImageFile(file);
            }}
          />
          <span className="text-xs text-charcoal/60">
            Drag & drop or choose a file. JPG, PNG, WEBP or GIF up to 2MB.
            Uploading fills Image URL automatically.
          </span>
        </label>
      </div>
      {values.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={values.imageUrl}
              alt="Product preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40rem"
            />
          </div>
        </div>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-charcoal">Tags</span>
        <input
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
          disabled={pending || uploadingImage}
          className="rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
        >
          {pending || uploadingImage
            ? "Saving…"
            : mode === "create"
              ? "Create"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
