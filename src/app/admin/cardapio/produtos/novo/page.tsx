"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { LiveProductForm } from "@/components/admin/live-product-form";
import { PageHeading } from "@/components/admin/page-heading";
import { ProductForm } from "@/components/admin/product-form";
import { routes } from "@/lib/routes";
import { useTenant } from "@/lib/tenant-context";

export default function NewProductPage() {
  const tenant = useTenant();
  return (
    <div>
      <Link
        href={routes.admin.products}
        className="mb-3 inline-flex items-center gap-1 text-sm text-subtle"
      >
        <ChevronLeft className="size-4" />
        Voltar para produtos
      </Link>
      <PageHeading
        title="Novo produto"
        description={tenant.mode === "live" ? "Cadastre um item do cardápio da sua loja." : "Cadastro visual demonstrativo. Nenhum dado é persistido."}
      />
      {tenant.mode === "live" ? <LiveProductForm /> : <ProductForm />}
    </div>
  );
}
