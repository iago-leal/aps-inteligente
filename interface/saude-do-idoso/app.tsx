"use client";
// Contêiner do rastreamento de depressão na pessoa idosa (feature 023: RF-01..RF-10;
// D-07): estado efêmero, invalidação por edição e painel honesto — molde do app.tsx da
// cardiologia, com TRÊS destinos a partir de `vazio`, e não quatro.
//
// POR QUE A MÁQUINA NÃO TEM `fora-do-escopo`. Nas duas telas de cardiologia essa variante
// existe porque o domínio recusa: idade fora da faixa que a fonte tabela. Aqui a fonte não
// publica faixa etária nenhuma (RN-07), de modo que não há recusa a exibir, e estado
// inalcançável é código morto que a próxima leitura tomará por esquecimento.
//
// SEM RITUAL DE REVISÃO (RN-11, ADR 0012). Esta tela não prescreve dose: o checkbox de
// revisão é exclusivo da insulina, e replicá-lo aqui diluiria o que ele significa lá.
//
// Nenhum dado clínico sai daqui: sem rede, sem storage. Nesta tela isso pesa mais do que nas
// anteriores, porque o dado é sintomatologia psíquica de pessoa identificável na consulta.
import { useMemo, useState } from "react";
import { EscalaDepressaoGeriatrica } from "models/depressao-geriatrica/calculadora";
import type {
  RespostasDaEscala,
  SaidaAvaliacao,
} from "models/depressao-geriatrica/tipos";
import {
  relatorNulo,
  type RelatorDeErros,
} from "interface/calculadora/relator-de-erros";
import { FormularioDepressaoGeriatrica } from "./formulario";
import {
  PainelDepressaoGeriatrica,
  type EstadoDepressaoGeriatrica,
} from "./resultado";

function estadoDaSaida(saida: SaidaAvaliacao): EstadoDepressaoGeriatrica {
  if (saida.tipo === "resultado") return { estado: "sucesso", saida };
  return { estado: "erro", saida };
}

export interface PropsAppDepressaoGeriatrica {
  relator?: RelatorDeErros;
  /** Injeção para teste; em produção, sempre o motor real. */
  motor?: { avaliar(respostas: RespostasDaEscala): SaidaAvaliacao };
}

export function AppDepressaoGeriatrica({
  relator = relatorNulo,
  motor,
}: PropsAppDepressaoGeriatrica) {
  const motorReal = useMemo(
    () => motor ?? new EscalaDepressaoGeriatrica(),
    [motor],
  );
  const [estado, setEstado] = useState<EstadoDepressaoGeriatrica>({
    estado: "vazio",
  });
  const [desatualizado, setDesatualizado] = useState(false);
  const [geracaoFormulario, setGeracaoFormulario] = useState(0);

  function aoAvaliar(respostas: RespostasDaEscala) {
    try {
      setEstado(estadoDaSaida(motorReal.avaliar(respostas)));
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
      <FormularioDepressaoGeriatrica
        key={geracaoFormulario}
        onCalcular={aoAvaliar}
        onAlteracao={aoAlterar}
      />
      <PainelDepressaoGeriatrica
        estado={estado}
        desatualizado={desatualizado}
        onNovaAvaliacao={aoNovaAvaliacao}
      />
    </div>
  );
}
