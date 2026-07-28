"use client";
// Painel da calculadora de crescimento (feature 020: RF-09, RF-10, RF-11; D-08, D-09).
//
// PAINEL DE RESULTADO, E NÃO SEGUNDO FORMULÁRIO. A entrada da fachada da feature 017 é
// montada do estado da FICHA, e por isso não há campo a redigitar: a ausência de redigitação
// que RF-09 pede é estrutural, e não uma cortesia de valores iniciais. O motor da 017 chega
// intocado — este arquivo o chama, não o altera (RF-18).
//
// OS DOIS DADOS QUE A FICHA NÃO TEM (D-09), e que o motor exige:
//
//  · **O peso vem em GRAMAS.** A caderneta imprime "Peso*: ______ g" e `EntradaAvaliacao`
//    fala em quilos. A conversão é do produto, e vai dita na tela em vez de acontecer em
//    silêncio.
//  · **A caderneta não pergunta a POSIÇÃO da medição**, e a 017 se recusa a supô-la, com
//    razão registrada: supor "deitado" erra 0,7 cm na medida que alimenta o escore. O campo é
//    acréscimo AUTORAL do produto sobre a fonte, e é por isso que ele mora aqui, na tela, e
//    não entre os campos transcritos da ficha.
//
// Sobre o `Dialog` do Primer, no molde da 019: foco preso, retorno ao gatilho, `Esc` e clique
// fora vêm resolvidos, e a baseline `axe` de zero violação por rota depende disso.
import { useEffect, useMemo, useRef } from "react";
import { Dialog, FormControl, Radio, Text } from "@primer/react";
import { CalculadoraCrescimentoInfantil } from "models/puericultura/calculadora";
import {
  PainelCrescimento,
  type EstadoCrescimento,
} from "interface/puericultura/resultado";
import type {
  ContextoDaConsulta,
  Ficha,
  Preenchimento,
} from "models/puericultura/consulta/tipos";
import type {
  EntradaAvaliacao,
  PosicaoDaMedicao,
  ResultadoAvaliacao,
  SaidaAvaliacao,
} from "models/puericultura/tipos";

const GRAMAS_POR_QUILO = 1000;

/** O valor bruto do campo, já em número; `undefined` quando em branco ou ilegível. */
function medidaDaFicha(
  ficha: Ficha,
  preenchimento: Preenchimento,
  vinculo: "peso" | "comprimento" | "perimetroCefalico",
): number | undefined {
  const campo = ficha.secoes
    .flatMap((secao) => secao.campos)
    .find(
      (c) => c.natureza === "medida" && c.vinculoAntropometrico === vinculo,
    );
  if (campo === undefined) return undefined;

  const resposta = preenchimento.get(campo.id);
  if (resposta?.natureza !== "medida" || resposta.bruto.trim() === "") {
    return undefined;
  }
  return Number(resposta.bruto.replace(",", "."));
}

/** RN-11: a entrada da fachada da 017, montada do estado da ficha (D-08). */
export function montarEntradaAvaliacao(
  ficha: Ficha,
  preenchimento: Preenchimento,
  contexto: ContextoDaConsulta,
): EntradaAvaliacao {
  const pesoEmGramas = medidaDaFicha(ficha, preenchimento, "peso");
  const comprimento = medidaDaFicha(ficha, preenchimento, "comprimento");
  const pc = medidaDaFicha(ficha, preenchimento, "perimetroCefalico");

  return {
    sexo: contexto.sexo,
    dataDeNascimento: contexto.dataDeNascimento,
    dataDaMedicao: contexto.dataDaConsulta,
    ...(pesoEmGramas === undefined
      ? {}
      : { pesoKg: pesoEmGramas / GRAMAS_POR_QUILO }),
    ...(comprimento === undefined ? {} : { comprimentoCm: comprimento }),
    ...(contexto.posicaoDaMedicao === undefined
      ? {}
      : { posicaoDaMedicao: contexto.posicaoDaMedicao }),
    ...(pc === undefined ? {} : { perimetroCefalicoCm: pc }),
    ...(contexto.idadeGestacionalAoNascer === undefined
      ? {}
      : { idadeGestacionalAoNascer: contexto.idadeGestacionalAoNascer }),
  };
}

