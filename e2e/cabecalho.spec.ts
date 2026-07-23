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
