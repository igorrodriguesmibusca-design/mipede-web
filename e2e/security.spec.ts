import { expect, test } from "@playwright/test";

test("cadastro valida campos obrigatórios", async ({ page }) => {
  await page.goto("/cadastro/restaurante");
  await expect(page.getByRole("heading", { name: "Cadastrar restaurante" })).toBeVisible();
  await page.getByRole("button", { name: "Criar cadastro" }).click();
  await expect(page.locator("input[name='name']")).toBeVisible();
});

test("login e recuperação de senha existem", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await page.goto("/esqueci-minha-senha");
  await expect(page.getByRole("heading", { name: "Esqueci minha senha" })).toBeVisible();
});

test("plataforma sem sessão não mostra estabelecimentos", async ({ page }) => {
  await page.goto("/plataforma/estabelecimentos");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByText("Estabelecimentos")).toHaveCount(0);
});

test("painel demo não grava token no localStorage", async ({ page }) => {
  await page.goto("/admin/desempenho");
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys.join(",")).not.toMatch(/token|session|better-auth/i);
  await expect(page.getByText("Modo demonstração", { exact: false })).toBeVisible();
});

test("onboarding recusa slug reservado no cliente", async ({ page }) => {
  await page.goto("/onboarding/empresa");
  await page.getByRole("textbox").nth(0).fill("Loja Teste");
  await page.locator("input").last().fill("admin");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Este slug não pode ser usado.")).toBeVisible();
});
