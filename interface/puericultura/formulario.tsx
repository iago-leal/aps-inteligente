"use client";
// Formulário da avaliação do crescimento infantil (feature 017: RF-11, RF-16;
// RN-09, RN-11): sexo, data de nascimento, data da medição, peso,
// comprimento/estatura com a POSIÇÃO explícita, perímetro cefálico e idade
// gestacional ao nascer. Molde do formulário da 014, com três diferenças que a
// feature impõe:
//
//  1. **Campo vazio é ausência, não erro** (RF-06). Na 014 todo campo é obrigatório
//     e o vazio vira `NaN` para o motor recusar; aqui a falta de uma medida apenas
//     suprime o índice que dela depende, então o vazio vira `undefined`. Só o texto
//     não-numérico produz `NaN`, e esse o motor recusa como digitação inválida.
//  2. **A posição da medição não tem default** (RN-09): nenhum rádio nasce marcado.
//     Supor "deitado" erraria por 0,7 cm em silêncio na medida que o escore consome.
//  3. **A data da medição nasce preenchida com a data do dispositivo**, injetada pelo
//     contêiner (molde da 007): o motor não lê o relógio, e a UI é quem sabe que dia é.
//
// A validação no blur espelha FAIXAS_DE_PLAUSIBILIDADE do domínio, sem redefini-las;
// a coleta total dos ofensores continua sendo do motor, que revalida tudo.
import { Button, FormControl, Radio, TextInput } from "@primer/react";
import { useState } from "react";
import { FAIXAS_DE_PLAUSIBILIDADE } from "models/puericultura/fonte-clinica";
import type {
  EntradaAvaliacao,
  PosicaoDaMedicao,
  Sexo,
} from "models/puericultura/tipos";
import { ErroDeCampo } from "interface/calculadora/erro-de-campo";

const {
  pesoKg,
  comprimentoCm,
  perimetroCefalicoCm,
  idadeGestacionalSemanas,
  idadeGestacionalDias,
} = FAIXAS_DE_PLAUSIBILIDADE;

interface FaixaFechada {
  readonly min: number;
  readonly max: number;
}

/** Campo em branco significa "não informado" (RF-06), e isso nunca é erro. */
export function erroDeMedida(
  bruto: string,
  faixa: FaixaFechada,
  nome: string,
  unidade: string,
): string | null {
  if (bruto.trim() === "") return null;
  const valor = Number(bruto.replace(",", "."));
  if (!Number.isFinite(valor) || valor <= faixa.min || valor > faixa.max) {
    return `${nome} fora da faixa plausível: informe um valor entre ${faixa.min} e ${faixa.max} ${unidade}.`;
  }
  return null;
}

export function erroDeInteiro(
  bruto: string,
  faixa: FaixaFechada,
  nome: string,
): string | null {
  if (bruto.trim() === "") return null;
  const valor = Number(bruto);
  if (!Number.isInteger(valor) || valor < faixa.min || valor > faixa.max) {
    return `${nome} fora da faixa plausível: informe um inteiro entre ${faixa.min} e ${faixa.max}.`;
  }
  return null;
}

/** Vazio → ausente (RF-06); texto não-numérico → NaN, que o motor recusa (RN-11). */
function medidaOuAusente(bruto: string): number | undefined {
  return bruto.trim() === "" ? undefined : Number(bruto.replace(",", "."));
}

/**
 * Os cinco campos numéricos do formulário têm a mesma anatomia — rótulo, entrada,
 * marca de erro e mensagem no blur —, e repeti-la cinco vezes deixava a função do
 * formulário três vezes acima do teto de 50 linhas do mantenedor.
 */
function CampoNumerico({
  rotulo,
  valor,
  erro,
  modo,
  aoMudar,
  aoSair,
}: {
  rotulo: string;
  valor: string;
  erro: string | undefined;
  modo: "decimal" | "numeric";
  aoMudar: (v: string) => void;
  aoSair: () => void;
}) {
  return (
    <div className="campo">
      <FormControl>
        <FormControl.Label>{rotulo}</FormControl.Label>
        <TextInput
          inputMode={modo}
          value={valor}
          validationStatus={erro ? "error" : undefined}
          onChange={(e) => aoMudar(e.target.value)}
          onBlur={aoSair}
        />
      </FormControl>
      <ErroDeCampo mensagem={erro} />
    </div>
  );
}

export interface PropsFormularioCrescimento {
  onAvaliar: (entrada: EntradaAvaliacao) => void;
  onAlteracao?: () => void;
  /** Data do dispositivo, do contêiner: valor inicial da data da medição (RN-10). */
  dataDeHoje: string;
}

