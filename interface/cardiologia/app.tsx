"use client";
// Contêiner da avaliação de dor torácica (feature 010: RF-01..RF-07, RF-09, RF-10;
// RN-09): estado efêmero, invalidação por edição e painel honesto — molde do app.tsx
// da idade gestacional, SEM ritual de revisão (D-08: estratificar não é prescrever
// dose). Nenhum dado clínico sai daqui: sem rede, sem storage.
import { useMemo, useState } from "react";
import { CalculadoraCardiopatiaIsquemica } from "models/cardiopatia-isquemica/calculadora";
import type {
  EntradaAvaliacao,
  SaidaAvaliacao,
} from "models/cardiopatia-isquemica/tipos";
import {
  relatorNulo,
  type RelatorDeErros,
} from "interface/calculadora/relator-de-erros";
import { FormularioCardiologia } from "./formulario";
import { ReferenciasComplementares } from "./referencias";
import { PainelCardiologia, type EstadoCardiologia } from "./resultado";

function estadoDaSaida(saida: SaidaAvaliacao): EstadoCardiologia {
  if (saida.tipo === "resultado") return { estado: "sucesso", saida };
  if (saida.tipo === "fora-do-escopo") return { estado: "fora-do-escopo", saida };
  return { estado: "erro", saida };
}

export interface PropsAppCardiologia {
  relator?: RelatorDeErros;
  /** Injeção para teste; em produção, sempre o motor real. */
  motor?: { avaliar(entrada: EntradaAvaliacao): SaidaAvaliacao };
}

export function AppCardiologia({
  relator = relatorNulo,
  motor,
}: PropsAppCardiologia) {
  const motorReal = useMemo(
    () => motor ?? new CalculadoraCardiopatiaIsquemica(),
    [motor],
  );
  const [estado, setEstado] = useState<EstadoCardiologia>({ estado: "vazio" });
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
      <FormularioCardiologia
        key={geracaoFormulario}
        onCalcular={aoAvaliar}
        onAlteracao={aoAlterar}
      />
      <PainelCardiologia
        estado={estado}
        desatualizado={desatualizado}
        onNovaAvaliacao={aoNovaAvaliacao}
      />
      <ReferenciasComplementares />
    </div>
  );
}
