"use client";
// Formulário da calculadora (RF-05/RF-06/RF-07 do requirements; RF-01..RF-03/RF-11 da UI).
// Feature 001-integrar-design-claude: entrada de glicemias por momento (RF-04) e
// bloco de antidiabéticos orais (RF-01/RF-02), compostos como subcomponentes (D-07).
// Valida no blur com as MESMAS faixas do motor e aceita vírgula ou ponto decimal;
// nenhuma regra clínica vive aqui (RNF-05 da UI).
import { useId, useState } from "react";
import type { EntradaCalculo, MomentoAfericao } from "models/insulina/tipos";
import {
  AntidiabeticosOrais,
  erroDaDoseMetformina,
  erroDaTfg,
} from "./antidiabeticos-orais";
import {
  derivaTipoEsquema,
  EsquemaAtual,
  type LinhaAplicacao,
} from "./esquema-atual";
import {
  algumMomentoAferido,
  erroDasGlicemiasDoMomento,
  GlicemiasPorMomento,
  paraGlicemiasAferidas,
  VALORES_POR_MOMENTO_VAZIOS,
  type ValoresPorMomento,
} from "./glicemias-por-momento";
import {
  erroDaDose,
  erroDaHba1c,
  erroDoPeso,
  interpretaDecimal,
} from "./validacao-campos";

export interface PropsFormulario {
  onCalcular: (entrada: EntradaCalculo) => void;
  /** Notifica qualquer edição — o contêiner invalida o resultado vigente (EC-03 da UI). */
  onAlteracao?: () => void;
}

type Modo = "inicio" | "titulacao";

let proximoId = 1;

export function FormularioCalculadora({
  onCalcular,
  onAlteracao,
}: PropsFormulario) {
  const prefixo = useId();
  const [modo, setModo] = useState<Modo>("inicio");
  const [pesoBruto, setPesoBruto] = useState("");
  const [hba1cBruta, setHba1cBruta] = useState("");
  const [doseMetforminaBruta, setDoseMetforminaBruta] = useState("");
  const [tfgBruta, setTfgBruta] = useState("");
  const [sulfonilureia, setSulfonilureia] = useState<
    "nao_informado" | "sim" | "nao"
  >("nao_informado");
  const [glicemias, setGlicemias] = useState<ValoresPorMomento>(
    VALORES_POR_MOMENTO_VAZIOS,
  );
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
    const metforminaErro = erroDaDoseMetformina(doseMetforminaBruta);
    if (metforminaErro) erros.metformina = metforminaErro;
    const tfgErro = erroDaTfg(tfgBruta);
    if (tfgErro) erros.tfg = tfgErro;

    for (const momento of Object.keys(glicemias) as MomentoAfericao[]) {
      const erro = erroDasGlicemiasDoMomento(glicemias[momento]);
      if (erro) erros[`glicemias-${momento}`] = erro;
    }
    if (modo === "titulacao" && !algumMomentoAferido(glicemias)) {
      erros["glicemias-jejum"] =
        "Informe ao menos uma glicemia capilar para a titulação.";
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

    const hba1c = interpretaDecimal(hba1cBruta);
    const doseMetformina = interpretaDecimal(doseMetforminaBruta);
    const tfg = interpretaDecimal(tfgBruta);

    const entrada: EntradaCalculo = {
      modo,
      pesoKg: interpretaDecimal(pesoBruto)!,
      glicemias: paraGlicemiasAferidas(glicemias),
      ...(hba1c !== null ? { hba1cPercent: hba1c } : {}),
      ...(doseMetformina !== null
        ? { doseMetforminaMgDia: doseMetformina }
        : {}),
      ...(tfg !== null ? { tfg } : {}),
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

      <AntidiabeticosOrais
        prefixo={prefixo}
        doseMetforminaBruta={doseMetforminaBruta}
        tfgBruta={tfgBruta}
        erros={errosVisiveis}
        onMudancaMetformina={(valor) => {
          setDoseMetforminaBruta(valor);
          registraEdicao();
        }}
        onMudancaTfg={(valor) => {
          setTfgBruta(valor);
          registraEdicao();
        }}
        onBlurMetformina={() =>
          validaCampo("metformina", erroDaDoseMetformina(doseMetforminaBruta))
        }
        onBlurTfg={() => validaCampo("tfg", erroDaTfg(tfgBruta))}
      />

      <GlicemiasPorMomento
        prefixo={prefixo}
        valores={glicemias}
        erros={errosVisiveis}
        onMudanca={(momento, valorBruto) => {
          setGlicemias((atual) => ({ ...atual, [momento]: valorBruto }));
          registraEdicao();
        }}
        onBlur={(momento) =>
          validaCampo(
            `glicemias-${momento}`,
            erroDasGlicemiasDoMomento(glicemias[momento]),
          )
        }
      />

      {modo === "titulacao" ? (
        <EsquemaAtual
          prefixo={prefixo}
          aplicacoes={aplicacoes}
          erros={errosVisiveis}
          onMudanca={(id, patch) => {
            setAplicacoes((as) =>
              as.map((a) => (a.id === id ? { ...a, ...patch } : a)),
            );
            registraEdicao();
          }}
          onRemover={(id) => {
            setAplicacoes((as) => as.filter((a) => a.id !== id));
            registraEdicao();
          }}
          onAdicionar={() => {
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
          onBlurDose={(linha) =>
            validaCampo(`dose-${linha.id}`, erroDaDose(linha.doseBruta))
          }
        />
      ) : null}

      <div>
        <button type="submit" className="botao botao-primario">
          Calcular
        </button>
      </div>
    </form>
  );
}
