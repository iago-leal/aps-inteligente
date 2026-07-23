"use client";
// Formulário da calculadora de idade gestacional (feature 007: RF-01..RF-03, RF-09;
// RN-05): DUM e ultrassom opcionais — entrada dupla permitida (RN-11) —, com
// validação no blur espelhada nas faixas únicas do motor (CONSTANTES de
// models/gestacao). A coleta total de ofensores é do motor; aqui só o espelho.
import { Button, FormControl, TextInput } from "@primer/react";
import { useState } from "react";
import { CONSTANTES } from "models/gestacao/fonte-clinica";
import type { EntradaDatacao } from "models/gestacao/tipos";
import { ErroDeCampo } from "interface/calculadora/erro-de-campo";

const FAIXAS = CONSTANTES.plausibilidade;

export function erroDeSemanasNoExame(bruto: string): string | null {
  if (bruto === "") return null;
  const valor = Number(bruto);
  if (
    !Number.isInteger(valor) ||
    valor < FAIXAS.igLaudoSemanas.min ||
    valor > FAIXAS.igLaudoSemanas.max
  ) {
    return `Semanas do laudo fora da faixa: informe um inteiro entre ${FAIXAS.igLaudoSemanas.min} e ${FAIXAS.igLaudoSemanas.max}.`;
  }
  return null;
}

export function erroDeDiasNoExame(bruto: string): string | null {
  if (bruto === "") return null;
  const valor = Number(bruto);
  if (
    !Number.isInteger(valor) ||
    valor < FAIXAS.igLaudoDias.min ||
    valor > FAIXAS.igLaudoDias.max
  ) {
    return `Dias do laudo fora da faixa: informe um inteiro entre ${FAIXAS.igLaudoDias.min} e ${FAIXAS.igLaudoDias.max}.`;
  }
  return null;
}

export interface PropsFormularioIdadeGestacional {
  dataDeHoje: string;
  onCalcular: (entrada: EntradaDatacao) => void;
  onAlteracao?: () => void;
}

export function FormularioIdadeGestacional({
  dataDeHoje,
  onCalcular,
  onAlteracao,
}: PropsFormularioIdadeGestacional) {
  const [dumBruta, setDumBruta] = useState("");
  const [dataExameBruta, setDataExameBruta] = useState("");
  const [semanasBrutas, setSemanasBrutas] = useState("");
  const [diasBrutos, setDiasBrutos] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  function validaNoBlur(campo: string, erro: string | null) {
    setErros((atuais) => {
      const proximos = { ...atuais };
      if (erro === null) delete proximos[campo];
      else proximos[campo] = erro;
      return proximos;
    });
  }

  function muda(setter: (v: string) => void) {
    return (valor: string) => {
      setter(valor);
      onAlteracao?.();
    };
  }

  function aoSubmeter(evento: React.FormEvent) {
    evento.preventDefault();
    const temUltrassom =
      dataExameBruta !== "" || semanasBrutas !== "" || diasBrutos !== "";
    const entrada: EntradaDatacao = {
      dataReferencia: dataDeHoje,
      ...(dumBruta !== "" ? { dum: dumBruta } : {}),
      ...(temUltrassom
        ? {
            ultrassom: {
              ...(dataExameBruta !== "" ? { dataExame: dataExameBruta } : {}),
              ...(semanasBrutas !== ""
                ? { semanas: Number(semanasBrutas) }
                : {}),
              ...(diasBrutos !== "" ? { dias: Number(diasBrutos) } : {}),
            },
          }
        : {}),
    };
    onCalcular(entrada);
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter} noValidate>
      <fieldset className="grupo-campos">
        <legend>Datação pela menstruação</legend>
        <div className="campo">
          <FormControl>
            <FormControl.Label>
              Data da última menstruação (DUM)
            </FormControl.Label>
            <TextInput
              type="date"
              value={dumBruta}
              onChange={(e) => muda(setDumBruta)(e.target.value)}
            />
          </FormControl>
        </div>
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Datação pelo último ultrassom</legend>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Data do exame</FormControl.Label>
            <TextInput
              type="date"
              value={dataExameBruta}
              onChange={(e) => muda(setDataExameBruta)(e.target.value)}
            />
          </FormControl>
        </div>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Semanas no exame</FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={semanasBrutas}
              validationStatus={erros.semanas ? "error" : undefined}
              onChange={(e) => muda(setSemanasBrutas)(e.target.value)}
              onBlur={() =>
                validaNoBlur("semanas", erroDeSemanasNoExame(semanasBrutas))
              }
            />
          </FormControl>
          <ErroDeCampo mensagem={erros.semanas} />
        </div>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Dias no exame</FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={diasBrutos}
              validationStatus={erros.dias ? "error" : undefined}
              onChange={(e) => muda(setDiasBrutos)(e.target.value)}
              onBlur={() => validaNoBlur("dias", erroDeDiasNoExame(diasBrutos))}
            />
          </FormControl>
          <ErroDeCampo mensagem={erros.dias} />
        </div>
      </fieldset>

      <Button type="submit" variant="primary">
        Calcular
      </Button>
    </form>
  );
}
