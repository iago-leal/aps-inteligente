"use client";
// Bloco do registro em SOAP (feature 020: RF-06, RF-07, RF-08; D-03).
//
// O TEXTO E O COMANDO CONSOMEM A MESMA VARIÁVEL, e é isso que faz de RF-08 uma propriedade da
// construção. O `<pre>` exibe `texto`; `AcaoCopiar` recebe `texto`. Não há segunda montagem
// da cadeia, e por isso não há como o prescritor conferir uma coisa e colar outra.
//
// O caminho de RECUSA da área de transferência (contrato §4) sai de graça daí: o texto já
// está na tela quando o comando falha, e a cópia manual não pede passo extra. Foi o que
// promoveu RF-08 a *Must* na sessão de esclarecimento.
//
// `AcaoCopiar` vem da feature 019 SEM alteração de assinatura, com a função de cópia
// injetável por prop — é assim que a suíte dubla o clipboard sem tocar `navigator`.
import { Text } from "@primer/react";
import { AcaoCopiar } from "interface/contribuicao/acao-copiar";
import type { copiarParaAreaDeTransferencia } from "interface/calculadora/area-de-transferencia";

export interface PropsBlocoDoRegistro {
  texto: string;
  /** Injetável nos testes; em produção, o adaptador real (D-08 da 019). */
  copiar?: typeof copiarParaAreaDeTransferencia;
}

export function BlocoDoRegistro({ texto, copiar }: PropsBlocoDoRegistro) {
  const vazio = texto.trim() === "";

  return (
    <section
      className="painel-resultado"
      aria-labelledby="consulta-registro-titulo"
    >
      <h2 id="consulta-registro-titulo">Registro em SOAP</h2>

      {vazio ? (
        <Text as="p" className="consulta-registro-vazio">
          Nada foi preenchido ainda. O registro mostra apenas o que você marcar
          na ficha, e some do texto o que ficar em branco.
        </Text>
      ) : (
        <>
          <Text as="p" size="small">
            Confira o texto antes de copiar. É exatamente esta cadeia que vai
            para a área de transferência.
          </Text>
          <pre className="consulta-registro-texto">{texto}</pre>
          <AcaoCopiar
            rotulo="Copiar registro"
            texto={texto}
            confirmacao="Registro copiado. Cole no prontuário."
            copiar={copiar}
          />
        </>
      )}
    </section>
  );
}
