"use client";
// Formulário da calculadora (RF-05/RF-06/RF-07 do requirements; RF-01..RF-03/RF-11 da UI).
// Valida no blur com as MESMAS faixas do motor e aceita vírgula ou ponto decimal;
// nenhuma regra clínica vive aqui (RNF-05 da UI).
import { useId, useState } from "react";
import { CONSTANTES } from "@/dominio/insulina/fonte-clinica";
import type {
  EntradaCalculo,
  GlicemiaAferida,
  MomentoAfericao,
  MomentoAplicacao,
  NomeInsulina,
} from "@/dominio/insulina/tipos";

export interface PropsFormulario {
  onCalcular: (entrada: EntradaCalculo) => void;
  /** Notifica qualquer edição — o contêiner invalida o resultado vigente (EC-03 da UI). */
  onAlteracao?: () => void;
}

type Modo = "inicio" | "titulacao";

interface LinhaGlicemia {
  id: number;
  valorBruto: string;
  momento: MomentoAfericao;
}

interface LinhaAplicacao {
  id: number;
  insulina: NomeInsulina;
  momento: MomentoAplicacao;
  doseBruta: string;
}

const MOMENTOS_AFERICAO: ReadonlyArray<{
  valor: MomentoAfericao;
  rotulo: string;
}> = [
  { valor: "jejum", rotulo: "Jejum" },
  { valor: "antes_almoco", rotulo: "Antes do almoço (AA)" },
  { valor: "antes_jantar", rotulo: "Antes do jantar (AJ)" },
  { valor: "ao_deitar", rotulo: "Ao deitar (AD)" },
];

const MOMENTOS_APLICACAO: ReadonlyArray<{
  valor: MomentoAplicacao;
  rotulo: string;
}> = [
  { valor: "antes_cafe", rotulo: "Antes do café" },
  { valor: "antes_almoco", rotulo: "Antes do almoço" },
  { valor: "antes_jantar", rotulo: "Antes do jantar" },
  { valor: "ao_deitar", rotulo: "Ao deitar" },
];

/** "82,5" e "82.5" produzem o mesmo número (RF-05; EC-01 da UI). */
function interpretaDecimal(bruto: string): number | null {
  const normalizado = bruto.trim().replace(",", ".");
  if (normalizado === "") return null;
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return Number.NaN;
  return Number(normalizado);
}

const FAIXAS = CONSTANTES.plausibilidade;

function erroDoPeso(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) return "Informe o peso do paciente.";
  if (Number.isNaN(valor))
    return "Peso inválido: use apenas números (vírgula ou ponto).";
  if (valor <= 0 || valor > FAIXAS.pesoKg.max) {
    return `Peso fora da faixa plausível: maior que 0 e até ${FAIXAS.pesoKg.max} kg.`;
  }
  return null;
}

function erroDaGlicemia(bruto: string, obrigatoria: boolean): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) {
    return obrigatoria ? "Informe a glicemia ou remova esta linha." : null;
  }
  if (Number.isNaN(valor)) return "Glicemia inválida: use apenas números.";
  if (valor < FAIXAS.glicemiaMgDl.min || valor > FAIXAS.glicemiaMgDl.max) {
    return `Glicemia fora da faixa plausível: entre ${FAIXAS.glicemiaMgDl.min} e ${FAIXAS.glicemiaMgDl.max} mg/dL.`;
  }
  return null;
}

function erroDaHba1c(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) return null;
  if (Number.isNaN(valor)) return "HbA1c inválida: use apenas números.";
  if (valor < FAIXAS.hba1cPercent.min || valor > FAIXAS.hba1cPercent.max) {
    return `HbA1c fora da faixa plausível: entre ${FAIXAS.hba1cPercent.min}% e ${FAIXAS.hba1cPercent.max}%.`;
  }
  return null;
}

