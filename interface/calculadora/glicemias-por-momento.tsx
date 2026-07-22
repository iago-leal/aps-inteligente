"use client";
// Entrada de glicemias por momento de aferição (feature 001-integrar-design-claude:
// RF-04/RN-04; D-06/D-07). Quatro campos — jejum, antes do almoço, antes do jantar,
// ao deitar —, cada um com várias aferições separadas por ESPAÇO; vírgula ou ponto
// valem como decimal dentro de cada valor; campo vazio = momento não aferido; sem
// máximo de aferições. O parsing vive na UI: o domínio segue recebendo
// `GlicemiaAferida[]` inalterado (Spec Impact Matrix §4, divergência 4).
// Feature 004: campos em componentes Primer (RF-02); rótulos e mensagens intocados.
import { FormControl, Text, TextInput } from "@primer/react";
import { CONSTANTES } from "models/insulina/fonte-clinica";
import type { GlicemiaAferida, MomentoAfericao } from "models/insulina/tipos";
import { ErroDeCampo } from "./erro-de-campo";
import { interpretaDecimal } from "./validacao-campos";

export const MOMENTOS_AFERICAO: ReadonlyArray<{
  valor: MomentoAfericao;
  rotulo: string;
}> = [
  { valor: "jejum", rotulo: "Jejum" },
  { valor: "antes_almoco", rotulo: "Antes do almoço (AA)" },
  { valor: "antes_jantar", rotulo: "Antes do jantar (AJ)" },
  { valor: "ao_deitar", rotulo: "Ao deitar (AD)" },
];

export type ValoresPorMomento = Record<MomentoAfericao, string>;

export const VALORES_POR_MOMENTO_VAZIOS: ValoresPorMomento = {
  jejum: "",
  antes_almoco: "",
  antes_jantar: "",
  ao_deitar: "",
};

/** Tokeniza o campo de um momento: espaço é o único separador (RN-04). */
function tokensDoMomento(bruto: string): string[] {
  return bruto
    .trim()
    .split(/\s+/)
    .filter((t) => t !== "");
}

/** Valida o campo de um momento espelhando a faixa única do motor (RF-05). */
export function erroDasGlicemiasDoMomento(bruto: string): string | null {
  const faixa = CONSTANTES.plausibilidade.glicemiaMgDl;
  for (const token of tokensDoMomento(bruto)) {
    const valor = interpretaDecimal(token);
    if (valor === null || Number.isNaN(valor)) {
      return `Valor inválido: "${token}". Use números separados por espaço (vírgula ou ponto como decimal).`;
    }
    if (valor < faixa.min || valor > faixa.max) {
      return `Glicemia fora da faixa plausível: entre ${faixa.min} e ${faixa.max} mg/dL.`;
    }
  }
  return null;
}

/** Converte os quatro campos no contrato do domínio; campo vazio não gera aferição. */
export function paraGlicemiasAferidas(
  valores: ValoresPorMomento,
): GlicemiaAferida[] {
  const afericoes: GlicemiaAferida[] = [];
  for (const { valor: momento } of MOMENTOS_AFERICAO) {
    for (const token of tokensDoMomento(valores[momento])) {
      afericoes.push({ valorMgDl: interpretaDecimal(token)!, momento });
    }
  }
  return afericoes;
}

export function algumMomentoAferido(valores: ValoresPorMomento): boolean {
  return MOMENTOS_AFERICAO.some(({ valor }) => valores[valor].trim() !== "");
}

export interface PropsGlicemiasPorMomento {
  prefixo: string;
  valores: ValoresPorMomento;
  erros: Record<string, string>;
  onMudanca: (momento: MomentoAfericao, valorBruto: string) => void;
  onBlur: (momento: MomentoAfericao) => void;
}

export function GlicemiasPorMomento({
  valores,
  erros,
  onMudanca,
  onBlur,
}: PropsGlicemiasPorMomento) {
  return (
    <fieldset className="grupo-campos">
      <legend>Glicemias capilares por momento</legend>
      <Text as="p" size="small" className="ajuda-campo">
        Registre uma ou mais aferições por campo, separadas por espaço (ex.:
        98,5 130 210). Deixe em branco o momento não aferido.
      </Text>
      {MOMENTOS_AFERICAO.map(({ valor: momento, rotulo }) => {
        const chave = `glicemias-${momento}`;
        return (
          <div key={momento} className="campo">
            <FormControl>
              <FormControl.Label>{rotulo} (mg/dL)</FormControl.Label>
              <TextInput
                inputMode="decimal"
                value={valores[momento]}
                validationStatus={erros[chave] ? "error" : undefined}
                onChange={(e) => onMudanca(momento, e.target.value)}
                onBlur={() => onBlur(momento)}
              />
            </FormControl>
            <ErroDeCampo mensagem={erros[chave]} />
          </div>
        );
      })}
    </fieldset>
  );
}
