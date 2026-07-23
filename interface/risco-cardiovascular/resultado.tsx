"use client";
// Painel de resultado da estimativa de risco cardiovascular (feature 014:
// RF-06..RF-10; RN-06/RN-09): risco percentual, categoria, avisos de clamp, nota de
// proveniência e referências — cada saída com fonte. O motor apenas INFORMA: NENHUMA
// conduta é emitida (ADR 0005). Erros do motor exibidos como valores; falha
// inesperada tem painel honesto (EC-07). Molde do painel da cardiopatia (feature 010).
import { Button, Flash, Heading, Label, Text } from "@primer/react";
import type {
  CategoriaRisco,
  EntradaInvalida,
  ForaDoEscopoDaFonte,
  ResultadoEstimativa,
} from "models/risco-cardiovascular/tipos";
import { NotaDeProveniencia } from "./proveniencia";

export type EstadoRiscoCardiovascular =
  | { estado: "vazio" }
  | { estado: "sucesso"; saida: ResultadoEstimativa }
  | { estado: "fora-do-escopo"; saida: ForaDoEscopoDaFonte }
  | { estado: "erro"; saida: EntradaInvalida }
  | { estado: "falha-inesperada" };

const ROTULO_CATEGORIA: Record<CategoriaRisco, string> = {
  baixo: "Baixo (< 5%)",
  limitrofe: "Limítrofe (5 a < 7,5%)",
  intermediario: "Intermediário (7,5 a < 20%)",
  alto: "Alto (≥ 20%)",
};

const VARIANTE_CATEGORIA: Record<
  CategoriaRisco,
  "success" | "attention" | "severe" | "danger"
> = {
  baixo: "success",
  limitrofe: "attention",
  intermediario: "severe",
  alto: "danger",
};

export interface PropsPainelRiscoCardiovascular {
  estado: EstadoRiscoCardiovascular;
  desatualizado: boolean;
  onNovaEstimativa: () => void;
}

export function PainelRiscoCardiovascular({
  estado,
  desatualizado,
  onNovaEstimativa,
}: PropsPainelRiscoCardiovascular) {
  if (estado.estado === "vazio") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Text as="p">
          Informe sexo, raça, idade, os exames e os fatores de risco, e estime o
          risco cardiovascular em 10 anos.
        </Text>
      </aside>
    );
  }

  if (estado.estado === "falha-inesperada") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Flash variant="danger" role="alert">
          Falha inesperada na calculadora. Não use os valores desta tela;
          recarregue a página e refaça a estimativa.
        </Flash>
        <Button type="button" onClick={onNovaEstimativa}>
          Nova estimativa
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
              Pooled Cohort Equations (ACC/AHA 2013) ·{" "}
              {estado.saida.referencia.localizacao}
            </li>
          </ul>
        </section>
        <Button type="button" onClick={onNovaEstimativa}>
          Nova estimativa
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
        <Button type="button" onClick={onNovaEstimativa}>
          Nova estimativa
        </Button>
      </aside>
    );
  }

  const { saida } = estado;
  return (
    <aside className="painel-resultado" aria-label="Resultado">
      {desatualizado ? (
        <Flash variant="warning">
          Resultado desatualizado: os dados foram editados após a estimativa.
          Estime novamente.
        </Flash>
      ) : null}

      {saida.avisos.map((aviso) => (
        <Flash key={aviso.codigo} variant="warning" role="alert">
          {aviso.mensagem}
        </Flash>
      ))}

      <Heading as="h2">Risco de ASCVD em 10 anos: {saida.riscoPct.toFixed(1)}%</Heading>

      <Text as="p" className="dado-clinico">
        Categoria de risco:{" "}
        <Label variant={VARIANTE_CATEGORIA[saida.categoria]}>
          {ROTULO_CATEGORIA[saida.categoria]}
        </Label>
      </Text>

      <NotaDeProveniencia />

      <section className="bloco-fonte">
        <Heading as="h3">Fonte clínica</Heading>
        <ul>
          {saida.referencias.map((referencia) => (
            <li key={referencia.localizacao}>
              Pooled Cohort Equations (ACC/AHA 2013) · {referencia.localizacao}
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" onClick={onNovaEstimativa}>
        Nova estimativa
      </Button>
    </aside>
  );
}
