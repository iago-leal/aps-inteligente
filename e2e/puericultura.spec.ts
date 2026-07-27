// T048 (feature 017-puericultura-crescimento) — e2e da quinta calculadora e da
// primeira seção de Puericultura: a seção nova nasce na home e leva à rota
// (cenário 15, RF-14), o caso-base atravessa a tela ponta a ponta (RF-11/RF-20), a
// recusa global aparece sem número (RN-08) e a varredura axe fica em zero.
//
// A asserção de acessibilidade é `toBe(0)`, e não uma entrada nova em
// `axe-baseline.json`: a linha de base existe para tolerar dívida herdada de telas
// que já a carregavam, e uma tela que nasce limpa não precisa de tolerância —
// registrar zero num arquivo de exceções só criaria um lugar onde afrouxá-la depois.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const MS_POR_DIA = 86_400_000;

/** Data de nascimento que põe a criança nos 212 dias na data da execução. */
function nascimentoParaIdadeEmDias(dias: number): string {
  const agora = new Date();
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const d = new Date(hoje - dias * MS_POR_DIA);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function avaliaCrescimento(
  page: Page,
  opcoes: {
    sexo: RegExp;
    nascimento: string;
    peso?: string;
    comprimento?: string;
    posicao?: RegExp;
    perimetroCefalico?: string;
  },
) {
  await page.getByLabel(opcoes.sexo).check();
  await page.getByLabel(/data de nascimento/i).fill(opcoes.nascimento);
  if (opcoes.peso) await page.getByLabel(/peso \(kg\)/i).fill(opcoes.peso);
  if (opcoes.comprimento) {
    await page.getByLabel(/comprimento\/estatura/i).fill(opcoes.comprimento);
  }
  if (opcoes.posicao) await page.getByLabel(opcoes.posicao).check();
  if (opcoes.perimetroCefalico) {
    await page.getByLabel(/perímetro cefálico/i).fill(opcoes.perimetroCefalico);
  }
  await page.getByRole("button", { name: /avaliar crescimento/i }).click();
  return page.getByRole("complementary", { name: "Resultado" });
}

test("home: a seção Puericultura nasce e leva à avaliação do crescimento (RF-14)", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Puericultura" }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /avaliação do crescimento infantil/i })
    .click();
  await expect(page).toHaveURL(/\/puericultura\/crescimento$/);
  await expect(
    page.getByRole("heading", { name: /Avaliação do Crescimento Infantil/i }),
  ).toBeVisible();
});

test("caso-base: menino de 212 dias → quatro índices com escore, rótulo e página (RF-11/RF-20)", async ({
  page,
}) => {
  await page.goto("/puericultura/crescimento");
  const painel = await avaliaCrescimento(page, {
    sexo: /^masculino$/i,
    nascimento: nascimentoParaIdadeEmDias(212),
    peso: "8.2",
    comprimento: "68.5",
    posicao: /deitado \(comprimento\)/i,
    perimetroCefalico: "44.0",
  });

  await expect(painel.getByText("Peso adequado para idade")).toBeVisible();
  await expect(painel.getByText("Eutrofia")).toBeVisible();
  const peso = page.getByRole("region", { name: /peso para a idade/i });
  await expect(peso).toContainText("Escore z: −0.1");
  await expect(peso).toContainText("Padrão: OMS");
  await expect(peso).toContainText("p. 89");
});

test("recusa global: idade além da cobertura da fonte não produz número (RN-08)", async ({
  page,
}) => {
  await page.goto("/puericultura/crescimento");
  const painel = await avaliaCrescimento(page, {
    sexo: /^masculino$/i,
    nascimento: nascimentoParaIdadeEmDias(4200),
    peso: "40",
  });

  await expect(painel.getByText(/fora do escopo da fonte/i)).toBeVisible();
  await expect(
    page.getByRole("region", { name: /peso para a idade/i }),
  ).toHaveCount(0);
});

test("proveniência fora do painel de resultado, visível desde o primeiro acesso (RF-13)", async ({
  page,
}) => {
  await page.goto("/puericultura/crescimento");
  const proveniencia = page.getByRole("region", {
    name: /proveniência e limites/i,
  });
  await expect(proveniencia).toBeVisible();
  await expect(proveniencia).toContainText("medição isolada");
  await expect(
    page.getByRole("complementary", { name: "Resultado" }),
  ).not.toContainText("medição isolada");
});

test("acessibilidade: a tela de crescimento nasce em zero violação axe", async ({
  page,
}, testInfo) => {
  await page.goto("/puericultura/crescimento");
  const tela = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-crescimento", {
    body: JSON.stringify(tela.violations, null, 2),
    contentType: "application/json",
  });

  const painel = await avaliaCrescimento(page, {
    sexo: /^masculino$/i,
    nascimento: nascimentoParaIdadeEmDias(212),
    peso: "8.2",
    comprimento: "68.5",
    posicao: /deitado \(comprimento\)/i,
    perimetroCefalico: "44.0",
  });
  await expect(painel.getByText("Eutrofia")).toBeVisible();
  const comResultado = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-crescimento-com-resultado", {
    body: JSON.stringify(comResultado.violations, null, 2),
    contentType: "application/json",
  });

  expect(tela.violations.length).toBe(0);
  expect(comResultado.violations.length).toBe(0);
});
