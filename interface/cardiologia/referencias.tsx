"use client";
// Blocos de referência complementar (feature 010: RF-10/RN-08). Material do
// TeleCondutas exibido como texto consultável, SEM cálculo nem interação de
// domínio: classificação funcional CCS, tratamento farmacológico e Tabela 1,
// seguimento na APS e manejo da doença arterial aguda. Cada bloco cita a página
// da fonte. <details> nativo: consultável, acessível e sem JavaScript.
import { Heading, Text } from "@primer/react";

interface BlocoReferencia {
  readonly id: string;
  readonly titulo: string;
  readonly pagina: string;
  readonly paragrafos?: readonly string[];
  readonly itens?: readonly string[];
}

const BLOCOS: readonly BlocoReferencia[] = [
  {
    id: "ccs",
    titulo: "Classificação funcional da angina estável (CCS)",
    pagina: "Quadro 3, p. 5 (Sociedade Canadense Cardiovascular)",
    itens: [
      "Classe I — atividades comuns (caminhar, subir escadas) não causam angina; sintoma só em esforço extenuante ou prolongado.",
      "Classe II — limitação leve; angina ao caminhar mais de duas quadras no plano ou subir mais de um lance de escadas.",
      "Classe III — limitação marcada; angina ao caminhar 1 a 2 quadras ou subir um lance de escadas.",
      "Classe IV — angina a qualquer atividade física, podendo ocorrer em repouso.",
    ],
  },
  {
    id: "tratamento",
    titulo: "Tratamento farmacológico e Tabela 1 de medicamentos",
    pagina: "p. 9-11 (cardiopatia isquêmica estabelecida)",
    paragrafos: [
      "Prevenção cardiovascular: antiagregante plaquetário (AAS 100 mg/dia; clopidogrel 75 mg/dia na intolerância ou alergia) e estatina de alta intensidade como prevenção secundária.",
      "Antianginosos: betabloqueador (primeira escolha, alvo de FC próxima a 60 bpm), bloqueador de canal de cálcio (anlodipino, verapamil ou diltiazem) e nitrato (sublingual para sintomas agudos; de uso fixo com intervalo livre de 12 h para evitar tolerância).",
      "IECA: benéfico na redução de mortalidade e eventos, sobretudo pós-infarto, disfunção ventricular, diabetes e hipertensão.",
    ],
    itens: [
      "Betabloqueadores: propranolol, atenolol, metoprolol, carvedilol.",
      "Bloqueadores de canal de cálcio: anlodipino, verapamil, diltiazem (nifedipina retard).",
      "Nitratos: isossorbida (di/mononitrato); dinitrato sublingual 5 mg até 3 comprimidos; propatilnitrato.",
      "IECA: enalapril, captopril. Antiplaquetários: AAS, clopidogrel, ticlopidina. Estatinas: sinvastatina, atorvastatina, rosuvastatina, pravastatina.",
    ],
  },
  {
    id: "seguimento",
    titulo: "Acompanhamento na APS",
    pagina: "p. 8-9 (periodicidade e controle de fatores de risco)",
    itens: [
      "Periodicidade das consultas: em torno de 4 a 12 meses, conforme gravidade, adesão e fatores de risco.",
      "A cada consulta, reavaliar a classe funcional da angina; piora sugere otimizar tratamento e investigar fatores de descompensação.",
      "Controle de fatores de risco: cessação do tabagismo, dieta cardioprotetora, exercício regular, PA < 140/90 e, em diabéticos, HbA1c < 7%.",
      "Aumento da frequência ou duração da dor, ou dor em repouso: encaminhar à emergência (angina instável / IAM).",
    ],
  },
  {
    id: "agudo",
    titulo: "Manejo da doença arterial coronariana aguda e encaminhamento",
    pagina: "p. 12 (suspeita de IAM ou angina instável)",
    itens: [
      "Suspeita de IAM ou angina instável: encaminhar para atendimento emergencial.",
      "Enquanto aguarda a ambulância: repouso, sinais vitais e ECG, AAS 100 mg (3 comprimidos mastigados), oxigênio se hipóxia e nitrato sublingual (exceto em hipotensão ou uso de inibidores da fosfodiesterase-5).",
      "Encaminhamento ao cardiologista: estratificação após evento agudo; diagnóstico recente de alto risco (> 90%); sintomático apesar de tratamento otimizado; ou impossibilidade de investigação não invasiva em probabilidade intermediária/alta.",
    ],
  },
];

export function ReferenciasComplementares() {
  return (
    <section className="referencias-complementares" aria-labelledby="ref-titulo">
      <Heading as="h2" id="ref-titulo">
        Material de referência
      </Heading>
      <Text as="p" size="small">
        Conteúdo consultável do TeleCondutas — Cardiopatia Isquêmica
        (TelessaúdeRS-UFRGS, 2017), fora do cálculo desta ferramenta.
      </Text>
      {BLOCOS.map((bloco) => (
        <details key={bloco.id} className="referencia-bloco">
          <summary>{bloco.titulo}</summary>
          <Text as="p" size="small" className="referencia-pagina">
            {bloco.pagina}
          </Text>
          {bloco.paragrafos?.map((p, i) => (
            <Text as="p" key={i}>
              {p}
            </Text>
          ))}
          {bloco.itens ? (
            <ul>
              {bloco.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </details>
      ))}
    </section>
  );
}
