"use client";
// Painel de resultado da avaliação de dor torácica (feature 010: RF-01..RF-07,
// RF-09; RN-09): classificação, probabilidade pré-teste (base e faixa ajustada),
// estrato, conduta e advertências — cada saída com referência à fonte. Erros do
// motor exibidos como valores; falha inesperada tem painel honesto (EC-07).
import { Button, Flash, Heading, Label, Text } from "@primer/react";
import type {
  ClassificacaoDor,
  EntradaInvalida,
  Estrato,
  ForaDoEscopoDaFonte,
  ResultadoAvaliacao,
} from "models/cardiopatia-isquemica/tipos";

export type EstadoCardiologia =
  | { estado: "vazio" }
  | { estado: "sucesso"; saida: ResultadoAvaliacao }
  | { estado: "fora-do-escopo"; saida: ForaDoEscopoDaFonte }
  | { estado: "erro"; saida: EntradaInvalida }
  | { estado: "falha-inesperada" };

const ROTULO_DOR: Record<ClassificacaoDor, string> = {
  tipica: "Angina típica",
  atipica: "Angina atípica",
  "nao-anginosa": "Dor não anginosa",
};

const ROTULO_ESTRATO: Record<Estrato, string> = {
  baixa: "Baixa",
  intermediaria: "Intermediária",
  alta: "Alta",
};

const VARIANTE_ESTRATO: Record<Estrato, "success" | "attention" | "danger"> = {
  baixa: "success",
  intermediaria: "attention",
  alta: "danger",
};

function BlocoProbabilidade({ saida }: { saida: ResultadoAvaliacao }) {
  const { probabilidadeAjustada: aj } = saida;
  return (
    <section className="bloco-probabilidade">
      <Text as="p" className="dado-clinico">
        Probabilidade pré-teste (base): {saida.probabilidadeBasePct}%
      </Text>
      {aj ? (
        <Text as="p" className="dado-clinico">
          Ajustada por fatores de risco: {aj.minPct}% a {aj.maxPct}%
          {aj.excedeAlta ? " (pode ultrapassar 90%)" : ""}
        </Text>
      ) : null}
    </section>
  );
}

export interface PropsPainelCardiologia {
  estado: EstadoCardiologia;
  desatualizado: boolean;
  onNovaAvaliacao: () => void;
}

export function PainelCardiologia({
  estado,
  desatualizado,
  onNovaAvaliacao,
}: PropsPainelCardiologia) {
  if (estado.estado === "vazio") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Text as="p">
          Informe idade, sexo, as características da dor e os fatores de risco, e
          avalie.
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

  if (estado.estado === "fora-do-escopo") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Heading as="h2">Fora do escopo da fonte</Heading>
        <Flash variant="warning">{estado.saida.mensagem}</Flash>
        <section className="bloco-fonte">
          <Heading as="h3">Fonte clínica</Heading>
          <ul>
            <li>
              TeleCondutas — Cardiopatia Isquêmica ·{" "}
              {estado.saida.referencia.localizacao}
            </li>
          </ul>
        </section>
        <Button type="button" onClick={onNovaAvaliacao}>
          Nova avaliação
        </Button>
      </aside>
    );
  }

  if (estado.estado === "erro") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Heading as="h2">Entrada incompleta ou implausível</Heading>
        <ul className="lista-ofensores">
          {estado.saida.ofensores.map((ofensor) => (
            <li key={`${ofensor.campo}:${ofensor.codigo}`} role="alert">
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
          Resultado desatualizado: os dados foram editados após a avaliação.
          Avalie novamente.
        </Flash>
      ) : null}

      {saida.advertencias.map((advertencia) => (
        <Flash key={advertencia.tipo} variant="danger" role="alert">
          {advertencia.mensagem}
        </Flash>
      ))}

      <Heading as="h2">{ROTULO_DOR[saida.classificacaoDor]}</Heading>

      <BlocoProbabilidade saida={saida} />

      <Text as="p" className="dado-clinico">
        Estrato de probabilidade:{" "}
        <Label variant={VARIANTE_ESTRATO[saida.estrato]}>
          {ROTULO_ESTRATO[saida.estrato]}
        </Label>
      </Text>

      <section className="bloco-conduta">
        <Heading as="h3">Conduta</Heading>
        <Text as="p">{saida.conduta.texto}</Text>
        {saida.conduta.causasNaoCardiacas ? (
          <>
            <Text as="p" size="small">
              Investigar causas não cardíacas:
            </Text>
            <ul className="lista-causas">
              {saida.conduta.causasNaoCardiacas.map((causa) => (
                <li key={causa}>{causa}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="bloco-fonte">
        <Heading as="h3">Fonte clínica</Heading>
        <ul>
          {saida.referencias.map((referencia) => (
            <li key={referencia.localizacao}>
              TeleCondutas — Cardiopatia Isquêmica · {referencia.localizacao}
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" onClick={onNovaAvaliacao}>
        Nova avaliação
      </Button>
    </aside>
  );
}
