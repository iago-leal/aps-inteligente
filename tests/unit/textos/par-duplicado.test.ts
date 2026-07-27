// Igualdade do par duplicado home ↔ manifesto (T056; D-18; RN-05).
//
// O subtítulo do hero em `interface/inicio/tela.tsx` e a `description` de
// `public/manifest.webmanifest` são hoje o mesmo literal, ponto médio incluído. A duplicação
// PRECEDE esta feature: ninguém a criou, e ela não é acidente de leitura — as duas
// superfícies dizem a mesma coisa ao mesmo leitor, em momentos diferentes, uma na página e
// outra na tela de instalação.
//
// O risco que este teste cobre não é a duplicação: é a DIVERGÊNCIA. Revisar um lado só
// converteria um literal duplicado em dois literais parecidos, que é precisamente o estado
// que RN-05 existe para impedir, e o pior de todos porque ninguém percebe.
//
// A unificação técnica foi descartada por desproporção (D-18): o manifesto é JSON estático
// em `public/` e não importa constante de TypeScript, de modo que unificá-lo de fato exigiria
// um quarto gerador no projeto para resolver um literal. Disciplina mais teste, portanto —
// e este é o teste.
//
// Ele NÃO depende do inventário: lê os dois arquivos direto, como o do manifesto.

import { describe, expect, it } from "vitest";

import {
  CAMINHO_DA_HOME,
  CAMINHO_DO_MANIFESTO,
  manifesto,
  subtituloDaHome,
} from "../../apoio/superficie-textual";

describe("par duplicado: subtítulo da home ↔ descrição do manifesto (D-18)", () => {
  it("os dois literais permanecem idênticos", () => {
    const daHome = subtituloDaHome();
    const doManifesto = String(manifesto().description ?? "");

    expect(
      doManifesto,
      `os dois lados do par divergiram.\n\n` +
        `  ${CAMINHO_DA_HOME}\n      ${JSON.stringify(daHome)}\n` +
        `  ${CAMINHO_DO_MANIFESTO}\n      ${JSON.stringify(doManifesto)}\n\n` +
        `A duplicação é anterior a esta feature e permanece por decisão (D-18): unificá-la ` +
        `de fato exigiria gerar o manifesto a partir do código, um quarto gerador para ` +
        `resolver um literal. O que a decisão exige é que os dois se revisem NO MESMO ATO. ` +
        `Se a intenção era reescrever, reescreva os dois; se era fazê-los divergir, a ` +
        `divergência precisa de decisão registrada, porque RN-05 a proíbe.`,
    ).toBe(daHome);
  });

  it("nenhum dos dois ficou vazio", () => {
    expect(subtituloDaHome().length).toBeGreaterThan(0);
    expect(String(manifesto().description ?? "").length).toBeGreaterThan(0);
  });
});
