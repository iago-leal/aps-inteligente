"use client";
// Painel de resultado da avaliação do crescimento infantil (feature 017: RF-11,
// RF-20, RF-21; D-13): um bloco por índice, com escore z de uma casa decimal e sinal
// sempre explícito, classificação literal da caderneta, padrão de referência, idade
// que indexou a curva e página do gráfico. O motor apenas INFORMA: nenhuma conduta é
// emitida (ADR 0005, RN-12). Erros do motor são exibidos como valores; exceção fora
// do contrato produz painel honesto (RF-21). Molde do painel da 014.
//
// Duas escolhas de apresentação que evitam duplicar regra clínica na tela:
//
//  1. **O título do bloco usa a forma neutra** "Comprimento/estatura para a idade".
//     O substantivo correto para a idade — "Comprimento" antes dos 2 anos, "Estatura"
//     a partir daí — já vem no rótulo literal que o domínio devolve. Escrevê-lo aqui
//     obrigaria a tela a reimplementar a fronteira dos 730 dias.
//  2. **O escore é formatado, nunca recalculado.** O valor não arredondado permanece
//     no objeto de saída (D-13); a casa decimal é decisão de leitura, não de cálculo.
import { Button, Flash, Heading, Label, Text } from "@primer/react";
import type {
  ErroValidacao,
  ForaDoEscopoDaFonte,
  Indice,
  IndiceAntropometrico,
  IndiceAusente,
  IndiceCalculado,
  IndiceForaDoEscopo,
  IdadeUsada,
  ResultadoAvaliacao,
} from "models/puericultura/tipos";

export type EstadoCrescimento =
  | { estado: "vazio" }
  | { estado: "sucesso"; saida: ResultadoAvaliacao }
  | { estado: "fora-do-escopo"; saida: ForaDoEscopoDaFonte }
  | { estado: "erro"; saida: ErroValidacao }
  | { estado: "falha-inesperada" };

const TITULO_DO_INDICE: Readonly<Record<Indice, string>> = Object.freeze({
  "peso-idade": "Peso para a idade",
  "comprimento-estatura-idade": "Comprimento/estatura para a idade",
  "imc-idade": "IMC para a idade",
  "perimetro-cefalico-idade": "Perímetro cefálico para a idade",
});

const MOTIVO_DE_AUSENCIA: Readonly<Record<IndiceAusente["motivo"], string>> =
  Object.freeze({
    MEDIDA_NAO_INFORMADA: "Medida não informada.",
    IMC_INEXISTENTE_NO_PRETERMO:
      "As curvas de pré-termo (INTERGROWTH-21st) não publicam IMC: o índice não existe nesta faixa, e a sua falta não é erro.",
  });

/** D-13: uma casa decimal e sinal sempre explícito — inclusive no zero. */
export function formatarEscoreZ(escoreZ: number): string {
  const arredondado = Number(escoreZ.toFixed(1));
  const sinal = arredondado < 0 ? "−" : "+";
  return `${sinal}${Math.abs(arredondado).toFixed(1)}`;
}

/** RF-20: qual idade indexou a curva, em prosa curta e auditável. */
export function descreverIdadeUsada(idade: IdadeUsada): string {
  const unidade = idade.unidade === "dia" ? "dias" : "semanas";
  const nome =
    idade.especie === "cronologica"
      ? "idade cronológica"
      : idade.especie === "corrigida"
        ? "idade corrigida"
        : "idade pós-menstrual";
  const desconto =
    idade.descontoDeSemanas === undefined
      ? ""
      : ` (desconto de ${idade.descontoDeSemanas} semanas de prematuridade)`;
  return `${nome}: ${idade.valor} ${unidade}${desconto}`;
}

function BlocoCalculado({ indice }: { indice: IndiceCalculado }) {
  return (
    <section className="indice" aria-labelledby={`indice-${indice.indice}`}>
      <Heading as="h3" id={`indice-${indice.indice}`}>
        {TITULO_DO_INDICE[indice.indice]}
      </Heading>
      <Text as="p" className="dado-clinico">
        Escore z: {formatarEscoreZ(indice.escoreZ)} ·{" "}
        <Label>{indice.classificacao}</Label>
      </Text>
      {indice.avisos.map((aviso) => (
        <Flash key={aviso.codigo} variant="warning" role="alert">
          {aviso.mensagem}
        </Flash>
      ))}
      <Text as="p" size="small" className="procedencia-indice">
        Padrão: {indice.padrao} · {descreverIdadeUsada(indice.idadeUsada)} ·{" "}
        {indice.referencia.localizacao}
      </Text>
    </section>
  );
}

function BlocoAusente({ indice }: { indice: IndiceAusente }) {
  return (
    <section
      className="indice indice-ausente"
      aria-labelledby={`indice-${indice.indice}`}
    >
      <Heading as="h3" id={`indice-${indice.indice}`}>
        {TITULO_DO_INDICE[indice.indice]}
      </Heading>
      <Text as="p">Não calculado. {MOTIVO_DE_AUSENCIA[indice.motivo]}</Text>
    </section>
  );
}

function BlocoForaDoEscopo({ indice }: { indice: IndiceForaDoEscopo }) {
  return (
    <section
      className="indice indice-fora-do-escopo"
      aria-labelledby={`indice-${indice.indice}`}
    >
      <Heading as="h3" id={`indice-${indice.indice}`}>
        {TITULO_DO_INDICE[indice.indice]}
      </Heading>
      <Flash variant="warning">{indice.mensagem}</Flash>
      <Text as="p" size="small" className="procedencia-indice">
        {indice.referencia.localizacao}
      </Text>
    </section>
  );
}

function BlocoDeIndice({ indice }: { indice: IndiceAntropometrico }) {
  if (indice.estado === "calculado") return <BlocoCalculado indice={indice} />;
  if (indice.estado === "ausente") return <BlocoAusente indice={indice} />;
  return <BlocoForaDoEscopo indice={indice} />;
}

export interface PropsPainelCrescimento {
  estado: EstadoCrescimento;
  desatualizado: boolean;
  onNovaAvaliacao: () => void;
}

export function PainelCrescimento({
  estado,
  desatualizado,
  onNovaAvaliacao,
}: PropsPainelCrescimento) {
  if (estado.estado === "vazio") {
    return (
      <aside className="painel-resultado" aria-label="Resultado">
        <Text as="p">
          Informe o sexo, as duas datas e ao menos uma medida para avaliar o
          crescimento pelos gráficos da Caderneta da Criança.
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
              {estado.saida.referencia.versaoEdicao} ·{" "}
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

      <Heading as="h2">Índices antropométricos</Heading>

      {saida.notas.map((nota) => (
        <Flash key={nota.tipo} variant="warning">
          {nota.mensagem}
        </Flash>
      ))}

      {saida.indices.map((indice) => (
        <BlocoDeIndice key={indice.indice} indice={indice} />
      ))}

      <section className="bloco-fonte">
        <Heading as="h3">Fonte clínica</Heading>
        <ul>
          {saida.referencias.map((referencia) => (
            <li key={referencia.localizacao}>
              {referencia.versaoEdicao} · {referencia.localizacao}
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
