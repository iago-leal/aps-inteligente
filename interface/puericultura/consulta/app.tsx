"use client";
// Contêiner da ficha de consulta de puericultura (feature 020: RF-02, RF-03, RF-06, RF-09,
// RF-10, RF-13; RN-13, RN-14). Estado efêmero, motor injetável, painel de crescimento sob
// demanda. Nenhum dado clínico sai daqui: sem rede, sem storage (ADR 0002).
//
// TRÊS DIFERENÇAS EM RELAÇÃO ÀS CINCO TELAS ANTERIORES, todas com razão registrada:
//
//  1. **Não há ritual de revisão** (RN-14). Preencher ficha de consulta não prescreve dose, e
//     ADR 0012 restringe o ritual à insulina. O comando de cópia fica sempre disponível.
//  2. **Não há invalidação por edição.** Aqui a edição É o preenchimento: o registro reflete
//     o estado corrente a cada tecla, e um aviso de "resultado desatualizado" acusaria como
//     defeito o comportamento normal da tela.
//  3. **O registro é derivado, e não submetido.** Um `useMemo` produz a cadeia, e é ela que a
//     tela exibe e o comando de cópia entrega — a identidade de RF-08 é estrutural (D-03).
//
// A calculadora de crescimento entra por `next/dynamic` (RF-11): quem não abre o painel não
// paga as tabelas antropométricas no primeiro carregamento, que foi o achado da 019.
import { useMemo, useRef, useState } from "react";
import { Button } from "@primer/react";
import dynamic from "next/dynamic";
import { RegistroDeConsultaPuericultura } from "models/puericultura/consulta/calculadora";
import { derivarIdades } from "models/puericultura/idades";
import type {
  ContextoDaConsulta,
  Ficha,
  Resposta,
} from "models/puericultura/consulta/tipos";
import type {
  PosicaoDaMedicao,
  ResultadoAvaliacao,
  SaidaAvaliacao,
  Sexo,
} from "models/puericultura/tipos";
import type { copiarParaAreaDeTransferencia } from "interface/calculadora/area-de-transferencia";
import { FichaPreenchivel } from "./ficha";
import { formatarRegistro } from "./formatar-registro";
import { IdentificacaoDaConsulta } from "./identificacao";
import { AvisoDeNaoPersistencia, ProvenienciaDaConsulta } from "./proveniencia";
import { BlocoDoRegistro } from "./registro";
import { SeletorDeFicha } from "./seletor-de-ficha";

const PainelDeCrescimento = dynamic(
  () => import("./painel-crescimento").then((m) => m.PainelDeCrescimento),
  { ssr: false },
);

