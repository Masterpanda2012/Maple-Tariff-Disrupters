"use client";

import { useRouter } from "next/navigation";

import { ProductForm } from "~/components/business/ProductForm";

export function CreateProductFormClient() {
  const router = useRouter();
  return (
    <ProductForm
      mode="create"
      onSuccess={() => router.push("/business/products")}
      onCancel={() => router.push("/business/products")}
    />
  );
}
