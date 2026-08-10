"use client";
// Renderização da ficha de consulta (feature 020: RF-04, RF-05, RF-17; D-05, D-06, D-11).
//
// UM COMPONENTE POR NATUREZA DE CAMPO, e não um `switch` de cento e vinte linhas: as dez
// fichas repetem a mesma anatomia, e é a repetição que mantém cada função abaixo do teto de
// 50 linhas do mantenedor. As quatro naturezas vêm da FONTE — marcação de sim ou não, escolha
// entre opções impressas, número com unidade e texto livre —, e não de uma taxonomia nossa.
//
// A ACESSIBILIDADE DA FICHA LONGA (RF-17). Cada seção numerada é um `fieldset` com `legend`,
// e cada campo de marcação ou escolha é um `fieldset` aninhado cujo `legend` é o rótulo
// impresso: é o que dá ao leitor de tela a pergunta antes das respostas, numa tela em que a
// pergunta é o dado clínico. Os cabeçalhos seguem a hierarquia da fonte, sem salto de nível.
//
// A tela NÃO decide o que exibir: `camposAplicaveis` e `rotuloDoCampo` moram no domínio, e a
// supressão de `MD-0026` está declarada no dado (D-05). Aqui só se desenha.
import type { ReactNode } from "react";
import { FormControl, Radio, TextInput, Textarea } from "@primer/react";
import {
  camposAplicaveis,
  rotuloDoCampo,
} from "models/puericultura/consulta/selecao";
import type {
  Campo,
  CampoDeEscolha,
  CampoDeMarcacao,
  CampoDeMedida,
  CampoDeTexto,
  Ficha,
  Preenchimento,
  Resposta,
  SecaoDaFicha,
} from "models/puericultura/consulta/tipos";
import type { Sexo } from "models/puericultura/tipos";

export interface PropsDeCampo<T extends Campo> {
  campo: T;
  rotulo: string;
  resposta: Resposta | undefined;
  onResposta: (resposta: Resposta | undefined) => void;
}

/** A orientação que a fonte imprime ao lado do campo; ausente na maioria deles. */
function Orientacao({ campo }: { campo: Campo }) {
  if (campo.orientacao === undefined) return null;
  return <p className="nota-campo">{campo.orientacao}</p>;
}

function CampoMarcacao({
  campo,
  rotulo,
  resposta,
  onResposta,
}: PropsDeCampo<CampoDeMarcacao>) {
  const marcada = resposta?.natureza === "marcacao" ? resposta.valor : "";
  return (
    <fieldset className="campo-radios consulta-campo">
      <legend>{rotulo}</legend>
      <Orientacao campo={campo} />
      <div className="consulta-campo-opcoes">
        <FormControl>
          <Radio
            name={campo.id}
            value="nao"
            checked={marcada === "nao"}
            onChange={() => onResposta({ natureza: "marcacao", valor: "nao" })}
          />
          <FormControl.Label>Não</FormControl.Label>
        </FormControl>
        <FormControl>
          <Radio
            name={campo.id}
            value="sim"
            checked={marcada === "sim"}
            onChange={() => onResposta({ natureza: "marcacao", valor: "sim" })}
          />
          <FormControl.Label>Sim</FormControl.Label>
        </FormControl>
      </div>
    </fieldset>
  );
}

function CampoEscolha({
  campo,
  rotulo,
  resposta,
  onResposta,
}: PropsDeCampo<CampoDeEscolha>) {
  const escolhida = resposta?.natureza === "escolha" ? resposta : undefined;
  return (
    <fieldset className="campo-radios consulta-campo">
      <legend>{rotulo}</legend>
      <Orientacao campo={campo} />
      <div className="consulta-campo-opcoes">
        {campo.opcoes.map((opcao) => (
          <FormControl key={opcao}>
            <Radio
              name={campo.id}
              value={opcao}
              checked={escolhida?.opcao === opcao}
              onChange={() =>
                onResposta({
                  natureza: "escolha",
                  opcao,
                  ...(escolhida?.complemento === undefined
                    ? {}
                    : { complemento: escolhida.complemento }),
                })
              }
            />
            <FormControl.Label>{opcao}</FormControl.Label>
          </FormControl>
        ))}
      </div>
      {campo.aceitaComplemento && escolhida !== undefined ? (
        <FormControl>
          <FormControl.Label>Complemento</FormControl.Label>
          <TextInput
            value={escolhida.complemento ?? ""}
            onChange={(e) =>
              onResposta({
                natureza: "escolha",
                opcao: escolhida.opcao,
                complemento: e.target.value,
              })
            }
          />
        </FormControl>
      ) : null}
    </fieldset>
  );
}

