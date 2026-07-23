"use client";
// Formulário da avaliação de dor torácica (feature 010: RF-01..RF-07, RF-09;
// RN-09): idade, sexo, as três características do Quadro 1, fatores de risco e os
// dois desvios (impedimento da ergometria, sinais de instabilidade). Validação de
// idade no blur espelhando as faixas únicas do motor (CONSTANTES de
// models/cardiopatia-isquemica); a coleta total de ofensores é do motor.
import { Button, Checkbox, FormControl, Radio, TextInput } from "@primer/react";
import { useState } from "react";
import { CONSTANTES } from "models/cardiopatia-isquemica/fonte-clinica";
import type {
  EntradaAvaliacao,
  FatorDeRisco,
  Sexo,
} from "models/cardiopatia-isquemica/tipos";
import { ErroDeCampo } from "interface/calculadora/erro-de-campo";

const { idadePlausivel } = CONSTANTES;

const FATORES: readonly { id: FatorDeRisco; rotulo: string }[] = [
  { id: "diabetes", rotulo: "Diabetes" },
  { id: "tabagismo", rotulo: "Tabagismo" },
  { id: "hipertensao", rotulo: "Hipertensão" },
  { id: "dislipidemia", rotulo: "Dislipidemia" },
];

export function erroDeIdade(bruto: string): string | null {
  if (bruto === "") return null;
  const valor = Number(bruto);
  if (
    !Number.isInteger(valor) ||
    valor < idadePlausivel.min ||
    valor > idadePlausivel.max
  ) {
    return `Idade fora da faixa plausível: informe um inteiro entre ${idadePlausivel.min} e ${idadePlausivel.max}.`;
  }
  return null;
}

export interface PropsFormularioCardiologia {
  onCalcular: (entrada: EntradaAvaliacao) => void;
  onAlteracao?: () => void;
}

export function FormularioCardiologia({
  onCalcular,
  onAlteracao,
}: PropsFormularioCardiologia) {
  const [idadeBruta, setIdadeBruta] = useState("");
  const [sexo, setSexo] = useState("");
  const [retroesternal, setRetroesternal] = useState(false);
  const [esforco, setEsforco] = useState(false);
  const [alivio, setAlivio] = useState(false);
  const [fatores, setFatores] = useState<Set<FatorDeRisco>>(new Set());
  const [impedimento, setImpedimento] = useState(false);
  const [instabilidade, setInstabilidade] = useState(false);
  const [erroIdade, setErroIdade] = useState<string | undefined>(undefined);

  function alterou<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      onAlteracao?.();
    };
  }

  function alternaFator(id: FatorDeRisco) {
    setFatores((atuais) => {
      const proximos = new Set(atuais);
      if (proximos.has(id)) proximos.delete(id);
      else proximos.add(id);
      return proximos;
    });
    onAlteracao?.();
  }

  function aoSubmeter(evento: React.FormEvent) {
    evento.preventDefault();
    const entrada: EntradaAvaliacao = {
      idadeAnos: idadeBruta === "" ? Number.NaN : Number(idadeBruta),
      sexo: sexo as Sexo,
      caracteristicas: {
        retroesternal,
        provocadaPorEsforcoOuEstresse: esforco,
        aliviaComRepousoOuNitrato: alivio,
      },
      fatoresDeRisco: [...fatores],
      impedimentoErgometria: impedimento,
      sinaisInstabilidade: instabilidade,
    };
    onCalcular(entrada);
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter} noValidate>
      <fieldset className="grupo-campos">
        <legend>Paciente</legend>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Idade (anos)</FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={idadeBruta}
              validationStatus={erroIdade ? "error" : undefined}
              onChange={(e) => alterou(setIdadeBruta)(e.target.value)}
              onBlur={() => setErroIdade(erroDeIdade(idadeBruta) ?? undefined)}
            />
          </FormControl>
          <ErroDeCampo mensagem={erroIdade} />
        </div>
        <fieldset className="campo-radios">
          <legend>Sexo</legend>
          <FormControl>
            <Radio
              name="sexo"
              value="masculino"
              checked={sexo === "masculino"}
              onChange={() => alterou(setSexo)("masculino")}
            />
            <FormControl.Label>Masculino</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio
              name="sexo"
              value="feminino"
              checked={sexo === "feminino"}
              onChange={() => alterou(setSexo)("feminino")}
            />
            <FormControl.Label>Feminino</FormControl.Label>
          </FormControl>
        </fieldset>
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Características da dor (Quadro 1)</legend>
        <FormControl>
          <Checkbox
            checked={retroesternal}
            onChange={(e) => alterou(setRetroesternal)(e.target.checked)}
          />
          <FormControl.Label>Desconforto ou dor retroesternal</FormControl.Label>
        </FormControl>
        <FormControl>
          <Checkbox
            checked={esforco}
            onChange={(e) => alterou(setEsforco)(e.target.checked)}
          />
          <FormControl.Label>
            Provocada por exercício ou estresse emocional
          </FormControl.Label>
        </FormControl>
        <FormControl>
          <Checkbox
            checked={alivio}
            onChange={(e) => alterou(setAlivio)(e.target.checked)}
          />
          <FormControl.Label>
            Alívio rápido (≈1 min) com repouso ou nitrato
          </FormControl.Label>
        </FormControl>
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Fatores de risco</legend>
        {FATORES.map((fator) => (
          <FormControl key={fator.id}>
            <Checkbox
              checked={fatores.has(fator.id)}
              onChange={() => alternaFator(fator.id)}
            />
            <FormControl.Label>{fator.rotulo}</FormControl.Label>
          </FormControl>
        ))}
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Sinais clínicos adicionais</legend>
        <FormControl>
          <Checkbox
            checked={impedimento}
            onChange={(e) => alterou(setImpedimento)(e.target.checked)}
          />
          <FormControl.Label>
            ECG basal altera a interpretação da ergometria ou o paciente não pode
            exercitar-se
          </FormControl.Label>
        </FormControl>
        <FormControl>
          <Checkbox
            checked={instabilidade}
            onChange={(e) => alterou(setInstabilidade)(e.target.checked)}
          />
          <FormControl.Label>
            Sinais de angina instável ou dor aguda (repouso, início recente, em
            crescendo)
          </FormControl.Label>
        </FormControl>
      </fieldset>

      <Button type="submit" variant="primary">
        Avaliar
      </Button>
    </form>
  );
}
