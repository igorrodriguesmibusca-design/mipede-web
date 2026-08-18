"use client";

import { useState } from "react";

import { ComplementRanking } from "@/components/admin/complement-ranking";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";
import { PageHeading } from "@/components/admin/page-heading";
import { PerformanceTabs } from "@/components/admin/performance-tabs";
import { PeriodSelector } from "@/components/admin/period-selector";
import { ProductRanking } from "@/components/admin/product-ranking";
import {
  complementPerformance,
  funnelByPeriod,
  type PeriodKey,
  productPerformance,
} from "@/data/mock-analytics";

export default function MenuPerformancePage() {
  const [period, setPeriod] = useState<PeriodKey>("7d");

  return (
    <div>
      <PageHeading
        title="Desempenho do Cardápio"
        description="Funil de conversão e ranking dos itens mais e menos vendidos"
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PerformanceTabs />
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>
      <div className="space-y-5">
        <ConversionFunnel steps={funnelByPeriod[period].steps} />
        <ProductRanking items={productPerformance[period]} />
        <ComplementRanking items={complementPerformance[period]} />
      </div>
    </div>
  );
}
