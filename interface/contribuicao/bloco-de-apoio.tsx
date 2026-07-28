"use client";
// Bloco de apoio ao pé da home (feature 019: RF-05/RF-11; RN-01/RN-08).
// Fica SÓ na home, fora de toda tela de decisão clínica: conduta exibida ao lado
// de pedido de contribuição convida à leitura de conflito de interesse, e a
// separação é editorial antes de ser estética (MD-0022).
//
// O painel entra por IMPORT DINÂMICO, e não por import estático (RNF de
// desempenho). Montá-lo só quando aberto não bastava: o import estático punha o
// Dialog do Primer e a biblioteca do QR no primeiro carregamento da home, o que a
// medição de bundle flagrou em quase 15 kB gzip para uma tela que a maioria das
// visitas nunca abre. Com o import tardio, esse código só chega ao navegador de
// quem aciona o comando, e nenhuma requisição de dado acompanha o chunk.
import { useRef, useState } from "react";
import { Button, Heading, Text } from "@primer/react";
import dynamic from "next/dynamic";
import type { copiarParaAreaDeTransferencia } from "interface/calculadora/area-de-transferencia";

const PainelContribuicao = dynamic(
  () => import("./painel").then((modulo) => modulo.PainelContribuicao),
  { ssr: false },
);

export interface PropsBlocoDeApoio {
  /** Injetável nos testes (D-08). */
  copiar?: typeof copiarParaAreaDeTransferencia;
}

export function BlocoDeApoio({ copiar }: PropsBlocoDeApoio) {
  const [aberto, setAberto] = useState(false);
  const refDoComando = useRef<HTMLButtonElement>(null);

  return (
    <section className="contribuicao-bloco" aria-labelledby="apoio-titulo">
      <Heading as="h2" id="apoio-titulo">
        Apoie a plataforma
      </Heading>
      <Text as="p">
        A APS Inteligente é mantida por uma pessoa só e não tem anúncio,
        cadastro nem plano pago. Se ela poupa seu tempo na consulta, você pode
        contribuir com o valor que quiser, por PIX.
      </Text>
      <Button ref={refDoComando} type="button" onClick={() => setAberto(true)}>
        Contribuir por PIX
      </Button>
      {aberto ? (
        <PainelContribuicao
          aoFechar={() => setAberto(false)}
          refDeRetorno={refDoComando}
          copiar={copiar}
        />
      ) : null}
    </section>
  );
}