function dataLocalDoDispositivo(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

/** Ambos em branco significa "não informada", e a criança é tratada como termo (RN-05). */
function idadeGestacional(semanas: string, dias: string) {
  if (semanas.trim() === "" && dias.trim() === "") return undefined;
  return {
    semanas: semanas.trim() === "" ? Number.NaN : Number(semanas),
    dias: dias.trim() === "" ? 0 : Number(dias),
  };
}

export interface PropsAppConsulta {
  /** Injetável nos testes; em produção, o adaptador real. */
  copiar?: typeof copiarParaAreaDeTransferencia;
  /** Injeção para teste; em produção, a data do dispositivo. */
  dataDeHoje?: string;
  /** Injeção para teste do painel de crescimento; em produção, o motor real da 017. */
  motorDeCrescimento?: { avaliar(entrada: never): SaidaAvaliacao };
}

export function AppConsulta({
  copiar,
  dataDeHoje,
  motorDeCrescimento,
}: PropsAppConsulta) {
  const hoje = useMemo(
    () => dataDeHoje ?? dataLocalDoDispositivo(),
    [dataDeHoje],
  );
  const fachada = useMemo(() => new RegistroDeConsultaPuericultura(), []);

  const [sexo, setSexo] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [consulta, setConsulta] = useState(hoje);
  const [igSemanas, setIgSemanas] = useState("");
  const [igDias, setIgDias] = useState("");
  const [posicao, setPosicao] = useState("");
  const [preenchimento, setPreenchimento] = useState<
    ReadonlyMap<string, Resposta>
  >(new Map());
  const [fichaTrocada, setFichaTrocada] = useState<Ficha | null>(null);
  const [painelAberto, setPainelAberto] = useState(false);
  const [avaliacao, setAvaliacao] = useState<ResultadoAvaliacao | undefined>();
  const refDoPainel = useRef<HTMLButtonElement>(null);

  const contexto: ContextoDaConsulta | null = useMemo(() => {
    if (sexo === "" || nascimento === "" || consulta === "") return null;
    const ig = idadeGestacional(igSemanas, igDias);
    const entrada = {
      sexo: sexo as Sexo,
      dataDeNascimento: nascimento,
      dataDaMedicao: consulta,
      ...(ig === undefined ? {} : { idadeGestacionalAoNascer: ig }),
    };
    try {
      return {
        sexo: sexo as Sexo,
        dataDeNascimento: nascimento,
        dataDaConsulta: consulta,
        ...(ig === undefined ? {} : { idadeGestacionalAoNascer: ig }),
        ...(posicao === ""
          ? {}
          : { posicaoDaMedicao: posicao as PosicaoDaMedicao }),
        idades: derivarIdades(entrada),
      };
    } catch {
      // Datas fora de ordem ou impossíveis: sem idade não há ficha a sugerir, e a tela
      // continua utilizável com a ficha que o usuário escolher (ADR 0004).
      return null;
    }
  }, [sexo, nascimento, consulta, igSemanas, igDias, posicao]);

  const fichaSugerida = useMemo(
    () => (contexto === null ? null : fachada.sugerir(contexto.idades).ficha),
    [contexto, fachada],
  );
  const fichaAberta = fichaTrocada ?? fichaSugerida;

  // D-03: UMA cadeia, dois consumidores. O `<pre>` a exibe e o comando de cópia a entrega.
  const textoDoRegistro = useMemo(() => {
    if (fichaAberta === null || contexto === null) return "";
    return formatarRegistro(
      fachada.montar({
        ficha: fichaAberta,
        contexto,
        preenchimento,
        ...(avaliacao === undefined ? {} : { avaliacao }),
      }),
    );
  }, [fachada, fichaAberta, contexto, preenchimento, avaliacao]);

  function aoResponder(idDoCampo: string, resposta: Resposta | undefined) {
    setPreenchimento((anterior) => {
      const proximo = new Map(anterior);
      if (resposta === undefined) proximo.delete(idDoCampo);
      else proximo.set(idDoCampo, resposta);
      return proximo;
    });
  }

  return (
    <div className="consulta-regioes">
      <AvisoDeNaoPersistencia />

      <IdentificacaoDaConsulta
        sexo={sexo}
        nascimento={nascimento}
        consulta={consulta}
        igSemanas={igSemanas}
        igDias={igDias}
        onSexo={setSexo}
        onNascimento={setNascimento}
        onConsulta={setConsulta}
        onIgSemanas={setIgSemanas}
        onIgDias={setIgDias}
        contexto={contexto}
      />

      {fichaAberta !== null && contexto !== null ? (
        <>
          <SeletorDeFicha
            fichas={fachada.catalogo()}
            fichaEscolhida={fichaAberta}
            fichaSugerida={fichaSugerida}
            onEscolher={setFichaTrocada}
          />

          <FichaPreenchivel
            ficha={fichaAberta}
            sexo={contexto.sexo}
            preenchimento={preenchimento}
            onResposta={aoResponder}
          />

          <Button
            ref={refDoPainel}
            type="button"
            onClick={() => setPainelAberto(true)}
          >
            Avaliar crescimento
          </Button>

          {painelAberto ? (
            <PainelDeCrescimento
              ficha={fichaAberta}
              preenchimento={preenchimento}
              contexto={contexto}
              posicao={posicao}
              onPosicao={setPosicao}
              aoFechar={() => setPainelAberto(false)}
              refDeRetorno={refDoPainel}
              onAvaliacao={setAvaliacao}
              motor={motorDeCrescimento}
            />
          ) : null}
        </>
      ) : null}

      <BlocoDoRegistro texto={textoDoRegistro} copiar={copiar} />
      <ProvenienciaDaConsulta />
    </div>
  );
}
