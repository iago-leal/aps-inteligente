"use client";
// Contêiner da calculadora de idade gestacional (feature 007: RF-01..RF-04, RF-09;
// RN-07/RN-09): estado efêmero, invalidação por edição e painel honesto — molde do
// calculadora-app.tsx da insulina, SEM ritual de revisão (D-08: datação não
// prescreve). A data de referência é da UI (dispositivo), injetável para teste;
// o motor não lê o relógio. Nenhum dado clínico sai daqui: sem rede, sem storage.
import { useMemo, useState } from "react";
import { CalculadoraIdadeGestacional } from "models/gestacao/calculadora";
import type { EntradaDatacao, SaidaDatacao } from "models/gestacao/tipos";
import {
  relatorNulo,
  type RelatorDeErros,
} from "interface/calculadora/relator-de-erros";
import { FormularioIdadeGestacional } from "./formulario";
import { PainelIdadeGestacional, type EstadoIg } from "./resultado";

function dataLocalDoDispositivo(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export interface PropsAppIdadeGestacional {
  relator?: RelatorDeErros;
  /** Injeção para teste; em produção, sempre o motor real. */
  motor?: { calcular(entrada: EntradaDatacao): SaidaDatacao };
  /** Injeção para teste (RN-07); em produção, a data do dispositivo. */
  dataDeHoje?: string;
}

export function AppIdadeGestacional({
  relator = relatorNulo,
  motor,
  dataDeHoje,
}: PropsAppIdadeGestacional) {
  const motorReal = useMemo(
    () => motor ?? new CalculadoraIdadeGestacional(),
    [motor],
  );
  const dataReferencia = useMemo(
    () => dataDeHoje ?? dataLocalDoDispositivo(),
    [dataDeHoje],
  );
  const [estado, setEstado] = useState<EstadoIg>({ estado: "vazio" });
  const [desatualizado, setDesatualizado] = useState(false);
  const [geracaoFormulario, setGeracaoFormulario] = useState(0);

  function aoCalcular(entrada: EntradaDatacao) {
    try {
      const saida = motorReal.calcular(entrada);
      setEstado(
        saida.tipo === "resultado"
          ? { estado: "sucesso", saida }
          : { estado: "erro", saida },
      );
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

  function aoNovoCalculo() {
    setEstado({ estado: "vazio" });
    setDesatualizado(false);
    setGeracaoFormulario((g) => g + 1);
  }

  return (
    <div className="calc-regioes">
      <FormularioIdadeGestacional
        key={geracaoFormulario}
        dataDeHoje={dataReferencia}
        onCalcular={aoCalcular}
        onAlteracao={aoAlterar}
      />
      <PainelIdadeGestacional
        estado={estado}
        desatualizado={desatualizado}
        onNovoCalculo={aoNovoCalculo}
      />
    </div>
  );
}
