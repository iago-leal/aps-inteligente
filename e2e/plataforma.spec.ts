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

// T005 (feature 008-design-mais-bonito-da-home) — acréscimos: cartão inteiro
// clicável (RF-05) e viewport móvel (RF-03). Asserções anteriores byte a byte.
test("cartão inteiro clicável: clique na descrição navega para a calculadora (RF-05)", async ({
  page,
}) => {
  await page.goto("/");
  // O stretched link (::after do <a>) cobre o cartão: um clique sobre a área da
  // descrição é entregue ao link e navega. force ignora o actionability check do
  // Playwright — aqui o overlay "interceptar" o clique É o comportamento sob teste.
  const descricao = page.getByText(
    "Idade gestacional, data provável do parto e trimestre",
    { exact: false },
  );
  await descricao.click({ force: true });
  await expect(page).toHaveURL(/\/pre-natal\/idade-gestacional$/);
});

test("viewport móvel: home sem transbordo horizontal, cartões navegáveis e axe na base (RF-03)", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Diabetes Mellitus tipo 2" }),
  ).toBeVisible();

  const semTransbordo = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );
  expect(semTransbordo).toBe(true);

  const axeMovel = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-home-movel", {
    body: JSON.stringify(axeMovel.violations, null, 2),
    contentType: "application/json",
  });
  expect(axeMovel.violations.length).toBeLessThanOrEqual(linhaDeBase.home);

  await page.getByRole("link", { name: "Calculadora de insulina" }).click();
  await expect(page).toHaveURL(/\/dm2\/insulina$/);
});

// T005 (feature 009-logo-apsi-no-cabecalho) — logo no cabeçalho e identidade PWA
// (RF-01/RF-02/RF-03/RF-05; RN-02/RN-05). Asserções anteriores byte a byte.
test("home: a logo APSi ocupa o wordmark do cabeçalho preservando o nome acessível (RF-01)", async ({
  page,
}) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1, name: "APS Inteligente" });
  await expect(h1).toBeVisible();
  const logo = h1.getByRole("img", { name: "APS Inteligente" });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", "/apsi-light.png");

  // Alternar para escuro troca a variante da logo (RF-02).
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(logo).toHaveAttribute("src", "/apsi-dark.png");
});

test("calculadora: logo é marca decorativa, sem virar heading nem link novo (RF-05, RN-05)", async ({
  page,
}) => {
  await page.goto("/dm2/insulina");
  await expect(
    page.getByRole("heading", { level: 1, name: "Calculadora de Insulina — DM2" }),
  ).toBeVisible();
  // A marca decorativa não expõe nome acessível de imagem e não é link.
  await expect(page.getByRole("img", { name: "APS Inteligente" })).toHaveCount(0);
  const marca = page.locator(".cabecalho-marca");
  await expect(marca).toBeVisible();
  await expect(marca).toHaveAttribute("aria-hidden", "true");
});

test("documento declara favicon e manifesto PWA (RF-03)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
  await expect(page.locator('link[rel="icon"]').first()).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});

// T012 (feature 010-dor-toracica-pre-teste) — calculadora de dor torácica /
// probabilidade pré-teste (RF-01/RF-04/RF-05/RF-06/RF-08). Asserções anteriores
// byte a byte; a home ganha a seção Cardiologia.
async function avaliaCardiologia(
  page: Page,
  opcoes: {
    idade: string;
    sexo: RegExp;
    caracteristicas: RegExp[];
    fatores?: RegExp[];
    impedimento?: boolean;
  },
) {
  await page.goto("/cardiologia/dor-toracica");
  await page.getByLabel(/idade/i).fill(opcoes.idade);
  await page.getByLabel(opcoes.sexo).check();
  for (const caracteristica of opcoes.caracteristicas) {
    await page.getByLabel(caracteristica).check();
  }
  for (const fator of opcoes.fatores ?? []) {
    await page.getByLabel(fator).check();
  }
  if (opcoes.impedimento) {
    await page.getByLabel(/ECG basal altera/i).check();
  }
  await page.getByRole("button", { name: /^avaliar$/i }).click();
  return page.getByRole("complementary", { name: "Resultado" });
}

test("home: a seção Cardiologia leva à calculadora de dor torácica (RF-08)", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cardiologia" }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: /probabilidade pré-teste de cardiopatia isquêmica/i,
    })
    .click();
  await expect(page).toHaveURL(/\/cardiologia\/dor-toracica$/);
  await expect(
    page.getByRole("heading", {
      name: "Probabilidade Pré-teste de Cardiopatia Isquêmica",
    }),
  ).toBeVisible();
});

