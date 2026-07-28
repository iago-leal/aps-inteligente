"use client";
// Envoltório da ÚNICA dependência de runtime da feature 019 (RF-06; roadmap
// D-05). `react-qr-code` é importada aqui e em nenhum outro lugar da árvore:
// trocá-la depois é mudança local, na mesma disciplina de
// `area-de-transferencia.ts` e `preferencia-de-tema.ts`.
//
// O desenho sai como SVG inline, marcação da própria origem, dentro da CSP sem
// terceiros de `next.config.ts` (RNF de segurança). Nada é buscado na rede, nem
// para montar o payload nem para desenhá-lo.
//
// AS CORES NÃO SEGUEM O TEMA, E É DE PROPÓSITO. Módulos escuros sobre fundo
// claro é o que os leitores de QR esperam; o código invertido falha em boa parte
// dos aplicativos de banco. O contraste do desenho é requisito de leitura por
// câmera, não escolha estética, e por isso o QR carrega o próprio fundo branco
// mesmo no tema escuro.
import QRCode from "react-qr-code";

export interface PropsCodigoQr {
  /** Payload já montado por `models/contribuicao`; este componente não o interpreta. */
  valor: string;
  /** Nome acessível do desenho, exibido a quem usa leitor de tela. */
  descricao: string;
}

export function CodigoQr({ valor, descricao }: PropsCodigoQr) {
  return (
    <div className="contribuicao-qr">
      <QRCode
        value={valor}
        size={180}
        bgColor="#FFFFFF"
        fgColor="#000000"
        level="M"
        role="img"
        aria-label={descricao}
        style={{ height: "auto", maxWidth: "100%", width: "180px" }}
      />
    </div>
  );
}
