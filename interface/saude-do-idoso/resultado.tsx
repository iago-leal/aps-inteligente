"use client";
// Painel de resultado do rastreamento de depressão na pessoa idosa (feature 023:
// RF-04, RF-04b, RF-05, RF-07, RF-08): escore, faixa na redação da fonte, providência,
// advertência de rastreamento e referências — cada saída com a sua origem à vista.
// Erros do motor exibidos como valores; falha inesperada tem painel honesto (EC-07).
//
// A PROVIDÊNCIA APARECE EM TODA FAIXA, e nenhum número desta tela decide quando (D-06). A
// fonte diz "escores elevados" e não quantifica; se este painel a exibisse só a partir de
// certo escore, o corte seria nosso com aparência de citação.
//
// OS NÚMEROS DA FAIXA VÊM DO DOMÍNIO, e a tela não guarda segunda cópia deles (regra 10 do
// `domain.md`): o que se lê aqui é o que o motor devolveu.
import { Button, Flash, Heading, Label, Text } from "@primer/react";
import { FAIXAS } from "models/depressao-geriatrica/classificacao";
import {
  NOME_PUBLICADO,
  REFERENCIA_BIBLIOGRAFICA_DA_FONTE,
} from "models/depressao-geriatrica/fonte-clinica";
import type {
  EntradaInvalida,
  ResultadoDaEscala,
} from "models/depressao-geriatrica/tipos";

export type EstadoDepressaoGeriatrica =
  | { estado: "vazio" }
  | { estado: "sucesso"; saida: ResultadoDaEscala }
  | { estado: "erro"; saida: EntradaInvalida }
  | { estado: "falha-inesperada" };

/** Apresentação, e não domínio: a ordem das faixas é que dá o tom, do neutro ao severo. */
const VARIANTE_DA_FAIXA: readonly ("success" | "attention" | "danger")[] = [
  "success",
  "attention",
  "danger",
];

function varianteDe(de: number): "success" | "attention" | "danger" {
  const indice = FAIXAS.findIndex((faixa) => faixa.de === de);
  return VARIANTE_DA_FAIXA[indice] ?? "attention";
}

export interface PropsPainelDepressaoGeriatrica {
  estado: EstadoDepressaoGeriatrica;
  desatualizado: boolean;
  onNovaAvaliacao: () => void;
}

export function PainelDepressaoGeriatrica({
  estado,
  desatualizado,
  onNovaAvaliacao,
}: PropsPainelDepressaoGeriatrica) {
  if (estado.estado === "vazio") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Text as="p">
          Responda aos quinze itens da escala e calcule o escore.
        </Text>
      </aside>
    );
  }

  if (estado.estado === "falha-inesperada") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Flash variant="danger" role="alert">
          Falha inesperada na calculadora. Não use os valores desta tela;
          recarregue a página e refaça a avaliação.
        </Flash>
        <Button type="button" onClick={onNovaAvaliacao}>
          Nova avaliação
        </Button>
      </aside>
    );
  }

  if (estado.estado === "erro") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Heading as="h2">Escala incompleta</Heading>
        <Text as="p">
          Nenhum escore é exibido enquanto houver item sem resposta: a escala
          somada pela metade produz número que parece resultado e não é.
        </Text>
        <ul className="lista-ofensores">
          {estado.saida.ofensores.map((ofensor) => (
            <li key={ofensor.campo} role="alert">
              {ofensor.mensagem}
            </li>
          ))}
        </ul>
        <Button type="button" onClick={onNovaAvaliacao}>
          Nova avaliação
        </Button>
      </aside>
    );
  }

  const { saida } = estado;
  return (
    <aside className="painel-resultado" aria-label="Resultado">
      {desatualizado ? (
        <Flash variant="warning">
          Resultado desatualizado: as respostas foram editadas após o cálculo.
          Calcule novamente.
        </Flash>
      ) : null}

      {saida.advertencias.map((advertencia) => (
        <Flash key={advertencia.tipo} variant="warning">
          {advertencia.mensagem}
        </Flash>
      ))}

      <Heading as="h2">{saida.escore} de 15 pontos</Heading>

      <Text as="p" className="dado-clinico">
        <Label variant={varianteDe(saida.faixa.de)}>{saida.faixa.rotulo}</Label>
      </Text>
      <Text as="p" size="small" className="gds-corte">
        Faixa da fonte: {`${saida.faixa.de} a ${saida.faixa.ate} pontos.`}
      </Text>

      <section className="gds-providencia">
        <Heading as="h3">Providência recomendada pela fonte</Heading>
        <Text as="p">{saida.providencia.texto}</Text>
      </section>

      <section className="bloco-fonte">
        <Heading as="h3">Fonte clínica</Heading>
        <ul>
          {saida.referencias.map((referencia) => (
            <li key={referencia.localizacao}>
              {NOME_PUBLICADO} · {referencia.localizacao}
            </li>
          ))}
        </ul>
        <Text as="p" size="small" className="gds-referencia-da-fonte">
          {REFERENCIA_BIBLIOGRAFICA_DA_FONTE}
        </Text>
      </section>

      <Button type="button" onClick={onNovaAvaliacao}>
        Nova avaliação
      </Button>
    </aside>
  );
}
