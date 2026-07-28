"use client";
// Comando de cópia parametrizado (feature 019: RF-07/RF-15; roadmap D-07/D-08).
// RF-07 e RF-15 têm a mesma mecânica e diferem em três dados: o rótulo, o texto a
// copiar e o recado de confirmação. Um componente com três props evita duplicar o
// estado de cópia e as duas variantes de `Flash`.
//
// A função de cópia entra por PROP COM VALOR PADRÃO, no molde exato de
// `AcaoCopiarPlano` em `interface/calculadora/resultado.tsx`: é assim que a suíte
// de integração dubla a área de transferência sem tocar em `navigator`. Em
// produção, o adaptador real, reaproveitado sem alteração de assinatura (RF-12).
import { useState } from "react";
import { Button, Flash } from "@primer/react";
import { copiarParaAreaDeTransferencia } from "interface/calculadora/area-de-transferencia";

type EstadoCopia = "ocioso" | "copiado" | "falhou";

export interface PropsAcaoCopiar {
  rotulo: string;
  texto: string;
  confirmacao: string;
  /** Injetável nos testes; em produção, o adaptador real (D-08). */
  copiar?: typeof copiarParaAreaDeTransferencia;
}

export function AcaoCopiar({
  rotulo,
  texto,
  confirmacao,
  copiar = copiarParaAreaDeTransferencia,
}: PropsAcaoCopiar) {
  const [estadoCopia, setEstadoCopia] = useState<EstadoCopia>("ocioso");

  return (
    <div className="contribuicao-acao-copiar">
      <Button
        type="button"
        onClick={async () => {
          const copia = await copiar(texto);
          setEstadoCopia(copia.ok ? "copiado" : "falhou");
        }}
      >
        {rotulo}
      </Button>
      {estadoCopia === "copiado" ? (
        <Flash variant="success" role="status">
          {confirmacao}
        </Flash>
      ) : null}
      {estadoCopia === "falhou" ? (
        <Flash variant="danger" role="alert">
          Não foi possível copiar. Selecione o texto nesta tela e copie
          manualmente.
        </Flash>
      ) : null}
    </div>
  );
}
