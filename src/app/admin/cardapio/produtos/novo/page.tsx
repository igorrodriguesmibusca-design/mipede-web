import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { ProductForm } from "@/components/admin/product-form";
import { routes } from "@/lib/routes";

export default function NewProductPage() {
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
        description="Cadastro visual demonstrativo. Nenhum dado é persistido."
      />
      <ProductForm />
    </div>
  );
}
