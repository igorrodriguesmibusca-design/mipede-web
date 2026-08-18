import { expect, test } from "@playwright/test";

test("botão Google visível e senha escondida no login", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Acesse sua conta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
  await expect(page.locator("input[name='password']")).toHaveCount(0);
  await expect(page.getByText("O acesso com e-mail e senha estará disponível futuramente.")).toBeVisible();
});

test("cadastro exige aceite e não mostra senha", async ({ page }) => {
  await page.goto("/cadastro/restaurante");
  await expect(page.getByRole("heading", { name: "Crie sua conta de restaurante" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
  await expect(page.locator("input[name='password']")).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar com Google" }).click();
  await expect(page.locator("input[name='acceptTerms']")).toBeVisible();
});

test("recuperação de senha fica indisponível", async ({ page }) => {
  await page.goto("/esqueci-minha-senha");
  await expect(page.getByText("O acesso com e-mail e senha estará disponível futuramente.")).toBeVisible();
});

test("plataforma sem sessão não mostra estabelecimentos", async ({ page }) => {
  await page.goto("/plataforma/estabelecimentos");
  await expect(page.getByRole("heading", { name: "Acesse sua conta" })).toBeVisible();
  await expect(page.getByText("Estabelecimentos")).toHaveCount(0);
});

test("painel demo não grava token no localStorage", async ({ page }) => {
  await page.goto("/admin/desempenho");
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys.join(",")).not.toMatch(/token|session|better-auth|google|id_token|access_token/i);
  await expect(page.getByText("Modo demonstração", { exact: false })).toBeVisible();
});

test("onboarding recusa slug reservado no cliente", async ({ page }) => {
  await page.goto("/onboarding/empresa");
  await page.getByRole("textbox").nth(0).fill("Loja Teste");
  await page.locator("input").last().fill("admin");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Este slug não pode ser usado.")).toBeVisible();
});
