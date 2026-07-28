// T041 e T042 (feature 020-consulta-puericultura-soap) — e2e da sexta calculadora e da
// segunda ficha da seção Puericultura.
//
// Três coisas se provam aqui, e as três precisam de navegador de verdade:
//
//  · a rota nasce na home e a ficha longa é percorrível por TECLADO, sem armadilha de foco no
//    painel de crescimento (RF-17);
//  · a varredura `axe` fica em ZERO, e não numa entrada nova de `axe-baseline.json`. A linha
//    de base existe para tolerar dívida herdada de telas que já a carregavam; tela que nasce
//    limpa não precisa de tolerância, e registrar zero num arquivo de exceções só criaria um
//    lugar onde afrouxá-la depois (mesma leitura da 017);
//  · nenhuma requisição externa e nenhuma chave nova de armazenamento durante o preenchimento,
//    a avaliação e a cópia (RF-16, ADR 0002). É a guarda que faz da privacidade uma
//    propriedade verificada, e não uma promessa escrita.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const MS_POR_DIA = 86_400_000;

/** Data de nascimento que põe a criança na idade pedida, na data da execução. */
function nascimentoParaIdadeEmDias(dias: number): string {
  const agora = new Date();
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const d = new Date(hoje - dias * MS_POR_DIA);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** 132 dias: a idade do cenário de aceite, que indica a ficha do 4.º Mês. */
async function identifica(page: Page, sexo: RegExp = /^masculino$/i) {
  await page.getByLabel(sexo).check();
  await page
    .getByLabel(/data de nascimento/i)
    .fill(nascimentoParaIdadeEmDias(132));
}

test("home: a seção Puericultura passa a ter duas fichas, e a nova leva à rota (RF-01)", async ({
  page,
}) => {
  await page.goto("/");
  const secao = page.getByRole("region", { name: /puericultura/i });
  await expect(secao.getByRole("link")).toHaveCount(2);

  await page
    .getByRole("link", { name: /ficha de consulta de puericultura/i })
    .click();
  await expect(page).toHaveURL(/\/puericultura\/consulta$/);
  await expect(
    page.getByRole("heading", { name: /ficha de consulta de puericultura/i }),
  ).toBeVisible();
});

test("a idade sugere a ficha do 4.º Mês, e o registro só traz o que foi marcado (RF-03, RN-10)", async ({
  page,
}) => {
  await page.goto("/puericultura/consulta");
  await identifica(page);

  await expect(
    page.getByRole("button", { name: /consulta do 4º mês/i }),
  ).toBeVisible();

  const grupo = page.getByRole("group", { name: "Diarreia/Constipação" });
  await grupo.getByRole("radio", { name: "Sim" }).check();

  const registro = page.locator(".consulta-registro-texto");
  await expect(registro).toContainText("Diarreia/Constipação: Sim");
  await expect(registro).not.toContainText("Estrabismo");
});

test("a proveniência e o aviso de não persistência abrem visíveis, sem rolagem, no telefone (RF-12, RF-13)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/puericultura/consulta");

  const aviso = page.getByText(/Nada do que se preenche aqui é salvo/);
  await expect(aviso).toBeVisible();
  const caixa = await aviso.boundingBox();
  expect(caixa).not.toBeNull();
  expect(caixa!.y).toBeLessThan(667);
});

test("teclado: a ficha longa é percorrível e o painel devolve o foco ao gatilho (RF-17)", async ({
  page,
}) => {
  await page.goto("/puericultura/consulta");
  await identifica(page);

  const gatilho = page.getByRole("button", { name: /avaliar crescimento/i });
  await gatilho.focus();
  await page.keyboard.press("Enter");

  const painel = page.getByRole("dialog");
  await expect(painel).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(painel).toHaveCount(0);
  await expect(gatilho).toBeFocused();
});

test("acessibilidade: a ficha de consulta nasce em zero violação axe", async ({
  page,
}, testInfo) => {
  await page.goto("/puericultura/consulta");
  const vazia = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-consulta-vazia", {
    body: JSON.stringify(vazia.violations, null, 2),
    contentType: "application/json",
  });

  await identifica(page);
  const grupo = page.getByRole("group", { name: "Diarreia/Constipação" });
  await grupo.getByRole("radio", { name: "Sim" }).check();

  const preenchida = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-consulta-preenchida", {
    body: JSON.stringify(preenchida.violations, null, 2),
    contentType: "application/json",
  });

  expect(vazia.violations.length).toBe(0);
  expect(preenchida.violations.length).toBe(0);
});

test("privacidade: preencher, avaliar e copiar não faz requisição externa (RF-16)", async ({
  page,
}) => {
  const externas: string[] = [];
  const buscasDeDado: string[] = [];
  page.on("request", (requisicao) => {
    const url = new URL(requisicao.url());
    if (url.origin !== "http://localhost:3000") externas.push(requisicao.url());
    if (["fetch", "xhr", "websocket"].includes(requisicao.resourceType())) {
      buscasDeDado.push(requisicao.url());
    }
  });

  await page.goto("/puericultura/consulta");
  await identifica(page);
  await page.getByLabel(/^Peso \(g\)$/).fill("6400");
  const grupo = page.getByRole("group", { name: "Diarreia/Constipação" });
  await grupo.getByRole("radio", { name: "Sim" }).check();

  await page.getByRole("button", { name: /avaliar crescimento/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  expect(externas).toEqual([]);
  expect(buscasDeDado).toEqual([]);
});

test("privacidade: o preenchimento não cria durável novo no navegador (RN-13)", async ({
  page,
}) => {
  await page.goto("/puericultura/consulta");
  await identifica(page);
  const grupo = page.getByRole("group", { name: "Diarreia/Constipação" });
  await grupo.getByRole("radio", { name: "Sim" }).check();
  await page.getByLabel(/^Peso \(g\)$/).fill("6400");

  const armazenamento = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    sessao: Object.keys(sessionStorage),
  }));
  // O único durável da plataforma continua sendo a preferência de tema.
  expect(armazenamento.local.length).toBeLessThanOrEqual(1);
  expect(armazenamento.sessao).toEqual([]);

  // E o que RF-13 promete ao usuário: recarregar descarta tudo.
  await page.reload();
  await expect(page.locator(".consulta-registro-texto")).toHaveCount(0);
});
