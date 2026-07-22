"use client";
// Painel de resultado (RF-03/RF-04/RF-08/RF-09/RF-10 do requirements; RF-04..RF-09/EC-07 da UI).
// Ordem fixa: alertas → dose/delta → fonte → revisão explícita → disclaimer (RN-06).
// Feature 004: componentes Primer (RF-02); textos clínicos e máquina de estados intocados.
import {
  Button,
  Checkbox,
  Flash,
  FormControl,
  Heading,
  Text,
} from "@primer/react";
import type {
  Alerta,
  AplicacaoInsulina,
  ErroValidacao,
  ForaDoEscopoDaFonte,
  MomentoAplicacao,
  Recomendacao,
  ResultadoCalculo,
  ResultadoInicio,
  ResultadoTitulacao,
} from "models/insulina/tipos";

export type EstadoResultado =
  | { estado: "vazio" }
  | { estado: "sucesso"; saida: ResultadoCalculo }
  | { estado: "erro"; saida: ErroValidacao | ForaDoEscopoDaFonte }
  | { estado: "falha-inesperada" };

export interface PropsResultado {
  estado: EstadoResultado;
  desatualizado: boolean;
  revisaoConfirmada: boolean;
  onConfirmarRevisao: (confirmada: boolean) => void;
  onNovoCalculo: () => void;
}

const ROTULO_MOMENTO: Record<MomentoAplicacao, string> = {
  antes_cafe: "antes do café",
  antes_almoco: "antes do almoço",
  antes_jantar: "antes do jantar",
  ao_deitar: "ao deitar",
};

function textoDoDelta(deltaUi: number): string {
  if (deltaUi > 0) return `Aumentar ${deltaUi} UI`;
  if (deltaUi < 0) return `Reduzir ${Math.abs(deltaUi)} UI`;
  return "Manter a dose";
}

function Alertas({ alertas }: { alertas: readonly Alerta[] }) {
  if (alertas.length === 0) return null;
  return (
    <div role="alert" className="bloco-alertas">
      {alertas.map((alerta) => (
        <Flash
          key={alerta.tipo + alerta.mensagem}
          variant="warning"
          className="alerta-clinico"
        >
          <strong>{alerta.tipo.replaceAll("_", " ")}</strong> —{" "}
          {alerta.mensagem}
        </Flash>
      ))}
    </div>
  );
}

function LinhaPrescricao({ aplicacao }: { aplicacao: AplicacaoInsulina }) {
  return (
    <li className="linha-prescricao" data-insulina={aplicacao.insulina}>
      <span className="tampa" aria-hidden="true" />
      <span className="insulina">{aplicacao.insulina}</span>
      <span className="momento">{ROTULO_MOMENTO[aplicacao.momento]}</span>
      <span className="dose">{aplicacao.doseUi} UI</span>
    </li>
  );
}

