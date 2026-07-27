"use client";
// Contêiner da avaliação do crescimento infantil (feature 017: RF-11, RF-12, RF-15,
// RF-21): estado efêmero, motor injetável, invalidação por edição e painel honesto —
// molde do AppRiscoCardiovascular (014), SEM ritual de revisão (RN-13: classificar
// crescimento não prescreve dose). A data de referência é da UI (dispositivo),
// injetável para teste, no molde da 007: o motor não lê o relógio (RN-10).
// Nenhum dado clínico sai daqui: sem rede, sem storage (ADR 0002).
//
// A proveniência fica FORA do painel de resultado (RF-13) e visível desde o primeiro
// carregamento: os limites da fonte valem antes de haver número em tela, não depois.
import { useMemo, useState } from "react";
import { CalculadoraCrescimentoInfantil } from "models/puericultura/calculadora";
import type {
  EntradaAvaliacao,
  SaidaAvaliacao,
} from "models/puericultura/tipos";
import {
  relatorNulo,
  type RelatorDeErros,
} from "interface/calculadora/relator-de-erros";
import { FormularioCrescimento } from "./formulario";
import { ProvenienciaDoCrescimento } from "./proveniencia";
import { PainelCrescimento, type EstadoCrescimento } from "./resultado";

function dataLocalDoDispositivo(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

function estadoDaSaida(saida: SaidaAvaliacao): EstadoCrescimento {
  if (saida.tipo === "resultado") return { estado: "sucesso", saida };
  if (saida.tipo === "fora-do-escopo")
    return { estado: "fora-do-escopo", saida };
  return { estado: "erro", saida };
}

export interface PropsAppCrescimento {
  relator?: RelatorDeErros;
  /** Injeção para teste; em produção, sempre o motor real. */
  motor?: { avaliar(entrada: EntradaAvaliacao): SaidaAvaliacao };
  /** Injeção para teste (RN-10); em produção, a data do dispositivo. */
  dataDeHoje?: string;
}

export function AppCrescimento({
  relator = relatorNulo,
  motor,
  dataDeHoje,
}: PropsAppCrescimento) {
  const motorReal = useMemo(
    () => motor ?? new CalculadoraCrescimentoInfantil(),
    [motor],
  );
  const hoje = useMemo(
    () => dataDeHoje ?? dataLocalDoDispositivo(),
    [dataDeHoje],
  );
  const [estado, setEstado] = useState<EstadoCrescimento>({ estado: "vazio" });
  const [desatualizado, setDesatualizado] = useState(false);
  const [geracaoFormulario, setGeracaoFormulario] = useState(0);

  function aoAvaliar(entrada: EntradaAvaliacao) {
    try {
      setEstado(estadoDaSaida(motorReal.avaliar(entrada)));
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

  function aoNovaAvaliacao() {
    setEstado({ estado: "vazio" });
    setDesatualizado(false);
    setGeracaoFormulario((g) => g + 1);
  }

  return (
    <div className="calc-regioes">
      <FormularioCrescimento
        key={geracaoFormulario}
        onAvaliar={aoAvaliar}
        onAlteracao={aoAlterar}
        dataDeHoje={hoje}
      />
      <PainelCrescimento
        estado={estado}
        desatualizado={desatualizado}
        onNovaAvaliacao={aoNovaAvaliacao}
      />
      <ProvenienciaDoCrescimento />
    </div>
  );
}
