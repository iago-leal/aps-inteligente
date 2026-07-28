"use client";
// Proveniência e limites da ficha de consulta (feature 020: RF-12, RF-13; RN-03, RN-08,
// RN-09, RN-13). Bloco renderizado FORA do painel de resultado e visível desde o primeiro
// carregamento, no molde do `ProvenienciaDoCrescimento` da 017.
//
// POR QUE ANTES DE QUALQUER PREENCHIMENTO, e não depois. Quem vai investir dez minutos
// preenchendo uma ficha longa precisa saber ANTES três coisas: que a organização em SOAP é do
// produto, que a tela não cobre as páginas verdes inteiras, e que recarregar descarta tudo.
// Dizê-las ao fim seria dizê-las tarde.
//
// Todo o texto vem do DOMÍNIO, e a tela não reescreve nenhum: é o mesmo mecanismo anti-drift
// da 017, e é o que impede que a promessa exibida divirja da que o motor carrega no registro.
import { Heading, Text } from "@primer/react";
import {
  NOTA_FICHAS_AUSENTES,
  NOTA_NADA_E_SALVO,
  NOTA_ORGANIZACAO_EM_SOAP,
  NOTA_SUPRESSAO_DE_CAMPO,
  REFERENCIAS_DA_CONSULTA,
} from "models/puericultura/consulta/fonte-clinica";

/** RF-13: o aviso vem no topo, sem rolagem, porque é o que muda o comportamento de quem lê. */
export function AvisoDeNaoPersistencia() {
  return (
    <p className="nota-campo" role="note">
      {NOTA_NADA_E_SALVO}
    </p>
  );
}

export function ProvenienciaDaConsulta() {
  return (
    <section
      className="referencias-complementares"
      aria-labelledby="proveniencia-consulta-titulo"
    >
      <Heading as="h2" id="proveniencia-consulta-titulo">
        Proveniência e limites desta ficha
      </Heading>
      <Text as="p" size="small">
        {NOTA_ORGANIZACAO_EM_SOAP}
      </Text>
      <Text as="p" size="small">
        {NOTA_FICHAS_AUSENTES}
      </Text>
      <Text as="p" size="small">
        {NOTA_SUPRESSAO_DE_CAMPO}
      </Text>
      <Text as="p" size="small">
        Cobertura da fonte: {REFERENCIAS_DA_CONSULTA.cobertura.localizacao}.
      </Text>
      <Text as="p" size="small">
        Fonte: {REFERENCIAS_DA_CONSULTA.cobertura.versaoEdicao}.
      </Text>
    </section>
  );
}
