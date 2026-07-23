"use client";
// Contêiner da estimativa de risco cardiovascular (feature 014: RF-01..RF-10;
// RN-09): estado efêmero, invalidação por edição e painel honesto — molde do
// AppCardiologia (feature 010), SEM ritual de revisão (D-08: estimar risco não
// prescreve dose). Nenhum dado clínico sai daqui: sem rede, sem storage (ADR 0002).
import { useMemo, useState } from "react";
import { CalculadoraRiscoCardiovascular } from "models/risco-cardiovascular/calculadora";
import type {
  EntradaEstimativa,
  SaidaEstimativa,
} from "models/risco-cardiovascular/tipos";
import {
  relatorNulo,
  type RelatorDeErros,
} from "interface/calculadora/relator-de-erros";
import { FormularioRiscoCardiovascular } from "./formulario";
import { ContextoDaFonte } from "./proveniencia";
import {
  PainelRiscoCardiovascular,
  type EstadoRiscoCardiovascular,
} from "./resultado";

function estadoDaSaida(saida: SaidaEstimativa): EstadoRiscoCardiovascular {
  if (saida.tipo === "resultado") return { estado: "sucesso", saida };
  if (saida.tipo === "fora-do-escopo") return { estado: "fora-do-escopo", saida };
  return { estado: "erro", saida };
}

export interface PropsAppRiscoCardiovascular {
  relator?: RelatorDeErros;
  /** Injeção para teste; em produção, sempre o motor real. */
  motor?: { estimar(entrada: EntradaEstimativa): SaidaEstimativa };
}

export function AppRiscoCardiovascular({
  relator = relatorNulo,
  motor,
}: PropsAppRiscoCardiovascular) {
  const motorReal = useMemo(
    () => motor ?? new CalculadoraRiscoCardiovascular(),
    [motor],
  );
  const [estado, setEstado] = useState<EstadoRiscoCardiovascular>({
    estado: "vazio",
  });
  const [desatualizado, setDesatualizado] = useState(false);
  const [geracaoFormulario, setGeracaoFormulario] = useState(0);

  function aoEstimar(entrada: EntradaEstimativa) {
    try {
      setEstado(estadoDaSaida(motorReal.estimar(entrada)));
    } catch (erro) {
      // Padrão EC-07 do legado: exceção fora do contrato é bug — painel honesto.
      relator.reportar({
        nome: erro instanceof Error ? erro.name : "ErroDesconhecido",
      });
      setEstado({ estado: "falha-inesperada" });
    }
    setDesatualizado(false);
  }

  function aoAlterar() {
    if (estado.estado !== "vazio") {
      setDesatualizado(true);
    }
  }

  function aoNovaEstimativa() {
    setEstado({ estado: "vazio" });
    setDesatualizado(false);
    setGeracaoFormulario((g) => g + 1);
  }

  return (
    <div className="calc-regioes">
      <FormularioRiscoCardiovascular
        key={geracaoFormulario}
        onCalcular={aoEstimar}
        onAlteracao={aoAlterar}
      />
      <PainelRiscoCardiovascular
        estado={estado}
        desatualizado={desatualizado}
        onNovaEstimativa={aoNovaEstimativa}
      />
      <ContextoDaFonte />
    </div>
  );
}
