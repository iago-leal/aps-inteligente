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
