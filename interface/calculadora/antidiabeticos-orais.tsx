"use client";
// Bloco de antidiabéticos orais (feature 001-integrar-design-claude: RF-01/RF-02;
// D-03/D-07): dose diária de metformina e TFG, ambos opcionais, com validação no
// blur espelhada nas faixas únicas do motor (`CONSTANTES.plausibilidade`, D-09).
// Feature 004: campos em componentes Primer (RF-02); rótulos e mensagens intocados.
import { FormControl, TextInput } from "@primer/react";
import { CONSTANTES } from "models/insulina/fonte-clinica";
import { ErroDeCampo } from "./erro-de-campo";
import { interpretaDecimal } from "./validacao-campos";

const FAIXAS = CONSTANTES.plausibilidade;

export function erroDaDoseMetformina(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) return null; // opcional: vazio = não informado (RF-01)
  if (Number.isNaN(valor))
    return "Dose de metformina inválida: use apenas números.";
  if (
    valor < FAIXAS.metforminaMgDia.min ||
    valor > FAIXAS.metforminaMgDia.max
  ) {
    return `Dose de metformina fora da faixa plausível: entre ${FAIXAS.metforminaMgDia.min} e ${FAIXAS.metforminaMgDia.max} mg/dia.`;
  }
  return null;
}

export function erroDaTfg(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) return null; // opcional: vazio = não informado (RF-02)
  if (Number.isNaN(valor)) return "TFG inválida: use apenas números.";
  if (valor < FAIXAS.tfg.min || valor > FAIXAS.tfg.max) {
    return `TFG fora da faixa plausível: entre ${FAIXAS.tfg.min} e ${FAIXAS.tfg.max} mL/min/1,73 m².`;
  }
  return null;
}

export interface PropsAntidiabeticosOrais {
  prefixo: string;
  doseMetforminaBruta: string;
  tfgBruta: string;
  erros: Record<string, string>;
  onMudancaMetformina: (valorBruto: string) => void;
  onMudancaTfg: (valorBruto: string) => void;
  onBlurMetformina: () => void;
  onBlurTfg: () => void;
}

export function AntidiabeticosOrais({
  doseMetforminaBruta,
  tfgBruta,
  erros,
  onMudancaMetformina,
  onMudancaTfg,
  onBlurMetformina,
  onBlurTfg,
}: PropsAntidiabeticosOrais) {
  return (
    <fieldset className="grupo-campos">
      <legend>Antidiabéticos orais e função renal</legend>
      <div className="campo">
        <FormControl>
          <FormControl.Label>
            Dose atual de metformina (mg/dia) — opcional
          </FormControl.Label>
          <TextInput
            inputMode="decimal"
            value={doseMetforminaBruta}
            validationStatus={erros.metformina ? "error" : undefined}
            onChange={(e) => onMudancaMetformina(e.target.value)}
            onBlur={onBlurMetformina}
          />
        </FormControl>
        <ErroDeCampo mensagem={erros.metformina} />
      </div>
      <div className="campo">
        <FormControl>
          <FormControl.Label>TFG (mL/min/1,73 m²) — opcional</FormControl.Label>
          <TextInput
            inputMode="decimal"
            value={tfgBruta}
            validationStatus={erros.tfg ? "error" : undefined}
            onChange={(e) => onMudancaTfg(e.target.value)}
            onBlur={onBlurTfg}
          />
        </FormControl>
        <ErroDeCampo mensagem={erros.tfg} />
      </div>
    </fieldset>
  );
}
