"use client";
// Formulário da estimativa de risco cardiovascular (feature 014: RF-01..RF-05,
// RF-09; RN-08): sexo, raça, idade, colesterol total, HDL, PAS, tratamento
// anti-hipertensivo, diabetes, tabagismo atual e DCV prévia. Validação de idade no
// blur espelhando a faixa plausível única do motor (FAIXAS de
// models/risco-cardiovascular); a coleta total de ofensores é do motor. Molde do
// formulário da cardiopatia (feature 010).
import { Button, Checkbox, FormControl, Radio, TextInput } from "@primer/react";
import { useState } from "react";
import { FAIXAS } from "models/risco-cardiovascular/fonte-clinica";
import type {
  EntradaEstimativa,
  Raca,
  Sexo,
} from "models/risco-cardiovascular/tipos";
import { ErroDeCampo } from "interface/calculadora/erro-de-campo";

const { idadePlausivel } = FAIXAS;

const RACAS: readonly { id: Raca; rotulo: string }[] = [
  { id: "branco", rotulo: "Branca" },
  { id: "afro-americano", rotulo: "Preta / afro-americana" },
  { id: "outra", rotulo: "Outra" },
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

export interface PropsFormularioRiscoCardiovascular {
  onCalcular: (entrada: EntradaEstimativa) => void;
  onAlteracao?: () => void;
}

function numeroOuNaN(bruto: string): number {
  return bruto === "" ? Number.NaN : Number(bruto);
}

export function FormularioRiscoCardiovascular({
  onCalcular,
  onAlteracao,
}: PropsFormularioRiscoCardiovascular) {
  const [sexo, setSexo] = useState("");
  const [raca, setRaca] = useState("");
  const [idadeBruta, setIdadeBruta] = useState("");
  const [colesterolBruto, setColesterolBruto] = useState("");
  const [hdlBruto, setHdlBruto] = useState("");
  const [pasBruta, setPasBruta] = useState("");
  const [emTratamento, setEmTratamento] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [tabagismo, setTabagismo] = useState(false);
  const [dcvPrevia, setDcvPrevia] = useState(false);
  const [erroIdade, setErroIdade] = useState<string | undefined>(undefined);

  function alterou<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      onAlteracao?.();
    };
  }

  function aoSubmeter(evento: React.FormEvent) {
    evento.preventDefault();
    const entrada: EntradaEstimativa = {
      sexo: sexo as Sexo,
      raca: raca as Raca,
      idadeAnos: numeroOuNaN(idadeBruta),
      colesterolTotalMgDl: numeroOuNaN(colesterolBruto),
      hdlMgDl: numeroOuNaN(hdlBruto),
      pasMmHg: numeroOuNaN(pasBruta),
      emTratamentoAntiHipertensivo: emTratamento,
      diabetes,
      tabagismoAtual: tabagismo,
      dcvPrevia,
    };
    onCalcular(entrada);
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter} noValidate>
      <fieldset className="grupo-campos">
        <legend>Paciente</legend>
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
        <fieldset className="campo-radios">
          <legend>Raça / cor</legend>
          {RACAS.map((opcao) => (
            <FormControl key={opcao.id}>
              <Radio
                name="raca"
                value={opcao.id}
                checked={raca === opcao.id}
                onChange={() => alterou(setRaca)(opcao.id)}
              />
              <FormControl.Label>{opcao.rotulo}</FormControl.Label>
            </FormControl>
          ))}
        </fieldset>
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
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Exames e pressão</legend>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Colesterol total (mg/dL)</FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={colesterolBruto}
              onChange={(e) => alterou(setColesterolBruto)(e.target.value)}
            />
          </FormControl>
        </div>
        <div className="campo">
          <FormControl>
            <FormControl.Label>HDL (mg/dL)</FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={hdlBruto}
              onChange={(e) => alterou(setHdlBruto)(e.target.value)}
            />
          </FormControl>
        </div>
        <div className="campo">
          <FormControl>
            <FormControl.Label>
              Pressão arterial sistólica (mmHg)
            </FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={pasBruta}
              onChange={(e) => alterou(setPasBruta)(e.target.value)}
            />
          </FormControl>
        </div>
        <FormControl>
          <Checkbox
            checked={emTratamento}
            onChange={(e) => alterou(setEmTratamento)(e.target.checked)}
          />
          <FormControl.Label>Em tratamento anti-hipertensivo</FormControl.Label>
        </FormControl>
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Fatores de risco</legend>
        <FormControl>
          <Checkbox
            checked={diabetes}
            onChange={(e) => alterou(setDiabetes)(e.target.checked)}
          />
          <FormControl.Label>Diabetes</FormControl.Label>
        </FormControl>
        <FormControl>
          <Checkbox
            checked={tabagismo}
            onChange={(e) => alterou(setTabagismo)(e.target.checked)}
          />
          <FormControl.Label>Tabagismo atual</FormControl.Label>
        </FormControl>
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Histórico cardiovascular</legend>
        <FormControl>
          <Checkbox
            checked={dcvPrevia}
            onChange={(e) => alterou(setDcvPrevia)(e.target.checked)}
          />
          <FormControl.Label>
            Doença cardiovascular já estabelecida (infarto, AVC, revascularização)
          </FormControl.Label>
        </FormControl>
      </fieldset>

      <Button type="submit" variant="primary">
        Estimar risco
      </Button>
    </form>
  );
}
