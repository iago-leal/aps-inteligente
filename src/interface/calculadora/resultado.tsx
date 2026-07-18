"use client";
// Painel de resultado (RF-03/RF-04/RF-08/RF-09/RF-10 do requirements; RF-04..RF-09/EC-07 da UI).
// Ordem fixa: alertas → dose/delta → fonte → revisão explícita → disclaimer (RN-06).
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
} from "@/dominio/insulina/tipos";

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
        <p key={alerta.tipo + alerta.mensagem} className="alerta-clinico">
          <span className="icone" aria-hidden="true">
            !
          </span>
          <span>
            <strong>{alerta.tipo.replaceAll("_", " ")}</strong> —{" "}
            {alerta.mensagem}
          </span>
        </p>
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
      <h3>Recomendações ao prescritor</h3>
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
      <h3>Fonte clínica</h3>
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
      <p>
        Insulina {resultado.aplicacaoSugerida.insulina}{" "}
        {ROTULO_MOMENTO[resultado.aplicacaoSugerida.momento]} — dose inicial
        pela fonte:
      </p>
      <p className="valor">
        {resultado.faixaDoseUi.minUi} a {resultado.faixaDoseUi.maxUi} UI/dia
      </p>
      <p>
        Equivalente por peso (0,1 a 0,2 UI/kg/dia):{" "}
        <span className="valor">
          {resultado.faixaPorPesoUi.minUi} a {resultado.faixaPorPesoUi.maxUi}{" "}
          UI/dia
        </span>
      </p>
      <p className="referencia-inline">
        O guia informa a faixa; a dose exata é fixada pelo prescritor.
      </p>
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
          <h3>Condutas alternativas do guia — a escolha é do prescritor</h3>
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
      <h2>Resultado</h2>

      {desatualizado ? (
        <p className="aviso-desatualizado" role="status">
          Os dados mudaram — recalcule antes de prescrever.
        </p>
      ) : null}

      {estado.estado === "vazio" ? (
        <p className="resultado-vazio">
          Preencha os dados do paciente e acione Calcular.
        </p>
      ) : null}

      {estado.estado === "falha-inesperada" ? (
        <div className="painel-falha" role="alert">
          <strong>Não foi possível calcular.</strong>
          <p>
            Ocorreu uma falha inesperada. <strong>Não prescreva</strong> a
            partir desta tela: recarregue a página e, se persistir, faça o
            cálculo manualmente pela fonte clínica.
          </p>
        </div>
      ) : null}

      {estado.estado === "erro" && estado.saida.tipo === "erro-validacao" ? (
        <div className="bloco-erros" role="alert">
          <strong>
            Entradas fora da faixa plausível — nenhuma dose foi calculada:
          </strong>
          <ul>
            {estado.saida.ofensores.map((ofensor) => (
              <li key={ofensor.campo + ofensor.codigo}>{ofensor.mensagem}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {estado.estado === "erro" && estado.saida.tipo === "fora-do-escopo" ? (
        <div className="bloco-erros" role="alert">
          <strong>Cenário fora do escopo da fonte clínica:</strong>
          <p>{estado.saida.motivo}</p>
          <p>{estado.saida.orientacao}.</p>
        </div>
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
          <label className="confirmacao">
            <input
              type="checkbox"
              checked={revisaoValida}
              disabled={desatualizado}
              onChange={(evento) => onConfirmarRevisao(evento.target.checked)}
            />{" "}
            Revisei a dose e a fonte
          </label>
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

      <p className="disclaimer">
        Ferramenta de apoio à decisão: não substitui o julgamento do médico, que
        permanece responsável pela prescrição.
      </p>

      {estado.estado !== "vazio" ? (
        <div>
          <button
            type="button"
            className="botao botao-secundario"
            onClick={onNovoCalculo}
          >
            Novo cálculo
          </button>
        </div>
      ) : null}
    </section>
  );
}
