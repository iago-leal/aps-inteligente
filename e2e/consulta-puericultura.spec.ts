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

// Regressão de BUG-20260728-C6LN. Levar o gatilho para dentro do quadro das medidas o põe
// dentro de uma árvore que se REMONTA a cada troca de ficha, e o retorno de foco depende de
// um `ref` que sobreviva a essa remontagem. Sobrevive por identidade de objeto, mas isso é
// comportamento de framework, e comportamento de framework se guarda com prova: o dia em que
// alguém trocar o `useRef` por um `ref` de callback criado no corpo do render, o foco passa a
// cair no `<body>` depois de trocar a ficha, sem que nenhum outro teste reprove.
test("teclado: o foco volta ao gatilho mesmo depois de trocar a ficha (BUG-20260728-C6LN)", async ({
  page,
}) => {
  await page.goto("/puericultura/consulta");
  await identifica(page);

  await page.getByRole("button", { name: /consulta do 4º mês/i }).click();
  await page
    .getByRole("menuitemradio", { name: /consulta do 6º mês/i })
    .click();
  await expect(
    page.getByRole("button", { name: /consulta do 6º mês/i }),
  ).toBeVisible();

  const gatilho = page.getByRole("button", { name: /avaliar crescimento/i });
  await gatilho.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
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

// ── T006 e T007 (feature 021-coluna-da-ficha-de-consulta) ────────────────────
// Os dois roteiros que a correção de enquadramento precisa deixar verdadeiros.
// Ambos medem o <main>, que a feature 021 tornou a sede da coluna do corpo
// (RN-01b): antes dela a ficha ocupava a janela inteira, e o que segue reprovava.

/** Bordas do CONTEÚDO do corpo, isto é, já descontado o recuo lateral da coluna. */
async function medeCorpo(page: Page, rota: string) {
  await page.goto(rota);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const corpo = page.locator("main");
  const caixa = (await corpo.boundingBox())!;
  const recuo = await corpo.evaluate((el) => {
    const estilo = getComputedStyle(el);
    return {
      esquerda: Number.parseFloat(estilo.paddingLeft),
      direita: Number.parseFloat(estilo.paddingRight),
    };
  });
  const transbordo = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );

  return {
    esquerda: caixa.x + recuo.esquerda,
    direita: caixa.x + caixa.width - recuo.direita,
    transbordo,
  };
}

test("telefone: a ficha respira como a tela irmã e a página não rola de lado (RF-02)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });

  const consulta = await medeCorpo(page, "/puericultura/consulta");
  const crescimento = await medeCorpo(page, "/puericultura/crescimento");

  // Nenhum texto encosta na borda: o conteúdo começa depois do recuo e termina
  // antes da borda oposta.
  expect(consulta.esquerda).toBeGreaterThan(0);
  expect(consulta.direita).toBeLessThan(375);

  // E o recuo é o MESMO da tela irmã, que é o que RF-02 afirma. Comparar com a
  // tela irmã, e não com um número escrito aqui, mantém o teste solidário à
  // folha: se o recuo do telefone mudar por decisão, ele muda nas duas.
  expect(
    Math.abs(consulta.esquerda - crescimento.esquerda),
  ).toBeLessThanOrEqual(1);
  expect(Math.abs(consulta.direita - crescimento.direita)).toBeLessThanOrEqual(
    1,
  );

  expect(consulta.transbordo).toBe(false);
});

/** Uma palavra sem espaço algum: é o que de fato exercita `overflow-wrap: anywhere`. */
const PALAVRA_SEM_QUEBRA =
  "hepatoesplenomegaliapersistentecomlinfadenopatiageneralizadaeirritabilidadeaoexame";

test("registro longo: o texto quebra dentro da coluna, sem rolagem lateral (RF-05, RN-05)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/puericultura/consulta");

  // 35 dias: idade que indica a ficha do 1.º Mês, a do cenário de aceite.
  await page.getByLabel(/^masculino$/i).check();
  await page
    .getByLabel(/data de nascimento/i)
    .fill(nascimentoParaIdadeEmDias(35));
  await expect(
    page.getByRole("button", { name: /consulta do 1º mês/i }),
  ).toBeVisible();

  // A ficha INTEIRA, que é o que RF-05 pede: toda marcação respondida e todo
  // campo livre com texto que não oferece ponto de quebra.
  const marcacoes = page.getByRole("radio", { name: "Sim" });
  for (let i = 0; i < (await marcacoes.count()); i += 1) {
    await marcacoes.nth(i).check();
  }
  const livres = page.locator("main textarea, main input[type='text']");
  for (let i = 0; i < (await livres.count()); i += 1) {
    await livres.nth(i).fill(PALAVRA_SEM_QUEBRA);
  }

  const registro = page.locator(".consulta-registro-texto");
  await expect(registro).toBeVisible();

  for (const largura of [1280, 375]) {
    await page.setViewportSize({ width: largura, height: 900 });

    const caixaRegistro = (await registro.boundingBox())!;
    const corpo = (await page.locator("main").boundingBox())!;
    const recuoDireito = await page
      .locator("main")
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).paddingRight));

    // O bloco quebra DENTRO da coluna: não passa da borda de conteúdo do corpo.
    expect(
      caixaRegistro.x + caixaRegistro.width,
      `o registro estoura a coluna em ${largura}px`,
    ).toBeLessThanOrEqual(corpo.x + corpo.width - recuoDireito + 1);

    const transbordo = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(transbordo, `a página rola de lado em ${largura}px`).toBe(false);
  }
});
