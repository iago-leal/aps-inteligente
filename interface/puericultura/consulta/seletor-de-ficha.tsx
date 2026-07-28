"use client";
// Seletor da ficha de consulta (feature 020: RF-03, RN-04; D-07).
//
// O motor INFORMA qual ficha a idade indica; quem escolhe é o prescritor (ADR 0005). A
// sugestão aparece marcada, e as dez continuam à mão: a criança de sete meses não tem
// consulta prevista, a fonte não diz o que fazer com ela, e trocar precisa custar um clique.
//
// A troca não recarrega a página, e não podia: o preenchimento vive em memória (RN-13), e
// recarregar o descartaria — que é justamente o que o aviso de RF-13 promete não fazer sem
// avisar.
import { ActionList, ActionMenu } from "@primer/react";
import type { Ficha } from "models/puericultura/consulta/tipos";

export interface PropsSeletorDeFicha {
  fichas: readonly Ficha[];
  fichaEscolhida: Ficha;
  /** A que a idade indica; usada só para marcá-la na lista (RN-04). */
  fichaSugerida: Ficha | null;
  onEscolher: (ficha: Ficha) => void;
}

export function SeletorDeFicha({
  fichas,
  fichaEscolhida,
  fichaSugerida,
  onEscolher,
}: PropsSeletorDeFicha) {
  return (
    <section
      className="consulta-seletor"
      aria-labelledby="consulta-seletor-titulo"
    >
      <h2 id="consulta-seletor-titulo">Ficha da consulta</h2>
      <ActionMenu>
        <ActionMenu.Button>{fichaEscolhida.titulo}</ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList selectionVariant="single">
            {fichas.map((ficha) => (
              <ActionList.Item
                key={ficha.id}
                selected={ficha.id === fichaEscolhida.id}
                onSelect={() => onEscolher(ficha)}
              >
                {ficha.titulo}
                {ficha.id === fichaSugerida?.id ? (
                  <ActionList.Description>
                    Sugerida pela idade
                  </ActionList.Description>
                ) : null}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {fichaSugerida !== null && fichaSugerida.id !== fichaEscolhida.id ? (
        <p className="nota-campo">
          A idade indica a {fichaSugerida.titulo}, e a ficha aberta é outra. A
          escolha é sua.
        </p>
      ) : null}
    </section>
  );
}
