"use client";
// Identificação da consulta (feature 020: RF-02, RN-05, RN-12): sexo, data de nascimento,
// data da consulta e idade gestacional ao nascer. Molde do formulário da feature 017, com
// duas diferenças que esta tela impõe.
//
//  1. **Nenhum campo identifica a criança** (RN-12). Sem nome, prontuário, documento ou
//     endereço: o vínculo com a pessoa é feito pelo prontuário onde o texto será colado.
//  2. **As duas idades aparecem lado a lado no pré-termo** (RN-05), cada uma rotulada. A
//     ficha se sugere pela CRONOLÓGICA, porque é ela que rege o calendário de acompanhamento
//     e o vacinal, ao passo que a corrigida rege a leitura da curva. Exibir só a que governa
//     esconderia do prescritor a outra metade de `MD-0011`.
//
// Nenhum cálculo mora aqui: as idades vêm de `derivarIdades` da 017, e a prosa da idade vem
// de `descreverIdade` do domínio da consulta. A tela não reimplementa aritmética de datas.
import { FormControl, Radio, TextInput } from "@primer/react";
import { FAIXAS_DE_PLAUSIBILIDADE } from "models/puericultura/fonte-clinica";
import { descreverIdade } from "models/puericultura/consulta/registro";
import type { ContextoDaConsulta } from "models/puericultura/consulta/tipos";

export interface PropsIdentificacao {
  sexo: string;
  nascimento: string;
  consulta: string;
  igSemanas: string;
  igDias: string;
  onSexo: (v: string) => void;
  onNascimento: (v: string) => void;
  onConsulta: (v: string) => void;
  onIgSemanas: (v: string) => void;
  onIgDias: (v: string) => void;
  /** Ausente enquanto faltar sexo ou uma das duas datas: sem elas não há idade. */
  contexto: ContextoDaConsulta | null;
}

/** RN-05: as duas idades, cada uma rotulada, e a que governou dita por extenso. */
function BlocoDeIdades({ contexto }: { contexto: ContextoDaConsulta }) {
  const { idades } = contexto;
  const corrigidaVale =
    idades.correcaoAtiva && idades.diasCorrigidos !== idades.diasDeVida;

  return (
    <div className="consulta-idades">
      <p>
        <span className="consulta-idade-rotulo">Idade cronológica: </span>
        {descreverIdade(idades.diasDeVida)}
      </p>
      {corrigidaVale ? (
        <p>
          <span className="consulta-idade-rotulo">Idade corrigida: </span>
          {descreverIdade(idades.diasCorrigidos)}
        </p>
      ) : null}
    </div>
  );
}

export function IdentificacaoDaConsulta({
  sexo,
  nascimento,
  consulta,
  igSemanas,
  igDias,
  onSexo,
  onNascimento,
  onConsulta,
  onIgSemanas,
  onIgDias,
  contexto,
}: PropsIdentificacao) {
  return (
    <section className="formulario" aria-labelledby="consulta-identificacao">
      <h2 id="consulta-identificacao">Identificação da consulta</h2>
      <p className="nota-campo">
        Nenhum campo identifica a criança: a ficha registra achado clínico, e o
        vínculo com a pessoa é do prontuário onde o texto será colado.
      </p>

      <div className="consulta-identificacao">
        <fieldset className="campo-radios">
          <legend>Sexo</legend>
          <FormControl>
            <Radio
              name="sexo"
              value="masculino"
              checked={sexo === "masculino"}
              onChange={() => onSexo("masculino")}
            />
            <FormControl.Label>Masculino</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio
              name="sexo"
              value="feminino"
              checked={sexo === "feminino"}
              onChange={() => onSexo("feminino")}
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
              onChange={(e) => onNascimento(e.target.value)}
            />
          </FormControl>
        </div>

        <div className="campo">
          <FormControl>
            <FormControl.Label>Data da consulta</FormControl.Label>
            <TextInput
              type="date"
              value={consulta}
              onChange={(e) => onConsulta(e.target.value)}
            />
          </FormControl>
        </div>

        <div className="campo">
          <FormControl>
            <FormControl.Label>
              Idade gestacional ao nascer: semanas
            </FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={igSemanas}
              onChange={(e) => onIgSemanas(e.target.value)}
            />
            <FormControl.Caption>
              Em branco, a criança é tratada como nascida a termo. Mínimo{" "}
              {FAIXAS_DE_PLAUSIBILIDADE.idadeGestacionalSemanas.min} semanas.
            </FormControl.Caption>
          </FormControl>
        </div>

        <div className="campo">
          <FormControl>
            <FormControl.Label>
              Idade gestacional ao nascer: dias
            </FormControl.Label>
            <TextInput
              inputMode="numeric"
              value={igDias}
              onChange={(e) => onIgDias(e.target.value)}
            />
          </FormControl>
        </div>
      </div>

      {contexto === null ? (
        <p className="nota-campo">
          Informe o sexo e as duas datas para que a ficha da idade seja
          sugerida.
        </p>
      ) : (
        <BlocoDeIdades contexto={contexto} />
      )}
    </section>
  );
}