export function FormularioCrescimento({
  onAvaliar,
  onAlteracao,
  dataDeHoje,
}: PropsFormularioCrescimento) {
  const [sexo, setSexo] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [medicao, setMedicao] = useState(dataDeHoje);
  const [pesoBruto, setPesoBruto] = useState("");
  const [comprimentoBruto, setComprimentoBruto] = useState("");
  const [posicao, setPosicao] = useState("");
  const [pcBruto, setPcBruto] = useState("");
  const [igSemanasBrutas, setIgSemanasBrutas] = useState("");
  const [igDiasBrutos, setIgDiasBrutos] = useState("");
  const [erros, setErros] = useState<Record<string, string | undefined>>({});

  function alterou<T>(setter: (v: T) => void) {
    return (valor: T) => {
      setter(valor);
      onAlteracao?.();
    };
  }

  function validaNoBlur(campo: string, mensagem: string | null) {
    setErros((anteriores) => ({
      ...anteriores,
      [campo]: mensagem ?? undefined,
    }));
  }

  /**
   * Ambos em branco significa "idade gestacional não informada" — a premissa de
   * termo que o motor declara (RN-15). Com as semanas preenchidas, dias em branco
   * conta como zero: "32 semanas" é a forma corrente de dizer "32 semanas e 0 dias".
   */
  function idadeGestacional(): EntradaAvaliacao["idadeGestacionalAoNascer"] {
    const semanasEmBranco = igSemanasBrutas.trim() === "";
    const diasEmBranco = igDiasBrutos.trim() === "";
    if (semanasEmBranco && diasEmBranco) return undefined;
    return {
      semanas: semanasEmBranco ? Number.NaN : Number(igSemanasBrutas),
      dias: diasEmBranco ? 0 : Number(igDiasBrutos),
    };
  }

  function aoSubmeter(evento: React.FormEvent) {
    evento.preventDefault();
    const comprimento = medidaOuAusente(comprimentoBruto);
    const entrada: EntradaAvaliacao = {
      sexo: sexo as Sexo,
      dataDeNascimento: nascimento,
      dataDaMedicao: medicao,
      ...(medidaOuAusente(pesoBruto) === undefined
        ? {}
        : { pesoKg: medidaOuAusente(pesoBruto) }),
      ...(comprimento === undefined ? {} : { comprimentoCm: comprimento }),
      ...(posicao === ""
        ? {}
        : { posicaoDaMedicao: posicao as PosicaoDaMedicao }),
      ...(medidaOuAusente(pcBruto) === undefined
        ? {}
        : { perimetroCefalicoCm: medidaOuAusente(pcBruto) }),
      ...(idadeGestacional() === undefined
        ? {}
        : { idadeGestacionalAoNascer: idadeGestacional() }),
    };
    onAvaliar(entrada);
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter} noValidate>
      <fieldset className="grupo-campos">
        <legend>Criança</legend>
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
        <div className="campo">
          <FormControl>
            <FormControl.Label>Data de nascimento</FormControl.Label>
            <TextInput
              type="date"
              value={nascimento}
              onChange={(e) => alterou(setNascimento)(e.target.value)}
            />
          </FormControl>
        </div>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Data da medição</FormControl.Label>
            <TextInput
              type="date"
              value={medicao}
              onChange={(e) => alterou(setMedicao)(e.target.value)}
            />
          </FormControl>
        </div>
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Medidas</legend>
        <p className="nota-campo">
          Informe ao menos uma medida. A que faltar apenas suprime o índice que
          depende dela.
        </p>
        <CampoNumerico
          rotulo="Peso (kg)"
          valor={pesoBruto}
          erro={erros.peso}
          modo="decimal"
          aoMudar={alterou(setPesoBruto)}
          aoSair={() =>
            validaNoBlur("peso", erroDeMedida(pesoBruto, pesoKg, "Peso", "kg"))
          }
        />
        <CampoNumerico
          rotulo="Comprimento/estatura (cm)"
          valor={comprimentoBruto}
          erro={erros.comprimento}
          modo="decimal"
          aoMudar={alterou(setComprimentoBruto)}
          aoSair={() =>
            validaNoBlur(
              "comprimento",
              erroDeMedida(
                comprimentoBruto,
                comprimentoCm,
                "Comprimento/estatura",
                "cm",
              ),
            )
          }
        />
        <fieldset className="campo-radios">
          <legend>Posição da medição</legend>
          <FormControl>
            <Radio
              name="posicao"
              value="deitado"
              checked={posicao === "deitado"}
              onChange={() => alterou(setPosicao)("deitado")}
            />
            <FormControl.Label>Deitado (comprimento)</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio
              name="posicao"
              value="em-pe"
              checked={posicao === "em-pe"}
              onChange={() => alterou(setPosicao)("em-pe")}
            />
            <FormControl.Label>Em pé (estatura)</FormControl.Label>
          </FormControl>
        </fieldset>
        <CampoNumerico
          rotulo="Perímetro cefálico (cm)"
          valor={pcBruto}
          erro={erros.pc}
          modo="decimal"
          aoMudar={alterou(setPcBruto)}
          aoSair={() =>
            validaNoBlur(
              "pc",
              erroDeMedida(
                pcBruto,
                perimetroCefalicoCm,
                "Perímetro cefálico",
                "cm",
              ),
            )
          }
        />
      </fieldset>

      <fieldset className="grupo-campos">
        <legend>Idade gestacional ao nascer (opcional)</legend>
        <p className="nota-campo">
          Em branco, a criança é tratada como nascida a termo e nenhuma correção
          de idade é aplicada.
        </p>
        <CampoNumerico
          rotulo="Semanas completas"
          valor={igSemanasBrutas}
          erro={erros.igSemanas}
          modo="numeric"
          aoMudar={alterou(setIgSemanasBrutas)}
          aoSair={() =>
            validaNoBlur(
              "igSemanas",
              erroDeInteiro(
                igSemanasBrutas,
                idadeGestacionalSemanas,
                "Semanas",
              ),
            )
          }
        />
        <CampoNumerico
          rotulo="Dias"
          valor={igDiasBrutos}
          erro={erros.igDias}
          modo="numeric"
          aoMudar={alterou(setIgDiasBrutos)}
          aoSair={() =>
            validaNoBlur(
              "igDias",
              erroDeInteiro(igDiasBrutos, idadeGestacionalDias, "Dias"),
            )
          }
        />
      </fieldset>

      <Button type="submit" variant="primary">
        Avaliar crescimento
      </Button>
    </form>
  );
}