test("angina típica de alto risco: estrato alto e encaminhamento (RF-01/RF-04)", async ({
  page,
}) => {
  const painel = await avaliaCardiologia(page, {
    idade: "55",
    sexo: /masculino/i,
    caracteristicas: [/retroesternal/i, /exercício ou estresse/i, /alívio rápido/i],
    fatores: [/hipertensão/i, /diabetes/i],
  });
  await expect(painel.getByRole("heading", { name: /angina típica/i })).toBeVisible();
  await expect(painel.getByText(/93%/)).toBeVisible();
  await expect(painel.getByText("Alta", { exact: true })).toBeVisible();
  await expect(painel.getByText(/cardiologista/i)).toBeVisible();
});

test("dor não anginosa sem fatores: exame não indicado (RF-04)", async ({
  page,
}) => {
  const painel = await avaliaCardiologia(page, {
    idade: "55",
    sexo: /masculino/i,
    caracteristicas: [/retroesternal/i],
  });
  await expect(
    painel.getByRole("heading", { name: /dor não anginosa/i }),
  ).toBeVisible();
  await expect(painel.getByText(/exame funcional não indicado/i)).toBeVisible();
});

test("ECG basal impede ergometria: método não invasivo alternativo (RF-05)", async ({
  page,
}) => {
  const painel = await avaliaCardiologia(page, {
    idade: "55",
    sexo: /masculino/i,
    caracteristicas: [/retroesternal/i, /exercício ou estresse/i],
    impedimento: true,
  });
  await expect(
    painel.getByText(/cintilografia|ressonância|ecocardiograma/i),
  ).toBeVisible();
});

test("idade fora de 30–69: fora do escopo da fonte (RF-06)", async ({ page }) => {
  const painel = await avaliaCardiologia(page, {
    idade: "74",
    sexo: /masculino/i,
    caracteristicas: [/retroesternal/i],
  });
  await expect(painel.getByText(/fora do escopo da fonte/i)).toBeVisible();
  await expect(painel.getByText(/30 a 69/)).toBeVisible();
});

// T002 (feature 013-cabecalho-proporcoes) — proporções do cabeçalho padrão
// alinhadas à home: o conteúdo do cabeçalho encaixa na coluna do corpo (RF-01)
// e a logo tem o mesmo tamanho da home (RF-07). Guarda geométrica, tolerância 2px.
test("cabeçalho da calculadora alinha à coluna do corpo em viewport largo (RF-01)", async ({
  page,
}) => {
  const GUTTER = 32; // padding lateral do .calc-regioes
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/dm2/insulina");
  // Espera o layout pintar antes de medir (auto-wait dos locators/boundingBox).
  await expect(
    page.getByRole("heading", { level: 1, name: "Calculadora de Insulina — DM2" }),
  ).toBeVisible();

  const ident = (await page.locator(".cabecalho-identidade").boundingBox())!;
  const acoes = (await page.locator(".cabecalho-acoes").boundingBox())!;
  const corpo = (await page.locator(".calc-regioes").boundingBox())!;

  const identEsq = ident.x;
  const acoesDir = acoes.x + acoes.width;
  const corpoEsq = corpo.x + GUTTER;
  const corpoDir = corpo.x + corpo.width - GUTTER;

  expect(Math.abs(identEsq - corpoEsq)).toBeLessThanOrEqual(2);
  expect(Math.abs(acoesDir - corpoDir)).toBeLessThanOrEqual(2);
});

test("logo do cabeçalho tem o mesmo tamanho na calculadora e na home (RF-07)", async ({
  page,
}) => {
  await page.goto("/dm2/insulina");
  const alturaMarca = await page
    .locator(".cabecalho-marca")
    .evaluate((el) => Math.round(el.getBoundingClientRect().height));

  await page.goto("/");
  const alturaLogo = await page
    .locator(".cabecalho-identidade h1 .cabecalho-logo")
    .evaluate((el) => Math.round(el.getBoundingClientRect().height));

  expect(Math.abs(alturaMarca - alturaLogo)).toBeLessThanOrEqual(1);
});

test("acessibilidade: a tela de cardiologia permanece na linha de base zero", async ({
  page,
}, testInfo) => {
  await page.goto("/cardiologia/dor-toracica");
  const tela = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-cardiologia", {
    body: JSON.stringify(tela.violations, null, 2),
    contentType: "application/json",
  });

  const painel = await avaliaCardiologia(page, {
    idade: "55",
    sexo: /masculino/i,
    caracteristicas: [/retroesternal/i, /exercício ou estresse/i, /alívio rápido/i],
  });
  await expect(painel.getByRole("heading", { name: /angina típica/i })).toBeVisible();
  const comResultado = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-cardiologia-com-resultado", {
    body: JSON.stringify(comResultado.violations, null, 2),
    contentType: "application/json",
  });

  expect(tela.violations.length).toBeLessThanOrEqual(linhaDeBase.telaCardiologia);
  expect(comResultado.violations.length).toBeLessThanOrEqual(
    linhaDeBase.telaCardiologiaComResultado,
  );
});
