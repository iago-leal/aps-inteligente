"use client";
// Nota de proveniência da calculadora de risco cardiovascular (feature 014:
// RF-10/RN-09; D-09): declara a limitação de transportabilidade das PCE (coorte
// dos EUA, categorias raciais norte-americanas, sem calibração para o Brasil). O
// texto é fonte única congelada no domínio (NOTA_PROVENIENCIA) — anti-drift, mesma
// disciplina de referencias.tsx no molde. Só apresentação, sem cálculo.
// ContextoDaFonte (observação metodológica): explica por que a ferramenta usa as
// PCE e não a AHA PREVENT — material consultável renderizado FORA do painel de
// resultado, sem emitir conduta ao paciente (ADR 0005 preservado). O link para a
// PREVENT é um <a> nativo (navegação do usuário), não uma requisição de rede (ADR 0002).
import { Flash, Heading, Text } from "@primer/react";
import { NOTA_PROVENIENCIA } from "models/risco-cardiovascular/fonte-clinica";

const URL_PREVENT =
  "https://professional.heart.org/en/guidelines-and-statements/prevent-calculator";

export function NotaDeProveniencia() {
  return (
    <Flash variant="warning" className="proveniencia">
      {NOTA_PROVENIENCIA}
    </Flash>
  );
}

export function ContextoDaFonte() {
  return (
    <section className="referencias-complementares" aria-labelledby="contexto-fonte-titulo">
      <Heading as="h2" id="contexto-fonte-titulo">
        Por que Pooled Cohort Equations, e não a AHA PREVENT?
      </Heading>
      <Text as="p" size="small">
        A AHA PREVENT (2023) é uma calculadora mais recente — sexo-específica e sem
        variável de raça, derivada de mais de 6,5 milhões de adultos e capaz de
        incorporar função renal e determinantes sociais —, criada para modernizar a
        estimativa e ampliar sua aplicabilidade à população geral dos Estados Unidos.
      </Text>
      <Text as="p" size="small">
        Esta ferramenta usa, ainda assim, as Pooled Cohort Equations porque a
        recomendação de estatina em prevenção primária da USPSTF (2022) — o limiar
        que dá sentido clínico ao número estimado — foi calibrada sobre as PCE. A
        PREVENT estima risco sistematicamente menor; adotá-la descasaria o risco
        estimado do limiar que fundamenta a conduta. A PREVENT fica como candidata a
        uma calculadora futura, como fonte distinta.
      </Text>
      <Text as="p" size="small">
        Calculadora AHA PREVENT (site oficial, em inglês):{" "}
        <a href={URL_PREVENT} target="_blank" rel="noopener noreferrer">
          professional.heart.org — PREVENT™ Online Calculator
        </a>
      </Text>
    </section>
  );
}