function Recomendacoes({ itens }: { itens: readonly Recomendacao[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="bloco-recomendacoes">
      <Heading as="h3">Recomendações ao prescritor</Heading>
      <ul>
        {itens.map((rec) => (
          <li key={rec.tipo}>{rec.mensagem}</li>
        ))}
      </ul>
    </div>
  );
}

function Referencias({ resultado }: { resultado: ResultadoCalculo }) {
  return (
    <div className="bloco-referencias">
      <Heading as="h3">Fonte clínica</Heading>
      <ul>
        {resultado.referencias.map((ref) => (
          <li key={ref.localizacao}>
            Guia Rápido Diabetes Mellitus — SMS-Rio, {ref.versaoEdicao}:{" "}
            {ref.localizacao}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CorpoInicio({ resultado }: { resultado: ResultadoInicio }) {
  return (
    <div className="faixa-inicial">
      <Text as="p">
        Insulina {resultado.aplicacaoSugerida.insulina}{" "}
        {ROTULO_MOMENTO[resultado.aplicacaoSugerida.momento]} — dose inicial
        pela fonte:
      </Text>
      <Text as="p" className="valor">
        {resultado.faixaDoseUi.minUi} a {resultado.faixaDoseUi.maxUi} UI/dia
      </Text>
      <Text as="p">
        Equivalente por peso (0,1 a 0,2 UI/kg/dia):{" "}
        <span className="valor">
          {resultado.faixaPorPesoUi.minUi} a {resultado.faixaPorPesoUi.maxUi}{" "}
          UI/dia
        </span>
      </Text>
      <Text as="p" size="small" className="referencia-inline">
        O guia informa a faixa; a dose exata é fixada pelo prescritor.
      </Text>
    </div>
  );
}

function CorpoTitulacao({ resultado }: { resultado: ResultadoTitulacao }) {
  return (
    <>
      <div className="resumo-dose">
        <span>
          Conduta:{" "}
          <span className="valor">{textoDoDelta(resultado.deltaTotalUi)}</span>
        </span>
        <span>
          Dose total:{" "}
          <span className="valor">{resultado.doseTotalDiaUi} UI/dia</span>
        </span>
        {resultado.naMeta ? (
          <span className="selo-na-meta">Na meta (71–129 mg/dL)</span>
        ) : null}
      </div>
      <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
        {resultado.esquemaSugerido.map((aplicacao) => (
          <LinhaPrescricao
            key={aplicacao.insulina + aplicacao.momento}
            aplicacao={aplicacao}
          />
        ))}
      </ul>
      {resultado.condutasAlternativas &&
      resultado.condutasAlternativas.length > 0 ? (
        <div className="bloco-condutas">
          <Heading as="h3">
            Condutas alternativas do guia — a escolha é do prescritor
          </Heading>
          <ul>
            {resultado.condutasAlternativas.map((conduta) => (
              <li key={conduta.rotulo}>
                {conduta.rotulo}:{" "}
                {conduta.esquemaSugerido
                  .map(
                    (a) =>
                      `${a.insulina} ${a.doseUi} UI ${ROTULO_MOMENTO[a.momento]}`,
                  )
                  .join(" + ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function PainelResultado({
  estado,
  desatualizado,
  revisaoConfirmada,
  onConfirmarRevisao,
  onNovoCalculo,
}: PropsResultado) {
  const revisaoValida = revisaoConfirmada && !desatualizado;

  return (
    <section
      className={`painel-resultado${desatualizado ? " resultado-desatualizado" : ""}`}
      aria-label="Resultado do cálculo"
    >
      <Heading as="h2">Resultado</Heading>

      {desatualizado ? (
        <Flash variant="warning" role="status" className="aviso-desatualizado">
          Os dados mudaram — recalcule antes de prescrever.
        </Flash>
      ) : null}

      {estado.estado === "vazio" ? (
        <Text as="p" className="resultado-vazio">
          Preencha os dados do paciente e acione Calcular.
        </Text>
      ) : null}

      {estado.estado === "falha-inesperada" ? (
        <Flash variant="danger" role="alert" className="painel-falha">
          <strong>Não foi possível calcular.</strong>
          <p>
            Ocorreu uma falha inesperada. <strong>Não prescreva</strong> a
            partir desta tela: recarregue a página e, se persistir, faça o
            cálculo manualmente pela fonte clínica.
          </p>
        </Flash>
      ) : null}

      {estado.estado === "erro" && estado.saida.tipo === "erro-validacao" ? (
        <Flash variant="danger" role="alert" className="bloco-erros">
          <strong>
            Entradas fora da faixa plausível — nenhuma dose foi calculada:
          </strong>
          <ul>
            {estado.saida.ofensores.map((ofensor) => (
              <li key={ofensor.campo + ofensor.codigo}>{ofensor.mensagem}</li>
            ))}
          </ul>
        </Flash>
      ) : null}

      {estado.estado === "erro" && estado.saida.tipo === "fora-do-escopo" ? (
        <Flash variant="danger" role="alert" className="bloco-erros">
          <strong>Cenário fora do escopo da fonte clínica:</strong>
          <p>{estado.saida.motivo}</p>
          <p>{estado.saida.orientacao}.</p>
        </Flash>
      ) : null}

      {estado.estado === "sucesso" ? (
        <div className="conteudo-resultado">
          <Alertas alertas={estado.saida.alertas} />
          {estado.saida.modo === "inicio" ? (
            <CorpoInicio resultado={estado.saida} />
          ) : (
            <CorpoTitulacao resultado={estado.saida} />
          )}
          <Recomendacoes itens={estado.saida.recomendacoesAoPrescritor} />
          <Referencias resultado={estado.saida} />
        </div>
      ) : null}

      {estado.estado === "sucesso" ? (
        <div className="bloco-revisao">
          <FormControl disabled={desatualizado}>
            <Checkbox
              checked={revisaoValida}
              onChange={(evento) => onConfirmarRevisao(evento.target.checked)}
            />
            <FormControl.Label>Revisei a dose e a fonte</FormControl.Label>
          </FormControl>
          <div
            className="bloco-final"
            data-testid="bloco-pronto-para-prescrever"
            aria-disabled={revisaoValida ? "false" : "true"}
          >
            <strong>Pronto para prescrever</strong>
            <p>
              Transcreva o esquema ao prontuário/receituário. Nada é salvo nem
              enviado por esta página.
            </p>
          </div>
        </div>
      ) : null}

      <Text as="p" size="small" className="disclaimer">
        Ferramenta de apoio à decisão: não substitui o julgamento do médico, que
        permanece responsável pela prescrição.
      </Text>

      {estado.estado !== "vazio" ? (
        <div>
          <Button type="button" onClick={onNovoCalculo}>
            Novo cálculo
          </Button>
        </div>
      ) : null}
    </section>
  );
}
