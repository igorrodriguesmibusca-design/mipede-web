import { expect, test } from "@playwright/test";

test("produto inexistente no cardápio público mostra estado amigável", async ({ page }) => {
  await page.goto("/loja/hot-dog-da-casa/produto/00000000-0000-0000-0000-000000000000");
  await expect(page.locator("body")).toContainText(/Produto indisponível|Não foi possível carregar|This page could not be found/i);
});

test("cardápio público existe e produtos são links quando há itens", async ({ page }) => {
  await page.goto("/loja/hot-dog-da-casa");
  await expect(page.getByText("Carregando cardápio...")).toHaveCount(0, { timeout: 15_000 });
  const firstProduct = page.locator("a[href*='/loja/hot-dog-da-casa/produto/']").first();
  if ((await firstProduct.count()) === 0) {
    await expect(
      page.getByText(/ainda não possui itens|Em breve|não encontrado|não está disponível/i),
    ).toBeVisible();
    return;
  }
  await firstProduct.click();
  await expect(page).toHaveURL(/\/loja\/hot-dog-da-casa\/produto\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