function estadoDaSaida(saida: SaidaAvaliacao): EstadoCrescimento {
  if (saida.tipo === "resultado") return { estado: "sucesso", saida };
  if (saida.tipo === "fora-do-escopo")
    return { estado: "fora-do-escopo", saida };
  return { estado: "erro", saida };
}

export interface PropsPainelDeCrescimento {
  ficha: Ficha;
  preenchimento: Preenchimento;
  contexto: ContextoDaConsulta;
  posicao: string;
  onPosicao: (posicao: PosicaoDaMedicao) => void;
  aoFechar: () => void;
  refDeRetorno?: React.RefObject<HTMLButtonElement | null>;
  /**
   * RF-10: o resultado volta para o contêiner, que o passa à fachada do registro. É por aqui
   * que os escores z chegam à seção objetiva e a classificação nutricional à avaliação, com a
   * `ReferenciaClinica` que o motor da 017 já carimbou — nada é recalculado no caminho.
   */
  onAvaliacao: (avaliacao: ResultadoAvaliacao | undefined) => void;
  /** Injeção para teste; em produção, sempre o motor real. */
  motor?: { avaliar(entrada: EntradaAvaliacao): SaidaAvaliacao };
}

export function PainelDeCrescimento({
  ficha,
  preenchimento,
  contexto,
  posicao,
  onPosicao,
  aoFechar,
  refDeRetorno,
  onAvaliacao,
  motor,
}: PropsPainelDeCrescimento) {
  const refInterna = useRef<HTMLButtonElement>(null);
  const motorReal = useMemo(
    () => motor ?? new CalculadoraCrescimentoInfantil(),
    [motor],
  );
  const saida = useMemo(
    () =>
      motorReal.avaliar(montarEntradaAvaliacao(ficha, preenchimento, contexto)),
    [motorReal, ficha, preenchimento, contexto],
  );
  const estado = estadoDaSaida(saida);

  // O registro recebe o resultado por efeito, e não durante a renderização: escrever no
  // estado do pai enquanto o filho renderiza é o laço que o React proíbe. Recusa e erro de
  // validação zeram a avaliação, porque um registro não deve carregar escore que a fonte
  // recusou-se a produzir.
  useEffect(() => {
    onAvaliacao(saida.tipo === "resultado" ? saida : undefined);
  }, [saida, onAvaliacao]);

  return (
    <Dialog
      title="Avaliação do crescimento"
      onClose={aoFechar}
      returnFocusRef={refDeRetorno ?? refInterna}
      width="large"
    >
      <div className="consulta-painel-crescimento">
        <Text as="p" size="small">
          As medidas vêm da ficha desta consulta, sem redigitação. O peso, que a
          caderneta pede em gramas, é convertido para quilos antes de entrar nos
          escores.
        </Text>

        <fieldset className="campo-radios">
          <legend>Posição da medição</legend>
          <Text as="p" size="small">
            A caderneta não pergunta a posição, e o cálculo depende dela: entre
            medir deitado e medir em pé há 0,7 cm de diferença. Informe qual
            foi.
          </Text>
          <FormControl>
            <Radio
              name="posicao-da-medicao"
              value="deitado"
              checked={posicao === "deitado"}
              onChange={() => onPosicao("deitado")}
            />
            <FormControl.Label>Deitado (comprimento)</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio
              name="posicao-da-medicao"
              value="em-pe"
              checked={posicao === "em-pe"}
              onChange={() => onPosicao("em-pe")}
            />
            <FormControl.Label>Em pé (estatura)</FormControl.Label>
          </FormControl>
        </fieldset>

        <PainelCrescimento
          estado={estado}
          desatualizado={false}
          onNovaAvaliacao={aoFechar}
        />
      </div>
    </Dialog>
  );
}