function CampoMedida({
  campo,
  rotulo,
  resposta,
  onResposta,
}: PropsDeCampo<CampoDeMedida>) {
  const bruto = resposta?.natureza === "medida" ? resposta.bruto : "";
  return (
    <div className="campo consulta-campo">
      <FormControl>
        <FormControl.Label>{`${rotulo} (${campo.unidade})`}</FormControl.Label>
        <TextInput
          inputMode="decimal"
          value={bruto}
          onChange={(e) =>
            onResposta(
              e.target.value === ""
                ? undefined
                : { natureza: "medida", bruto: e.target.value },
            )
          }
        />
      </FormControl>
      <Orientacao campo={campo} />
    </div>
  );
}

function CampoTexto({
  campo,
  rotulo,
  resposta,
  onResposta,
}: PropsDeCampo<CampoDeTexto>) {
  const texto = resposta?.natureza === "texto" ? resposta.texto : "";
  return (
    <div className="campo consulta-campo">
      <FormControl>
        <FormControl.Label>{rotulo}</FormControl.Label>
        <Textarea
          rows={2}
          value={texto}
          onChange={(e) =>
            onResposta(
              e.target.value === ""
                ? undefined
                : { natureza: "texto", texto: e.target.value },
            )
          }
        />
      </FormControl>
      <Orientacao campo={campo} />
    </div>
  );
}

function CampoDaFicha(props: PropsDeCampo<Campo>) {
  const { campo } = props;
  switch (campo.natureza) {
    case "marcacao":
      return <CampoMarcacao {...props} campo={campo} />;
    case "escolha":
      return <CampoEscolha {...props} campo={campo} />;
    case "medida":
      return <CampoMedida {...props} campo={campo} />;
    case "texto":
      return <CampoTexto {...props} campo={campo} />;
  }
}

export interface PropsFichaPreenchivel {
  ficha: Ficha;
  sexo: Sexo;
  preenchimento: Preenchimento;
  onResposta: (idDoCampo: string, resposta: Resposta | undefined) => void;
  /**
   * Ponto de extensão CEGO (BUG-20260728-C6LN): o que a função devolver entra ao fim do
   * quadro, depois dos campos. A ficha não sabe o que recebe, e continua sem conhecer
   * comando algum da aplicação — quem decide em qual seção pendurar o quê é quem compõe a
   * tela. Sem a prop, a ficha desenha exatamente o que desenhava antes.
   */
  rodapeDaSecao?: (secao: SecaoDaFicha) => ReactNode;
}

export function FichaPreenchivel({
  ficha,
  sexo,
  preenchimento,
  onResposta,
  rodapeDaSecao,
}: PropsFichaPreenchivel) {
  return (
    <section className="consulta-ficha" aria-label={ficha.titulo}>
      {ficha.secoes.map((secao) => (
        <fieldset key={secao.numero} className="consulta-secao">
          <legend>{`${secao.numero}. ${secao.titulo}`}</legend>
          {camposAplicaveis(secao, sexo).map((campo) => (
            <CampoDaFicha
              key={campo.id}
              campo={campo}
              rotulo={rotuloDoCampo(campo, sexo)}
              resposta={preenchimento.get(campo.id)}
              onResposta={(resposta) => onResposta(campo.id, resposta)}
            />
          ))}
          {rodapeDaSecao?.(secao)}
        </fieldset>
      ))}
    </section>
  );
}
