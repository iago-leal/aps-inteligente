// RF-05 (feature 004-estilo-primer-nas-telas): e2e da calculadora contra o build de
// produção — comportamento, tema, privacidade de rede (RN-02) e acessibilidade axe
// comparada à linha de base versionada em e2e/axe-baseline.json.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import linhaDeBase from "./axe-baseline.json";

async function calculaCasoValidoDeInicio(page: Page) {
  await page.getByLabel("Peso (kg)").fill("80");
  await page.getByRole("button", { name: "Calcular" }).click();
}

test("fluxo de início de insulinização com ritual de revisão", async ({
  page,
}) => {
  await page.goto("/");
  await calculaCasoValidoDeInicio(page);

  // Faixa da fonte (10–15 UI/dia) e equivalente por peso (0,1–0,2 × 80 kg).
  await expect(page.getByText("10 a 15 UI/dia")).toBeVisible();
  await expect(page.getByText("8 a 16 UI/dia")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fonte clínica" }),
  ).toBeVisible();

  // Ritual de revisão: só depois do checkbox o bloco final é habilitado.
  const blocoFinal = page.getByTestId("bloco-pronto-para-prescrever");
  await expect(blocoFinal).toHaveAttribute("aria-disabled", "true");
  await page.getByLabel("Revisei a dose e a fonte").check();
  await expect(blocoFinal).toHaveAttribute("aria-disabled", "false");

  // Edição invalida o resultado e desfaz a revisão (RN-06/EC-03).
  await page.getByLabel("Peso (kg)").fill("81");
  await expect(
    page.getByText("Os dados mudaram — recalcule antes de prescrever."),
  ).toBeVisible();
  await expect(page.getByLabel("Revisei a dose e a fonte")).not.toBeChecked();

  // "Novo cálculo" devolve a tela ao estado vazio (RF-10).
  await page.getByRole("button", { name: "Novo cálculo" }).click();
  await expect(
    page.getByText("Preencha os dados do paciente e acione Calcular."),
  ).toBeVisible();
});

test("tema escuro persiste após recarga da página", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tema escuro" }).click();
  await expect(page.locator("[data-tema=escuro]")).toBeVisible();

  await page.reload();
  await expect(page.locator("[data-tema=escuro]")).toBeVisible();

  await page.getByRole("button", { name: "Tema claro" }).click();
  await expect(page.locator("[data-tema=claro]")).toBeVisible();
});

test("nenhuma requisição sai para origem externa (RN-02)", async ({ page }) => {
  const externas: string[] = [];
  page.on("request", (req) => {
    if (!new URL(req.url()).origin.includes("localhost")) {
      externas.push(req.url());
    }
  });

  await page.goto("/");
  await calculaCasoValidoDeInicio(page);
  await page.getByLabel("Revisei a dose e a fonte").check();
  await page.getByRole("button", { name: "Tema escuro" }).click();

  expect(externas).toEqual([]);
});

test("acessibilidade: violações axe não excedem a linha de base", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const inicial = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-inicial", {
    body: JSON.stringify(inicial.violations, null, 2),
    contentType: "application/json",
  });

  await calculaCasoValidoDeInicio(page);
  await expect(page.getByText("10 a 15 UI/dia")).toBeVisible();
  const comResultado = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-com-resultado", {
    body: JSON.stringify(comResultado.violations, null, 2),
    contentType: "application/json",
  });

  expect(inicial.violations.length).toBeLessThanOrEqual(
    linhaDeBase.telaInicial,
  );
  expect(comResultado.violations.length).toBeLessThanOrEqual(
    linhaDeBase.telaComResultado,
  );
});
