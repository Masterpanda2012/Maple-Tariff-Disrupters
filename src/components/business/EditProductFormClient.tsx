"use client";

import { useRouter } from "next/navigation";

import {
  ProductForm,
  type ProductFormInitial,
} from "~/components/business/ProductForm";

type EditProductFormClientProps = {
  productId: string;
  initial: ProductFormInitial;
};

export function EditProductFormClient({
  productId,
  initial,
}: EditProductFormClientProps) {
  const router = useRouter();
  return (
    <ProductForm
      mode="edit"
      productId={productId}
      initial={initial}
      onSuccess={() => router.push("/business/products")}
      onCancel={() => router.push("/business/products")}
    />
  );
}
