import { expect, test, type Page } from "@playwright/test";

const futurePeriod = {
  start: "2030-01-01",
  end: "2030-01-31",
  occurredOn: "2030-01-15",
};

test.describe("fluxos criticos do MVP-Core", () => {
  test("register, logout, login e restauracao da sessao atual", async ({ page }) => {
    const account = createAccount("sessao");

    await page.goto("/");

    await page.getByRole("button", { name: "Criar acesso" }).click();
    await page.getByLabel("Responsavel").fill("Rosana Operacao");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Senha").fill(account.password);
    await page.getByRole("button", { name: "Criar conta e abrir o sistema" }).click();

    await expect(page.getByTestId("session-email")).toHaveText(account.email);
    await expect(page.getByRole("heading", { name: "Caderno vivo" })).toBeVisible();

    await page.getByRole("button", { name: "Encerrar sessao" }).click();
    await expect(page.getByText("Sessao encerrada com sucesso.")).toBeVisible();

    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Senha").fill(account.password);
    await page.getByRole("button", { name: "Entrar na operacao" }).click();

    await expect(page.getByTestId("session-email")).toHaveText(account.email);
    await expect(page.getByRole("heading", { name: "Caderno vivo" })).toBeVisible();
  });

  test("cria movimentacao, lista no caixa e atualiza dashboard", async ({ page }) => {
    const account = createAccount("caixa");
    const description = `Venda especial ${Date.now()}`;

    await page.goto("/");

    await page.getByRole("button", { name: "Criar acesso" }).click();
    await page.getByLabel("Responsavel").fill("Rosana Operacao");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Senha").fill(account.password);
    await page.getByRole("button", { name: "Criar conta e abrir o sistema" }).click();

    await fillPeriod(page, futurePeriod.start, futurePeriod.end);
    await expect(page.getByText("Ainda nao ha movimentacoes neste periodo.")).toBeVisible();

    await page.getByTestId("nav-cash").click();
    await page.getByRole("tab", { name: "Novo lancamento" }).click();
    await page.getByLabel("Descricao").fill(description);
    await page.getByLabel("Valor").fill("123.45");
    await page.getByLabel("Data").fill(futurePeriod.occurredOn);
    await page.getByRole("button", { name: "Registrar movimentacao" }).click();

    await expect(page.getByText("Movimentacao registrada e painel atualizado.")).toBeVisible();
    await expect(page.getByTestId("cash-feed-item").filter({ hasText: description })).toBeVisible();
    await expect(page.getByTestId("cash-feed-item").filter({ hasText: "+R$ 123,45" })).toBeVisible();

    await page.getByTestId("nav-dashboard").click();
    await page.getByRole("tab", { name: "Painel geral" }).click();
    await expect(page.getByTestId("metric-card-receita")).toContainText("R$ 123,45");
    await expect(page.getByTestId("metric-card-despesa")).toContainText("R$ 0,00");
    await expect(page.getByTestId("metric-card-lucro")).toContainText("R$ 123,45");
    await expect(page.getByText("Periodo positivo")).toBeVisible();
  });
});

function createAccount(prefix: string) {
  const nonce = `${Date.now()}-${Math.round(Math.random() * 1000)}`;

  return {
    email: `${prefix}-${nonce}@feiracontrol.test`,
    password: "Senha12345",
  };
}

async function fillPeriod(page: Page, startDate: string, endDate: string) {
  await page.getByLabel("Inicio").fill(startDate);
  await page.getByLabel("Fim").fill(endDate);
}
