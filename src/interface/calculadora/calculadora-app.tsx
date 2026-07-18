"use client";
// Contêiner da calculadora: estado efêmero EstadoCalculadora (§9 da spec da UI),
// invalidação por edição (RN-06; EC-03) e painel honesto para falha inesperada (EC-07).
// Nenhum dado clínico sai deste componente: sem rede, sem storage (RN-02).
import { useMemo, useState } from "react";
import { CalculadoraInsulinaDM2 } from "@/dominio/insulina/calculadora";
import type { EntradaCalculo, SaidaCalculo } from "@/dominio/insulina/tipos";
import { FormularioCalculadora } from "./formulario";
import { relatorNulo, type RelatorDeErros } from "./relator-de-erros";
import { PainelResultado, type EstadoResultado } from "./resultado";

export interface PropsCalculadoraApp {
  relator?: RelatorDeErros;
  /** Injeção para teste (T025); em produção, sempre o motor real. */
  motor?: { calcular(entrada: EntradaCalculo): SaidaCalculo };
}

export function CalculadoraApp({
  relator = relatorNulo,
  motor,
}: PropsCalculadoraApp) {
  const motorReal = useMemo(
    () => motor ?? new CalculadoraInsulinaDM2(),
    [motor],
  );
  const [estado, setEstado] = useState<EstadoResultado>({ estado: "vazio" });
  const [desatualizado, setDesatualizado] = useState(false);
  const [revisaoConfirmada, setRevisaoConfirmada] = useState(false);
  const [geracaoFormulario, setGeracaoFormulario] = useState(0);

  function aoCalcular(entrada: EntradaCalculo) {
    try {
      const saida = motorReal.calcular(entrada);
      setEstado(
        saida.tipo === "resultado"
          ? { estado: "sucesso", saida }
          : { estado: "erro", saida },
      );
    } catch (erro) {
      // EC-07: exceção fora do contrato é bug — painel honesto + evento anônimo (MD-0010).
      relator.reportar({
        nome: erro instanceof Error ? erro.name : "ErroDesconhecido",
      });
      setEstado({ estado: "falha-inesperada" });
    }
    setDesatualizado(false);
    setRevisaoConfirmada(false);
  }

  function aoAlterar() {
    if (estado.estado !== "vazio") {
      setDesatualizado(true);
      setRevisaoConfirmada(false);
    }
  }

  function aoNovoCalculo() {
    setEstado({ estado: "vazio" });
    setDesatualizado(false);
    setRevisaoConfirmada(false);
    setGeracaoFormulario((g) => g + 1); // RF-10: remonta o formulário limpo.
  }

  return (
    <div className="calc-regioes">
      <FormularioCalculadora
        key={geracaoFormulario}
        onCalcular={aoCalcular}
        onAlteracao={aoAlterar}
      />
      <PainelResultado
        estado={estado}
        desatualizado={desatualizado}
        revisaoConfirmada={revisaoConfirmada}
        onConfirmarRevisao={setRevisaoConfirmada}
        onNovoCalculo={aoNovoCalculo}
      />
    </div>
  );
}
