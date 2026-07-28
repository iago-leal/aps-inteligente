"use client";
// Painel de contribuição voluntária (feature 019: RF-05..RF-09, RF-15, RF-16;
// RN-01/RN-02/RN-10; roadmap D-06/D-07/D-11).
//
// Sobre o `Dialog` do Primer, e não modal próprio (D-06): foco preso, retorno do
// foco ao gatilho, fechamento por Esc e por clique fora já vêm resolvidos, e a
// baseline `axe` de 0 violação por rota depende de a semântica estar correta.
//
// ORDEM DO DOM: os dois comandos de cópia vêm ANTES do QR (RF-16). Quem abre a
// plataforma no próprio celular não tem como apontar a câmera do aparelho para a
// tela do mesmo aparelho, de modo que copiar é o caminho principal, e não a
// conveniência secundária. A disposição em telas largas é assunto do CSS, que
// não mexe na ordem de leitura.
import { useRef } from "react";
import { Dialog, Flash, Heading, Text } from "@primer/react";
import { montarBrCode } from "models/contribuicao/br-code";
import { AcaoCopiar } from "./acao-copiar";
import { BENEFICIARIO } from "./beneficiario";
import { CodigoQr } from "./codigo-qr";
import type { copiarParaAreaDeTransferencia } from "interface/calculadora/area-de-transferencia";

export interface PropsPainelContribuicao {
  aoFechar: () => void;
  /** Injetável nos testes (D-08). */
  copiar?: typeof copiarParaAreaDeTransferencia;
  /** Injetável nos testes de integração, que não montam o gatilho real. */
  refDeRetorno?: React.RefObject<HTMLButtonElement | null>;
}

export function PainelContribuicao({
  aoFechar,
  copiar,
  refDeRetorno,
}: PropsPainelContribuicao) {
  const refInterna = useRef<HTMLButtonElement>(null);
  const saida = montarBrCode({
    chave: BENEFICIARIO.chave,
    nomeBeneficiario: BENEFICIARIO.nome,
    cidade: BENEFICIARIO.cidade,
  });

  return (
    <Dialog
      title="Contribuição voluntária"
      onClose={aoFechar}
      returnFocusRef={refDeRetorno ?? refInterna}
      width="large"
    >
      <div className="contribuicao-painel">
        <Text as="p">
          A contribuição é voluntária e não compra funcionalidade, prioridade,
          suporte nem acesso.
        </Text>
        <Text as="p">
          A plataforma é gratuita e continua gratuita para quem não contribuir.
        </Text>
        <Text as="p">
          Nada é processado nem confirmado aqui: a transferência acontece no
          aplicativo do seu banco, e esta página não fica sabendo se ela
          ocorreu.
        </Text>

        {saida.tipo === "ok" ? (
          <>
            <div className="contribuicao-copias">
              <Heading as="h2" variant="small">
                Código PIX copia e cola
              </Heading>
              <Text as="p" size="small">
                No próprio celular não dá para ler o código com a câmera do
                mesmo aparelho. Copie o código abaixo e cole no aplicativo do
                seu banco, que já chega com o beneficiário identificado.
              </Text>
              <AcaoCopiar
                rotulo="Copiar código copia e cola"
                texto={saida.payload}
                confirmacao="Código copiado: cole no aplicativo do banco."
                copiar={copiar}
              />

              <Heading as="h2" variant="small">
                Chave PIX
              </Heading>
              <p className="contribuicao-chave">{BENEFICIARIO.chave}</p>
              <AcaoCopiar
                rotulo="Copiar chave"
                texto={BENEFICIARIO.chave}
                confirmacao="Chave copiada."
                copiar={copiar}
              />
            </div>

            <div className="contribuicao-desenho">
              <Heading as="h2" variant="small">
                Código para leitura por câmera
              </Heading>
              <CodigoQr
                valor={saida.payload}
                descricao="Código PIX para leitura pela câmera de outro aparelho"
              />
              <Text as="p" size="small">
                Beneficiário: {BENEFICIARIO.nome}, em {BENEFICIARIO.cidade}.
              </Text>
            </div>
          </>
        ) : (
          <Flash variant="danger" role="alert">
            <p>
              A configuração do beneficiário está incorreta e o código não pôde
              ser gerado.
            </p>
            <ul>
              {saida.ofensores.map((ofensor) => (
                <li key={ofensor.codigo}>{ofensor.mensagem}</li>
              ))}
            </ul>
          </Flash>
        )}
      </div>
    </Dialog>
  );
}
