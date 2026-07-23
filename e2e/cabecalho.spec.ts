// e2e do cabeçalho comum (feature 011-refatora-cabecalho).
//
// Cobre a navegação de retorno à home a partir das calculadoras (RF-04; RN-03) e
// a ausência desse comando na própria home, além de confirmar que o alternador de
// tema icônico (RF-01) permanece presente. Extraído para spec próprio para manter
// plataforma.spec.ts abaixo do teto de 400 linhas e por coesão de assunto.
import { expect, test } from "@playwright/test";

test("calculadora: o comando de início do cabeçalho volta para a home (RF-04)", async ({
  page,
}) => {
  await page.goto("/dm2/insulina");
  await page.getByRole("link", { name: "Início" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Diabetes Mellitus tipo 2" }),
  ).toBeVisible();
});

test("home: não expõe comando de início, redundante na página inicial (RN-03)", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Início" })).toHaveCount(0);
  // O toggle de tema icônico continua presente na home.
  await expect(
    page.getByRole("button", { name: "Ativar tema escuro" }),
  ).toBeVisible();
});

// T001 (feature 015-cabecalho-unificado; RF-01/RF-02, D-04) — coincidência
// vertical do alternador de tema entre a home e uma calculadora. Com o
// alinhamento unificado ao topo (align-items: flex-start nas duas variantes), o
// topo do alternador assenta à mesma distância do topo do .cabecalho nas duas
// telas, independentemente da altura do hero da home. Guarda geométrica no molde
// das guardas da feature 013 (boundingBox, tolerância 2px). Falha no estado
// bifurcado (center na variante padrão × flex-end na destaque).
test("alternador de tema coincide verticalmente entre home e calculadora (RF-01/RF-02)", async ({
  page,
}) => {
  const deslocamentoDoTopo = async (rota: string) => {
    await page.goto(rota);
    const alternador = page.getByRole("button", { name: /Ativar tema/ });
    await expect(alternador).toBeVisible();
    const cabecalho = (await page.locator(".cabecalho").boundingBox())!;
    const botao = (await alternador.boundingBox())!;
    return botao.y - cabecalho.y;
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  const naHome = await deslocamentoDoTopo("/");
  const naCalculadora = await deslocamentoDoTopo("/dm2/insulina");

  expect(Math.abs(naHome - naCalculadora)).toBeLessThanOrEqual(2);
});

// T002 (feature 016-estrutura-cabecalho-home; RF-01/RF-06) — a altura do
// cabeçalho coincide em TODA a plataforma, por construção: a home passou a ter a
// mesma estrutura de três blocos das calculadoras (marca decorativa + h1 textual
// + subtítulo), com o mesmo respiro vertical (44/36), então a altura emerge igual
// sem que nenhum CSS a fixe. Guarda geométrica no molde da 015 (boundingBox,
// tolerância 2px), estendida das duas rotas às cinco. Falha barulhenta ao
// primeiro desvio, nomeando a rota divergente (observabilidade de regressão).
const ROTAS_COM_CABECALHO = [
  "/",
  "/dm2/insulina",
  "/pre-natal/idade-gestacional",
  "/cardiologia/dor-toracica",
  "/cardiologia/risco-cardiovascular",
] as const;

test("altura do cabeçalho é idêntica em todas as rotas (RF-01/RF-06)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const alturas: { rota: string; altura: number }[] = [];
  for (const rota of ROTAS_COM_CABECALHO) {
    await page.goto(rota);
    await expect(page.locator(".cabecalho")).toBeVisible();
    const caixa = (await page.locator(".cabecalho").boundingBox())!;
    alturas.push({ rota, altura: caixa.height });
  }

  const referencia = alturas[0];
  for (const { rota, altura } of alturas.slice(1)) {
    expect(
      Math.abs(altura - referencia.altura),
      `Altura do cabeçalho divergiu: ${rota} = ${altura}px vs ${referencia.rota} = ${referencia.altura}px (tolerância 2px)`,
    ).toBeLessThanOrEqual(2);
  }
});
