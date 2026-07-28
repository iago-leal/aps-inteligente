// e2e da contribuição voluntária via PIX (feature 019).
//
// Três coisas só se provam com navegador de verdade, e são estas: que abrir o
// painel não dispara requisição alguma (RF-06, RN-03), que em viewport de telefone
// os dois comandos de cópia estão visíveis sem rolagem adicional (RF-16), e que o
// comando não aparece em nenhuma das cinco rotas de calculadora (RF-11). O axe do
// painel aberto entra aqui pelo mesmo motivo: violação nova reprova a entrega, em
// vez de ser absorvida na baseline.
//
// Spec próprio por coesão de assunto e para manter plataforma.spec.ts longe do
// teto de 400 linhas, como fez a feature 011 com o cabeçalho.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import linhaDeBase from "./axe-baseline.json";

const ROTAS_DE_CALCULADORA = [
  "/dm2/insulina",
  "/pre-natal/idade-gestacional",
  "/cardiologia/dor-toracica",
  "/cardiologia/risco-cardiovascular",
  "/puericultura/crescimento",
];

test("home: o comando de apoio abre o painel com QR, chave e as duas cópias (RF-05..RF-07, RF-15)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Contribuir por PIX" }).click();

  const painel = page.getByRole("dialog");
  await expect(painel).toBeVisible();
  await expect(
    painel.getByRole("button", { name: "Copiar código copia e cola" }),
  ).toBeVisible();
  await expect(
    painel.getByRole("button", { name: "Copiar chave" }),
  ).toBeVisible();
  await expect(
    painel.getByRole("img", { name: /leitura pela câmera/ }),
  ).toBeVisible();
  await expect(painel.getByText(/não compra funcionalidade/)).toBeVisible();
});

// O que RF-06 exige é ausência de requisição EXTERNA e de busca de dado: o
// payload e o desenho nascem no cliente. Carregar o próprio JavaScript da
// aplicação, da mesma origem, é o Next funcionando, e conflá-lo com tráfego de
// dado tornaria a guarda ruidosa sem torná-la mais severa.
test("abrir o painel não busca dado nem fala com terceiro (RF-06; RN-03/RN-04)", async ({
  page,
}) => {
  await page.goto("/");
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

  await page.getByRole("button", { name: "Contribuir por PIX" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(500);

  expect(externas).toEqual([]);
  expect(buscasDeDado).toEqual([]);
});

test("abrir e fechar o painel não cria durável novo no navegador (RN-03)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Contribuir por PIX" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const armazenamento = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    sessao: Object.keys(sessionStorage),
  }));
  // O único durável da plataforma continua sendo a preferência de tema.
  expect(armazenamento.local.length).toBeLessThanOrEqual(1);
  expect(armazenamento.sessao).toEqual([]);
});

test("telefone: as duas cópias ficam visíveis sem rolagem adicional e antes do QR (RF-16)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: "Contribuir por PIX" }).click();

  const painel = page.getByRole("dialog");
  await expect(painel).toBeVisible();

  const copiaECola = painel.getByRole("button", {
    name: "Copiar código copia e cola",
  });
  const chave = painel.getByRole("button", { name: "Copiar chave" });
  await expect(copiaECola).toBeInViewport();
  await expect(chave).toBeInViewport();

  // Ordem geométrica: os comandos precedem o desenho na leitura de cima para
  // baixo, que é o que RF-16 exige em tela estreita.
  const desenho = painel.getByRole("img", { name: /leitura pela câmera/ });
  const caixaDaCopia = (await copiaECola.boundingBox())!;
  const caixaDoDesenho = (await desenho.boundingBox())!;
  expect(caixaDaCopia.y).toBeLessThan(caixaDoDesenho.y);

  // E a página não passa a transbordar na horizontal por causa do painel.
  const semTransbordo = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );
  expect(semTransbordo).toBe(true);
});

test("teclado: Esc fecha o painel e devolve o foco ao comando (RF-09)", async ({
  page,
}) => {
  await page.goto("/");
  const comando = page.getByRole("button", { name: "Contribuir por PIX" });
  await comando.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(comando).toBeFocused();
});

test("painel aberto: axe sem violação nova sobre a linha de base da home (RNF de acessibilidade)", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Contribuir por PIX" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const analise = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-painel-contribuicao", {
    body: JSON.stringify(analise.violations, null, 2),
    contentType: "application/json",
  });
  expect(analise.violations.length).toBeLessThanOrEqual(linhaDeBase.home);
});

for (const rota of ROTAS_DE_CALCULADORA) {
  test(`calculadora ${rota}: nenhum comando de apoio na tela (RF-11; RN-08)`, async ({
    page,
  }) => {
    await page.goto(rota);
    await expect(page.getByRole("button", { name: /contribuir/i })).toHaveCount(
      0,
    );
    await expect(page.getByText(/apoie a plataforma/i)).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}
