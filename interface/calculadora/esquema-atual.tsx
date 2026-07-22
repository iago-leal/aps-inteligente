"use client";
// Fieldset do esquema atual de insulina (titulação). Extraído de formulario.tsx
// na feature 001-integrar-design-claude (D-07: manter cada arquivo ≤ 400 linhas).
// O estado permanece no formulário; aqui vive apenas a apresentação.
// Feature 004: campos e botões em componentes Primer (RF-02); rótulos intocados.
import { Button, FormControl, Select, TextInput } from "@primer/react";
import type { MomentoAplicacao, NomeInsulina } from "models/insulina/tipos";
import { ErroDeCampo } from "./erro-de-campo";

export interface LinhaAplicacao {
  id: number;
  insulina: NomeInsulina;
  momento: MomentoAplicacao;
  doseBruta: string;
}

const MOMENTOS_APLICACAO: ReadonlyArray<{
  valor: MomentoAplicacao;
  rotulo: string;
}> = [
  { valor: "antes_cafe", rotulo: "Antes do café" },
  { valor: "antes_almoco", rotulo: "Antes do almoço" },
  { valor: "antes_jantar", rotulo: "Antes do jantar" },
  { valor: "ao_deitar", rotulo: "Ao deitar" },
];

export function derivaTipoEsquema(aplicacoes: readonly LinhaAplicacao[]) {
  const prandiais = aplicacoes.filter((a) => a.insulina === "Regular").length;
  if (prandiais === 0) return "basal" as const;
  if (prandiais === 1) return "basal-plus" as const;
  return "basal-bolus" as const;
}

export interface PropsEsquemaAtual {
  prefixo: string;
  aplicacoes: readonly LinhaAplicacao[];
  erros: Record<string, string>;
  onMudanca: (id: number, patch: Partial<Omit<LinhaAplicacao, "id">>) => void;
  onRemover: (id: number) => void;
  onAdicionar: () => void;
  onBlurDose: (linha: LinhaAplicacao) => void;
}

export function EsquemaAtual({
  aplicacoes,
  erros,
  onMudanca,
  onRemover,
  onAdicionar,
  onBlurDose,
}: PropsEsquemaAtual) {
  return (
    <fieldset className="grupo-campos">
      <legend>Esquema atual de insulina</legend>
      <ErroDeCampo mensagem={erros.esquema} />
      {aplicacoes.map((linha, indice) => (
        <div key={linha.id} className="linha-dinamica">
          <div className="campo">
            <FormControl>
              <FormControl.Label>Insulina</FormControl.Label>
              <Select
                value={linha.insulina}
                onChange={(e) =>
                  onMudanca(linha.id, {
                    insulina: e.target.value as NomeInsulina,
                  })
                }
              >
                <Select.Option value="NPH">NPH</Select.Option>
                <Select.Option value="Regular">Regular</Select.Option>
              </Select>
            </FormControl>
          </div>
          <div className="campo">
            <FormControl>
              <FormControl.Label>Momento da aplicação</FormControl.Label>
              <Select
                value={linha.momento}
                onChange={(e) =>
                  onMudanca(linha.id, {
                    momento: e.target.value as MomentoAplicacao,
                  })
                }
              >
                {MOMENTOS_APLICACAO.map((m) => (
                  <Select.Option key={m.valor} value={m.valor}>
                    {m.rotulo}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="campo">
            <FormControl>
              <FormControl.Label>Dose (UI)</FormControl.Label>
              <TextInput
                inputMode="numeric"
                value={linha.doseBruta}
                validationStatus={
                  erros[`dose-${linha.id}`] ? "error" : undefined
                }
                onChange={(e) =>
                  onMudanca(linha.id, { doseBruta: e.target.value })
                }
                onBlur={() => onBlurDose(linha)}
              />
            </FormControl>
          </div>
          {aplicacoes.length > 1 ? (
            <Button type="button" onClick={() => onRemover(linha.id)}>
              Remover aplicação {indice + 1}
            </Button>
          ) : null}
          <ErroDeCampo mensagem={erros[`dose-${linha.id}`]} />
        </div>
      ))}
      <div>
        <Button type="button" onClick={onAdicionar}>
          Adicionar aplicação
        </Button>
      </div>
    </fieldset>
  );
}
