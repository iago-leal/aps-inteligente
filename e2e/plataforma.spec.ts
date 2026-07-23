// T016 (feature 007-idade-gestacional-e-home) — e2e da plataforma: home por seções
// (RF-05/RF-06), calculadora de idade gestacional ponta a ponta (RF-01/RF-09),
// privacidade de rede (RN-09) e acessibilidade axe contra a linha de base.
// Datas calculadas em relação ao dia da execução: a UI usa a data do dispositivo
// (RN-07), e o teste espelha a aritmética como oráculo.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import linhaDeBase from "./axe-baseline.json";

const MS_POR_DIA = 86_400_000;

function hojeLocalEmDiasEpoch(): number {
  const agora = new Date();
  return (
    Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()) /
    MS_POR_DIA
  );
}

function iso(dias: number): string {
  const d = new Date(dias * MS_POR_DIA);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function brDeIso(isoData: string): string {
  const [ano, mes, dia] = isoData.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Oráculo da DPP: regra de Naegele calendárica (+7 dias, +9 meses; p. 32). */
function dppPorNaegele(dumDias: number): string {
  const maisSete = new Date((dumDias + 7) * MS_POR_DIA);
  const ms = Date.UTC(
    maisSete.getUTCFullYear(),
    maisSete.getUTCMonth() + 9,
    maisSete.getUTCDate(),
  );
  return iso(ms / MS_POR_DIA);
}

async function preencheDum(page: Page, valor: string) {
  await page.getByLabel("Data da última menstruação (DUM)").fill(valor);
}

test("home: duas seções, cartões navegáveis, raiz sem calculadora embutida", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Diabetes Mellitus tipo 2" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pré-natal" })).toBeVisible();

  await page.getByRole("link", { name: "Calculadora de insulina" }).click();
  await expect(page).toHaveURL(/\/dm2\/insulina$/);
  await expect(
    page.getByRole("heading", { name: "Calculadora de Insulina — DM2" }),
  ).toBeVisible();

  await page.goto("/");
  await page
    .getByRole("link", { name: "Calculadora de idade gestacional" })
    .click();
  await expect(page).toHaveURL(/\/pre-natal\/idade-gestacional$/);
  await expect(
    page.getByRole("heading", { name: "Calculadora de Idade Gestacional" }),
  ).toBeVisible();
});

test("idade gestacional pela DUM: IG de 29 semanas, DPP por Naegele e fonte visível", async ({
  page,
}) => {
  const hoje = hojeLocalEmDiasEpoch();
  const dum = hoje - 203; // 29 semanas e 0 dias na data da execução.
  await page.goto("/pre-natal/idade-gestacional");
  await preencheDum(page, iso(dum));
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.getByText("29 semanas e 0 dias")).toBeVisible();
  await expect(
    page.getByText(`Data provável do parto: ${brDeIso(dppPorNaegele(dum))}`),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fonte clínica" }),
  ).toBeVisible();
  await expect(
    page.getByText("Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed., 2025 · p. 31", {
      exact: false,
    }),
  ).toBeVisible();

  // Sem ritual de revisão nesta tela (D-08): datação não prescreve.
  await expect(page.getByRole("checkbox")).toHaveCount(0);
});

test("entrada dupla: divergência além da margem destaca o ultrassom como referência", async ({
  page,
}) => {
  const hoje = hojeLocalEmDiasEpoch();
  const exame = hoje - 30;
  // Laudo de 8s0d → DUM equivalente = exame − 56; DUM informada 14 dias antes:
  // divergência de 14 dias > margem de 7 do 1.º trimestre (p. 32).
  const dum = exame - 56 - 14;
  await page.goto("/pre-natal/idade-gestacional");
  await preencheDum(page, iso(dum));
  await page.getByLabel("Data do exame").fill(iso(exame));
  await page.getByLabel("Semanas no exame").fill("8");
  await page.getByLabel("Dias no exame").fill("0");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(
    page.getByRole("heading", { name: "Pela DUM" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Pelo ultrassom" }),
  ).toBeVisible();
  await expect(page.getByText(/diverge .* em 14 dias/)).toBeVisible();
  await expect(
    page.getByText(/a datação pelo ultrassom passa a ser a referência/),
  ).toBeVisible();
});

test("nenhuma requisição sai para origem externa na home e na calculadora de IG (RN-09)", async ({
  page,
}) => {
  const externas: string[] = [];
  page.on("request", (req) => {
    if (!new URL(req.url()).origin.includes("localhost")) {
      externas.push(req.url());
    }
  });

  await page.goto("/");
  await page
    .getByRole("link", { name: "Calculadora de idade gestacional" })
    .click();
  await preencheDum(page, iso(hojeLocalEmDiasEpoch() - 100));
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.getByText("Data provável do parto:", { exact: false })).toBeVisible();

  expect(externas).toEqual([]);
});

test("acessibilidade: telas novas permanecem na linha de base zero", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const home = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-home", {
    body: JSON.stringify(home.violations, null, 2),
    contentType: "application/json",
  });

  await page.goto("/pre-natal/idade-gestacional");
  const telaIg = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-ig", {
    body: JSON.stringify(telaIg.violations, null, 2),
    contentType: "application/json",
  });

  await preencheDum(page, iso(hojeLocalEmDiasEpoch() - 203));
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.getByText("29 semanas e 0 dias")).toBeVisible();
  const comResultado = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-ig-com-resultado", {
    body: JSON.stringify(comResultado.violations, null, 2),
    contentType: "application/json",
  });

  expect(home.violations.length).toBeLessThanOrEqual(linhaDeBase.home);
  expect(telaIg.violations.length).toBeLessThanOrEqual(
    linhaDeBase.telaIdadeGestacional,
  );
  expect(comResultado.violations.length).toBeLessThanOrEqual(
    linhaDeBase.telaIdadeGestacionalComResultado,
  );
});
