export type ComplementRuleInput = {
  required: boolean;
  minSelect: unknown;
  maxSelect: unknown;
};

export type ComplementRuleError = {
  field: "minSelect" | "maxSelect" | "required";
  message: string;
};

export function parseCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && /^-?\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

export function validateComplementRules(input: ComplementRuleInput): ComplementRuleError | null {
  const minSelect = parseCount(input.minSelect);
  const maxSelect = parseCount(input.maxSelect);
  if (minSelect == null) return { field: "minSelect", message: "Informe um número inteiro para o mínimo." };
  if (maxSelect == null) return { field: "maxSelect", message: "Informe um número inteiro para o máximo." };
  if (minSelect < 0) return { field: "minSelect", message: "O mínimo não pode ser negativo." };
  if (maxSelect < 1) return { field: "maxSelect", message: "O máximo precisa ser no mínimo 1." };
  if (input.required && minSelect < 1) {
    return { field: "minSelect", message: "Grupo obrigatório precisa de mínimo 1." };
  }
  if (!input.required && minSelect < 0) {
    return { field: "minSelect", message: "O mínimo não pode ser negativo." };
  }
  if (maxSelect < minSelect) {
    return { field: "maxSelect", message: "O máximo não pode ser menor que o mínimo." };
  }
  return null;
}

export function complementRuleSummary(required: boolean, minSelect: number, maxSelect: number): string {
  const kind = required ? "Obrigatório" : "Opcional";
  return `${kind} • mínimo ${minSelect} • máximo ${maxSelect}`;
}

export function complementListSummary(optionCount: number, maxSelect: number): string {
  const options = optionCount === 1 ? "1 opção" : `${optionCount} opções`;
  return `${options} • escolha até ${maxSelect}`;
}

export function groupHasEnoughOptions(minSelect: number, activeOptionCount: number): boolean {
  return activeOptionCount >= minSelect;
}

export function canSelectOption(selectedCount: number, maxSelect: number, alreadySelected: boolean): boolean {
  if (alreadySelected) return true;
  return selectedCount < maxSelect;
}

export function nextSelection(selectedIds: string[], optionId: string, maxSelect: number): string[] {
  if (selectedIds.includes(optionId)) {
    return selectedIds.filter((id) => id !== optionId);
  }
  if (maxSelect === 1) return [optionId];
  if (selectedIds.length >= maxSelect) return selectedIds;
  return [...selectedIds, optionId];
}

export function unitPriceCents(basePriceCents: number, selectedOptionCents: number[]): number {
  return selectedOptionCents.reduce((sum, value) => sum + value, basePriceCents);
}

export function lineTotalCents(unitCents: number, quantity: number): number {
  return unitCents * quantity;
}
