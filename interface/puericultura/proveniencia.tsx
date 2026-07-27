"use client";
// Proveniência e limites da avaliação do crescimento (feature 017: RF-13, RN-14):
// bloco renderizado FORA do painel de resultado, sempre visível — inclusive antes da
// primeira avaliação —, no molde do ContextoDaFonte da 014. O texto é fonte única
// congelada no domínio (NOTA_PROVENIENCIA), lida daqui; a tela não reescreve nada do
// que a caderneta afirma, e por isso o bloco não pode divergir do motor (anti-drift).
// Os limites de cobertura vêm da mesma origem: REFERENCIAS.cobertura é o que a fonte
// alcança, e é o que a ferramenta pode afirmar. Só apresentação, sem cálculo.
import { Heading, Text } from "@primer/react";
import {
  NOTA_PROVENIENCIA,
  REFERENCIAS,
} from "models/puericultura/fonte-clinica";

export function ProvenienciaDoCrescimento() {
  return (
    <section
      className="referencias-complementares"
      aria-labelledby="proveniencia-crescimento-titulo"
    >
      <Heading as="h2" id="proveniencia-crescimento-titulo">
        Proveniência e limites desta avaliação
      </Heading>
      <Text as="p" size="small">
        {NOTA_PROVENIENCIA}
      </Text>
      <Text as="p" size="small">
        Cobertura da fonte: {REFERENCIAS.cobertura.localizacao}. Fora dessa
        faixa, a ferramenta recusa o cálculo em vez de extrapolar.
      </Text>
      <Text as="p" size="small">
        Fonte: {REFERENCIAS.cobertura.versaoEdicao}.
      </Text>
    </section>
  );
}
