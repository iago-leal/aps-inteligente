// e2e do rastreamento de depressão na pessoa idosa (feature 023: RF-09, RF-15; D-13).
//
// Três coisas só se provam com navegador de verdade, e são estas: que a escala inteira se
// responde pelo TECLADO, na ordem impressa e sem apontador; que a rota nasce em ZERO
// violação de acessibilidade, por asserção direta e sem entrada na linha de base; e que
// responder a um instrumento de saúde mental não dispara requisição alguma.
//
// POR QUE `axe` POR ASSERÇÃO DIRETA, E NÃO CONTRA A BASELINE (D-13). A linha de base existe
// para conviver com violações herdadas de telas antigas; tela nova não herda nada, e
// comparar contra a baseline lhe daria de presente um orçamento de violações que ela não
// precisa gastar. Zero é o número certo enquanto for verdade, e o dia em que deixar de ser
// verdade é o dia em que alguém deve olhar.
//
// Spec próprio por coesão de assunto e para manter `plataforma.spec.ts` longe do teto de 400
// linhas, como fizeram as features 011 e 019.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROTA = "/saude-do-idoso/depressao-gds";

/**
 * Responde à escala inteira SEM APONTADOR, marcando "Sim" em cada item.
 *
 * O percurso se apoia no comportamento nativo do grupo de opções: enquanto nenhuma opção do
 * item está marcada, as duas são tabuláveis; marcada uma, a outra sai da ordem de tabulação
 * e o Tab seguinte alcança o item de baixo. É por isso que um Space e um Tab por item bastam
 * para percorrer os quinze — e é justamente essa propriedade que se quer provar.
 */
async function respondeTudoPeloTeclado(page: Page) {
  await page.getByRole("radio").first().focus();
  for (let item = 0; item < 15; item += 1) {
    await page.keyboard.press("Space");
    if (item < 14) await page.keyboard.press("Tab");
  }
}

test("teclado: a escala inteira se responde sem apontador, e o resultado sai (RF-09)", async ({
  page,
}) => {
  await page.goto(ROTA);
  await respondeTudoPeloTeclado(page);

  // Todas as respostas "Sim": dez itens pontuam, e a escala cai na faixa do meio. Se este
  // número virasse 15, a chave de pontuação teria sido uniformizada em algum lugar.
  await page.getByRole("button", { name: "Calcular escore" }).click();

  const painel = page.getByRole("complementary", { name: "Resultado" });
  await expect(
    painel.getByRole("heading", { name: "10 de 15 pontos" }),
  ).toBeVisible();
  await expect(painel.getByText("indica depressão leve")).toBeVisible();
  await expect(
    painel.getByText(/encaminhamento para avaliação neuropsicológica/),
  ).toBeVisible();
  await expect(painel.getByText(/não estabelece diagnóstico/)).toBeVisible();
});

test("escala em branco: os quinze itens voltam nomeados, sem escore (RF-05)", async ({
  page,
}) => {
  await page.goto(ROTA);
  await page.getByRole("button", { name: "Calcular escore" }).click();

  const painel = page.getByRole("complementary", { name: "Resultado" });
  await expect(
    painel.getByRole("heading", { name: "Escala incompleta" }),
  ).toBeVisible();
  await expect(painel.getByRole("alert")).toHaveCount(15);
  await expect(painel.getByText(/de 15 pontos/)).toHaveCount(0);
});

// RF-15: o dado desta tela é sintomatologia psíquica de pessoa identificável na consulta, e
// a promessa de que ele não sai do navegador é a mais pesada que a plataforma faz. Carregar
// o próprio JavaScript da aplicação, da mesma origem, é o Next funcionando; o que não pode
// existir é terceiro e busca de dado.
test("responder a escala não fala com terceiro nem busca dado (RF-15; RN-10)", async ({
  page,
}) => {
  await page.goto(ROTA);
  await page.waitForLoadState("networkidle");

  const externas: string[] = [];
  const buscasDeDado: string[] = [];
  page.on("request", (requisicao) => {
    const url = new URL(requisicao.url());
    if (url.origin !== "http://localhost:3000") externas.push(requisicao.url());
    if (["fetch", "xhr", "websocket"].includes(requisicao.resourceType())) {
      buscasDeDado.push(requisicao.url());
    }
  });

  await respondeTudoPeloTeclado(page);
  await page.getByRole("button", { name: "Calcular escore" }).click();
  await expect(
    page
      .getByRole("complementary", { name: "Resultado" })
      .getByRole("heading", {
        name: "10 de 15 pontos",
      }),
  ).toBeVisible();

  expect(externas).toEqual([]);
  expect(buscasDeDado).toEqual([]);

  // O único durável da plataforma continua sendo a preferência de tema.
  const armazenamento = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    sessao: Object.keys(sessionStorage),
  }));
  expect(armazenamento.local.length).toBeLessThanOrEqual(1);
  expect(armazenamento.sessao).toEqual([]);
});

test("acessibilidade: a rota nasce em zero violação axe (RNF de acessibilidade)", async ({
  page,
}, testInfo) => {
  await page.goto(ROTA);
  const tela = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-depressao-gds", {
    body: JSON.stringify(tela.violations, null, 2),
    contentType: "application/json",
  });

  await respondeTudoPeloTeclado(page);
  await page.getByRole("button", { name: "Calcular escore" }).click();
  await expect(
    page
      .getByRole("complementary", { name: "Resultado" })
      .getByRole("heading", {
        name: "10 de 15 pontos",
      }),
  ).toBeVisible();
  const comResultado = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-tela-depressao-gds-com-resultado", {
    body: JSON.stringify(comResultado.violations, null, 2),
    contentType: "application/json",
  });

  expect(tela.violations.length).toBe(0);
  expect(comResultado.violations.length).toBe(0);
});
