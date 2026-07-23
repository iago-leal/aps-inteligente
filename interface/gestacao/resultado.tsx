"use client";
// Painel de resultado da idade gestacional (feature 007: RF-01/RF-02/RF-04/RF-07/RF-09;
// RN-11): datações por método, comparação com destaque quando a DUM sai da margem,
// referências e notas — SEM ritual de revisão (D-08: datação não prescreve).
// Erros do motor exibidos como valores; falha inesperada tem painel honesto.
import { Button, Flash, Heading, Text } from "@primer/react";
import type {
  DatacaoCalculada,
  DatacaoPorUltrassom,
  ErroValidacao,
  ResultadoDatacao,
} from "models/gestacao/tipos";

export type EstadoIg =
  | { estado: "vazio" }
  | { estado: "sucesso"; saida: ResultadoDatacao }
  | { estado: "erro"; saida: ErroValidacao }
  | { estado: "falha-inesperada" };

function dataBr(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function igPorExtenso(semanas: number, dias: number): string {
  const s = `${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
  const d = `${dias} ${dias === 1 ? "dia" : "dias"}`;
  return `${s} e ${d}`;
}

function BlocoDatacao({
  titulo,
  datacao,
}: {
  titulo: string;
  datacao: DatacaoCalculada | DatacaoPorUltrassom;
}) {
  return (
    <section className="bloco-datacao">
      <Heading as="h3">{titulo}</Heading>
      <Text as="p" className="dado-clinico">
        Idade gestacional: {igPorExtenso(datacao.ig.semanas, datacao.ig.dias)} —{" "}
        {datacao.trimestre}.º trimestre
      </Text>
      <Text as="p" className="dado-clinico">
        Data provável do parto: {dataBr(datacao.dpp)}
      </Text>
      {"dumEquivalente" in datacao ? (
        <Text as="p">DUM equivalente: {dataBr(datacao.dumEquivalente)}</Text>
      ) : null}
    </section>
  );
}

export interface PropsPainelIdadeGestacional {
  estado: EstadoIg;
  desatualizado: boolean;
  onNovoCalculo: () => void;
}

export function PainelIdadeGestacional({
  estado,
  desatualizado,
  onNovoCalculo,
}: PropsPainelIdadeGestacional) {
  if (estado.estado === "vazio") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Text as="p">
          Informe a DUM, o último ultrassom, ou ambos, e calcule.
        </Text>
      </aside>
    );
  }

  if (estado.estado === "falha-inesperada") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Flash variant="danger" role="alert">
          Falha inesperada na calculadora. Não use os valores desta tela;
          recarregue a página e refaça o cálculo.
        </Flash>
        <Button type="button" onClick={onNovoCalculo}>
          Novo cálculo
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
        <Button type="button" onClick={onNovoCalculo}>
          Novo cálculo
        </Button>
      </aside>
    );
  }

  const { saida } = estado;
  return (
    <aside className="painel-resultado" aria-label="Resultado">
      {desatualizado ? (
        <Flash variant="warning">
          Resultado desatualizado: os dados foram editados após o cálculo.
          Calcule novamente.
        </Flash>
      ) : null}

      <Heading as="h2">Idade gestacional</Heading>
      <Text as="p">
        Calculada na data de referência {dataBr(saida.dataReferencia)}.
      </Text>

      {saida.porDum ? (
        <BlocoDatacao titulo="Pela DUM" datacao={saida.porDum} />
      ) : null}
      {saida.porUltrassom ? (
        <BlocoDatacao titulo="Pelo ultrassom" datacao={saida.porUltrassom} />
      ) : null}

      {saida.comparacao ? (
        <Flash
          variant={
            saida.comparacao.veredito === "dum-fora-da-margem"
              ? "warning"
              : "default"
          }
          className="bloco-comparacao"
        >
          {saida.comparacao.mensagem}
        </Flash>
      ) : null}

      <section className="bloco-notas">
        {saida.notas.map((nota) => (
          <Text as="p" key={nota.tipo} size="small">
            {nota.mensagem}
          </Text>
        ))}
      </section>

      <section className="bloco-fonte">
        <Heading as="h3">Fonte clínica</Heading>
        <ul>
          {saida.referencias.map((referencia) => (
            <li key={referencia.localizacao}>
              Guia Rápido Pré-Natal — SMS-Rio, {referencia.versaoEdicao} ·{" "}
              {referencia.localizacao}
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" onClick={onNovoCalculo}>
        Novo cálculo
      </Button>
    </aside>
  );
}
