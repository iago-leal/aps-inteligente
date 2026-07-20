"use client";
// Fieldset do esquema atual de insulina (titulação). Extraído de formulario.tsx
// na feature 001-integrar-design-claude (D-07: manter cada arquivo ≤ 400 linhas).
// O estado permanece no formulário; aqui vive apenas a apresentação.
import type { MomentoAplicacao, NomeInsulina } from "models/insulina/tipos";

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
  prefixo,
  aplicacoes,
  erros,
  onMudanca,
  onRemover,
  onAdicionar,
  onBlurDose,
}: PropsEsquemaAtual) {
  return (
    <fieldset>
      <legend>Esquema atual de insulina</legend>
      {erros.esquema ? (
        <p role="alert" className="erro-campo">
          {erros.esquema}
        </p>
      ) : null}
      {aplicacoes.map((linha, indice) => (
        <div key={linha.id} className="linha-dinamica">
          <div className="campo">
            <label htmlFor={`${prefixo}-insulina-${linha.id}`}>Insulina</label>
            <select
              id={`${prefixo}-insulina-${linha.id}`}
              value={linha.insulina}
              onChange={(e) =>
                onMudanca(linha.id, {
                  insulina: e.target.value as NomeInsulina,
                })
              }
            >
              <option value="NPH">NPH</option>
              <option value="Regular">Regular</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor={`${prefixo}-aplicacao-${linha.id}`}>
              Momento da aplicação
            </label>
            <select
              id={`${prefixo}-aplicacao-${linha.id}`}
              value={linha.momento}
              onChange={(e) =>
                onMudanca(linha.id, {
                  momento: e.target.value as MomentoAplicacao,
                })
              }
            >
              {MOMENTOS_APLICACAO.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor={`${prefixo}-dose-${linha.id}`}>Dose (UI)</label>
            <input
              id={`${prefixo}-dose-${linha.id}`}
              inputMode="numeric"
              value={linha.doseBruta}
              aria-invalid={erros[`dose-${linha.id}`] ? "true" : undefined}
              onChange={(e) =>
                onMudanca(linha.id, { doseBruta: e.target.value })
              }
              onBlur={() => onBlurDose(linha)}
            />
          </div>
          {aplicacoes.length > 1 ? (
            <button
              type="button"
              className="botao botao-terciario"
              onClick={() => onRemover(linha.id)}
            >
              Remover aplicação {indice + 1}
            </button>
          ) : null}
          {erros[`dose-${linha.id}`] ? (
            <p role="alert" className="erro-campo">
              {erros[`dose-${linha.id}`]}
            </p>
          ) : null}
        </div>
      ))}
      <div>
        <button
          type="button"
          className="botao botao-secundario"
          onClick={onAdicionar}
        >
          Adicionar aplicação
        </button>
      </div>
    </fieldset>
  );
}
