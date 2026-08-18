import { expect, test } from "@playwright/test";

test("tela de banners existe no modo demonstração", async ({ page }) => {
  await page.goto("/admin/marketing/banners");
  await expect(page.getByRole("heading", { name: "Banners do Cardápio" })).toBeVisible();
});

test("configuração da loja demo continua acessível", async ({ page }) => {
  await page.goto("/admin/configuracoes/loja");
  await expect(page.getByRole("heading", { name: /Configuração da Loja/ })).toBeVisible();
});