function erroDaDose(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  const { min, max } = CONSTANTES.dosePorAplicacaoUi;
  if (valor === null) return "Informe a dose da aplicação.";
  if (
    Number.isNaN(valor) ||
    !Number.isInteger(valor) ||
    valor < min ||
    valor > max
  ) {
    return `Dose inválida: inteira, entre ${min} e ${max} UI por aplicação.`;
  }
  return null;
}

let proximoId = 1;

export function FormularioCalculadora({
  onCalcular,
  onAlteracao,
}: PropsFormulario) {
  const prefixo = useId();
  const [modo, setModo] = useState<Modo>("inicio");
  const [pesoBruto, setPesoBruto] = useState("");
  const [hba1cBruta, setHba1cBruta] = useState("");
  const [sulfonilureia, setSulfonilureia] = useState<
    "nao_informado" | "sim" | "nao"
  >("nao_informado");
  const [glicemias, setGlicemias] = useState<LinhaGlicemia[]>([
    { id: proximoId++, valorBruto: "", momento: "jejum" },
  ]);
  const [aplicacoes, setAplicacoes] = useState<LinhaAplicacao[]>([
    { id: proximoId++, insulina: "NPH", momento: "ao_deitar", doseBruta: "" },
  ]);
  const [errosVisiveis, setErrosVisiveis] = useState<Record<string, string>>(
    {},
  );

  function registraEdicao() {
    onAlteracao?.();
  }

  function validaCampo(chave: string, erro: string | null) {
    setErrosVisiveis((atual) => {
      const proximos = { ...atual };
      if (erro) proximos[chave] = erro;
      else delete proximos[chave];
      return proximos;
    });
  }

  function validaTudo(): boolean {
    const erros: Record<string, string> = {};
    const pesoErro = erroDoPeso(pesoBruto);
    if (pesoErro) erros.peso = pesoErro;
    const hba1cErro = erroDaHba1c(hba1cBruta);
    if (hba1cErro) erros.hba1c = hba1cErro;

    const linhasPreenchidas = glicemias.filter(
      (g) => g.valorBruto.trim() !== "",
    );
    if (modo === "titulacao" && linhasPreenchidas.length === 0) {
      erros[`glicemia-${glicemias[0]?.id}`] =
        "Informe ao menos uma glicemia capilar para a titulação.";
    }
    for (const linha of glicemias) {
      const erro = erroDaGlicemia(linha.valorBruto, false);
      if (erro) erros[`glicemia-${linha.id}`] = erro;
    }

    if (modo === "titulacao") {
      if (aplicacoes.length === 0) {
        erros.esquema = "Informe o esquema de insulina atual.";
      }
      for (const linha of aplicacoes) {
        const erro = erroDaDose(linha.doseBruta);
        if (erro) erros[`dose-${linha.id}`] = erro;
      }
    }

    setErrosVisiveis(erros);
    return Object.keys(erros).length === 0;
  }

  function submeter(evento: React.FormEvent) {
    evento.preventDefault();
    if (!validaTudo()) return;

    const glicemiasValidas: GlicemiaAferida[] = glicemias
      .filter((g) => g.valorBruto.trim() !== "")
      .map((g) => ({
        valorMgDl: interpretaDecimal(g.valorBruto)!,
        momento: g.momento,
      }));

    const hba1c = interpretaDecimal(hba1cBruta);

    const entrada: EntradaCalculo = {
      modo,
      pesoKg: interpretaDecimal(pesoBruto)!,
      glicemias: glicemiasValidas,
      ...(hba1c !== null ? { hba1cPercent: hba1c } : {}),
      ...(sulfonilureia !== "nao_informado"
        ? { usoSulfonilureia: sulfonilureia === "sim" }
        : {}),
      ...(modo === "titulacao"
        ? {
            esquemaAtual: {
              tipo: derivaTipoEsquema(aplicacoes),
              aplicacoes: aplicacoes.map((a) => ({
                insulina: a.insulina,
                momento: a.momento,
                doseUi: interpretaDecimal(a.doseBruta)!,
              })),
            },
          }
        : {}),
    };

    onCalcular(entrada);
  }

  return (
    <form className="form-calculadora" onSubmit={submeter} noValidate>
      <fieldset>
        <legend>Modo de cálculo</legend>
        {(
          [
            { valor: "inicio", rotulo: "Início de insulinização" },
            { valor: "titulacao", rotulo: "Titulação de dose" },
          ] as const
        ).map((opcao) => (
          <label key={opcao.valor} className="confirmacao">
            <input
              type="radio"
              name={`${prefixo}-modo`}
              value={opcao.valor}
              checked={modo === opcao.valor}
              onChange={() => {
                setModo(opcao.valor);
                registraEdicao();
              }}
            />{" "}
            {opcao.rotulo}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Dados do paciente</legend>
        <div className="campo">
          <label htmlFor={`${prefixo}-peso`}>Peso (kg)</label>
          <input
            id={`${prefixo}-peso`}
            inputMode="decimal"
            value={pesoBruto}
            aria-invalid={errosVisiveis.peso ? "true" : undefined}
            onChange={(e) => {
              setPesoBruto(e.target.value);
              registraEdicao();
            }}
            onBlur={() => validaCampo("peso", erroDoPeso(pesoBruto))}
          />
          {errosVisiveis.peso ? (
            <p role="alert" className="erro-campo">
              {errosVisiveis.peso}
            </p>
          ) : null}
        </div>

        <div className="campo">
          <label htmlFor={`${prefixo}-hba1c`}>HbA1c (%) — opcional</label>
          <input
            id={`${prefixo}-hba1c`}
            inputMode="decimal"
            value={hba1cBruta}
            aria-invalid={errosVisiveis.hba1c ? "true" : undefined}
            onChange={(e) => {
              setHba1cBruta(e.target.value);
              registraEdicao();
            }}
            onBlur={() => validaCampo("hba1c", erroDaHba1c(hba1cBruta))}
          />
          {errosVisiveis.hba1c ? (
            <p role="alert" className="erro-campo">
              {errosVisiveis.hba1c}
            </p>
          ) : null}
        </div>

        <div className="campo">
          <label htmlFor={`${prefixo}-sulfonilureia`}>
            Uso de sulfonilureia
          </label>
          <select
            id={`${prefixo}-sulfonilureia`}
            value={sulfonilureia}
            onChange={(e) => {
              setSulfonilureia(e.target.value as typeof sulfonilureia);
              registraEdicao();
            }}
          >
            <option value="nao_informado">Não informado</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Glicemias capilares</legend>
        {glicemias.map((linha, indice) => (
          <div key={linha.id} className="linha-dinamica">
            <div className="campo">
              <label htmlFor={`${prefixo}-glicemia-${linha.id}`}>
                Glicemia (mg/dL)
              </label>
              <input
                id={`${prefixo}-glicemia-${linha.id}`}
                inputMode="decimal"
                value={linha.valorBruto}
                aria-invalid={
                  errosVisiveis[`glicemia-${linha.id}`] ? "true" : undefined
                }
                onChange={(e) => {
                  const valor = e.target.value;
                  setGlicemias((gs) =>
                    gs.map((g) =>
                      g.id === linha.id ? { ...g, valorBruto: valor } : g,
                    ),
                  );
                  registraEdicao();
                }}
                onBlur={() =>
                  validaCampo(
                    `glicemia-${linha.id}`,
                    erroDaGlicemia(linha.valorBruto, false),
                  )
                }
              />
            </div>
            <div className="campo">
              <label htmlFor={`${prefixo}-momento-${linha.id}`}>
                Momento da aferição
              </label>
              <select
                id={`${prefixo}-momento-${linha.id}`}
                value={linha.momento}
                onChange={(e) => {
                  const momento = e.target.value as MomentoAfericao;
                  setGlicemias((gs) =>
                    gs.map((g) => (g.id === linha.id ? { ...g, momento } : g)),
                  );
                  registraEdicao();
                }}
              >
                {MOMENTOS_AFERICAO.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.rotulo}
                  </option>
                ))}
              </select>
            </div>
            {glicemias.length > 1 ? (
              <button
                type="button"
                className="botao botao-terciario"
                onClick={() => {
                  setGlicemias((gs) => gs.filter((g) => g.id !== linha.id));
                  registraEdicao();
                }}
              >
                Remover glicemia {indice + 1}
              </button>
            ) : null}
            {errosVisiveis[`glicemia-${linha.id}`] ? (
              <p role="alert" className="erro-campo">
                {errosVisiveis[`glicemia-${linha.id}`]}
              </p>
            ) : null}
          </div>
        ))}
        <div>
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => {
              setGlicemias((gs) => [
                ...gs,
                { id: proximoId++, valorBruto: "", momento: "jejum" },
              ]);
              registraEdicao();
            }}
          >
            Adicionar glicemia
          </button>
        </div>
      </fieldset>

      {modo === "titulacao" ? (
        <fieldset>
          <legend>Esquema atual de insulina</legend>
          {errosVisiveis.esquema ? (
            <p role="alert" className="erro-campo">
              {errosVisiveis.esquema}
            </p>
          ) : null}
          {aplicacoes.map((linha, indice) => (
            <div key={linha.id} className="linha-dinamica">
              <div className="campo">
                <label htmlFor={`${prefixo}-insulina-${linha.id}`}>
                  Insulina
                </label>
                <select
                  id={`${prefixo}-insulina-${linha.id}`}
                  value={linha.insulina}
                  onChange={(e) => {
                    const insulina = e.target.value as NomeInsulina;
                    setAplicacoes((as) =>
                      as.map((a) =>
                        a.id === linha.id ? { ...a, insulina } : a,
                      ),
                    );
                    registraEdicao();
                  }}
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
                  onChange={(e) => {
                    const momento = e.target.value as MomentoAplicacao;
                    setAplicacoes((as) =>
                      as.map((a) =>
                        a.id === linha.id ? { ...a, momento } : a,
                      ),
                    );
                    registraEdicao();
                  }}
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
                  aria-invalid={
                    errosVisiveis[`dose-${linha.id}`] ? "true" : undefined
                  }
                  onChange={(e) => {
                    const doseBruta = e.target.value;
                    setAplicacoes((as) =>
                      as.map((a) =>
                        a.id === linha.id ? { ...a, doseBruta } : a,
                      ),
                    );
                    registraEdicao();
                  }}
                  onBlur={() =>
                    validaCampo(`dose-${linha.id}`, erroDaDose(linha.doseBruta))
                  }
                />
              </div>
              {aplicacoes.length > 1 ? (
                <button
                  type="button"
                  className="botao botao-terciario"
                  onClick={() => {
                    setAplicacoes((as) => as.filter((a) => a.id !== linha.id));
                    registraEdicao();
                  }}
                >
                  Remover aplicação {indice + 1}
                </button>
              ) : null}
              {errosVisiveis[`dose-${linha.id}`] ? (
                <p role="alert" className="erro-campo">
                  {errosVisiveis[`dose-${linha.id}`]}
                </p>
              ) : null}
            </div>
          ))}
          <div>
            <button
              type="button"
              className="botao botao-secundario"
              onClick={() => {
                setAplicacoes((as) => [
                  ...as,
                  {
                    id: proximoId++,
                    insulina: "NPH",
                    momento: "ao_deitar",
                    doseBruta: "",
                  },
                ]);
                registraEdicao();
              }}
            >
              Adicionar aplicação
            </button>
          </div>
        </fieldset>
      ) : null}

      <div>
        <button type="submit" className="botao botao-primario">
          Calcular
        </button>
      </div>
    </form>
  );
}

function derivaTipoEsquema(aplicacoes: readonly LinhaAplicacao[]) {
  const prandiais = aplicacoes.filter((a) => a.insulina === "Regular").length;
  if (prandiais === 0) return "basal" as const;
  if (prandiais === 1) return "basal-plus" as const;
  return "basal-bolus" as const;
}
