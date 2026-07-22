"use client";
// Formulário da calculadora (RF-05/RF-06/RF-07 do requirements; RF-01..RF-03/RF-11 da UI).
// Feature 001-integrar-design-claude: entrada de glicemias por momento (RF-04) e
// bloco de antidiabéticos orais (RF-01/RF-02), compostos como subcomponentes (D-07).
// Feature 004: campos e botões em componentes Primer (RF-02); as mensagens de erro
// permanecem parágrafos próprios com role="alert" — contrato observável dos testes.
// Valida no blur com as MESMAS faixas do motor e aceita vírgula ou ponto decimal;
// nenhuma regra clínica vive aqui (RNF-05 da UI).
import {
  Button,
  FormControl,
  Radio,
  RadioGroup,
  Select,
  TextInput,
} from "@primer/react";
import { ErroDeCampo } from "./erro-de-campo";
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
      <RadioGroup
        name={`${prefixo}-modo`}
        onChange={(selecionado) => {
          if (selecionado === "inicio" || selecionado === "titulacao") {
            setModo(selecionado);
            registraEdicao();
          }
        }}
      >
        <RadioGroup.Label>Modo de cálculo</RadioGroup.Label>
        <FormControl>
          <Radio value="inicio" checked={modo === "inicio"} />
          <FormControl.Label>Início de insulinização</FormControl.Label>
        </FormControl>
        <FormControl>
          <Radio value="titulacao" checked={modo === "titulacao"} />
          <FormControl.Label>Titulação de dose</FormControl.Label>
        </FormControl>
      </RadioGroup>

      <fieldset className="grupo-campos">
        <legend>Dados do paciente</legend>
        <div className="campo">
          <FormControl>
            <FormControl.Label>Peso (kg)</FormControl.Label>
            <TextInput
              inputMode="decimal"
              value={pesoBruto}
              validationStatus={errosVisiveis.peso ? "error" : undefined}
              onChange={(e) => {
                setPesoBruto(e.target.value);
                registraEdicao();
              }}
              onBlur={() => validaCampo("peso", erroDoPeso(pesoBruto))}
            />
          </FormControl>
          <ErroDeCampo mensagem={errosVisiveis.peso} />
        </div>

        <div className="campo">
          <FormControl>
            <FormControl.Label>HbA1c (%) — opcional</FormControl.Label>
            <TextInput
              inputMode="decimal"
              value={hba1cBruta}
              validationStatus={errosVisiveis.hba1c ? "error" : undefined}
              onChange={(e) => {
                setHba1cBruta(e.target.value);
                registraEdicao();
              }}
              onBlur={() => validaCampo("hba1c", erroDaHba1c(hba1cBruta))}
            />
          </FormControl>
          <ErroDeCampo mensagem={errosVisiveis.hba1c} />
        </div>

        <div className="campo">
          <FormControl>
            <FormControl.Label>Uso de sulfonilureia</FormControl.Label>
            <Select
              value={sulfonilureia}
              onChange={(e) => {
                setSulfonilureia(e.target.value as typeof sulfonilureia);
                registraEdicao();
              }}
            >
              <Select.Option value="nao_informado">Não informado</Select.Option>
              <Select.Option value="sim">Sim</Select.Option>
              <Select.Option value="nao">Não</Select.Option>
            </Select>
          </FormControl>
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
        <Button type="submit" variant="primary">
          Calcular
        </Button>
      </div>
    </form>
  );
}
