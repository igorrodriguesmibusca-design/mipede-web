import { describe, expect, it } from "vitest";

import {
  canSelectOption,
  complementRuleSummary,
  groupHasEnoughOptions,
  lineTotalCents,
  nextSelection,
  unitPriceCents,
  validateComplementRules,
} from "./complement-rules";

describe("regras de grupos de complementos", () => {
  it("aceita grupo opcional com mínimo 0 e máximo 2", () => {
    expect(validateComplementRules({ required: false, minSelect: 0, maxSelect: 2 })).toBeNull();
    expect(complementRuleSummary(false, 0, 2)).toBe("Opcional • mínimo 0 • máximo 2");
  });

  it("rejeita máximo menor que mínimo", () => {
    expect(validateComplementRules({ required: false, minSelect: 2, maxSelect: 1 })?.field).toBe("maxSelect");
  });

  it("rejeita grupo obrigatório com mínimo 0", () => {
    expect(validateComplementRules({ required: true, minSelect: 0, maxSelect: 1 })?.message).toMatch(/mínimo 1/);
  });

  it("rejeita decimais, vazios e negativos", () => {
    expect(validateComplementRules({ required: false, minSelect: "1.5", maxSelect: 2 })).not.toBeNull();
    expect(validateComplementRules({ required: false, minSelect: "", maxSelect: 2 })).not.toBeNull();
    expect(validateComplementRules({ required: false, minSelect: -1, maxSelect: 2 })).not.toBeNull();
  });

  it("bloqueia terceira seleção quando o máximo é 2", () => {
    const first = nextSelection([], "a", 2);
    const second = nextSelection(first, "b", 2);
    const third = nextSelection(second, "c", 2);
    expect(second).toEqual(["a", "b"]);
    expect(third).toEqual(["a", "b"]);
    expect(canSelectOption(2, 2, false)).toBe(false);
  });

  it("permite remover uma opção e escolher outra", () => {
    const removed = nextSelection(["a", "b"], "a", 2);
    expect(nextSelection(removed, "c", 2)).toEqual(["b", "c"]);
  });

  it("usa seleção exclusiva quando o máximo é 1", () => {
    expect(nextSelection(["a"], "b", 1)).toEqual(["b"]);
  });

  it("calcula total em centavos com complemento e quantidade", () => {
    expect(unitPriceCents(1990, [200, 300])).toBe(2490);
    expect(lineTotalCents(2490, 2)).toBe(4980);
  });

  it("impede vincular grupo sem opções suficientes", () => {
    expect(groupHasEnoughOptions(2, 1)).toBe(false);
    expect(groupHasEnoughOptions(0, 0)).toBe(true);
  });
});
