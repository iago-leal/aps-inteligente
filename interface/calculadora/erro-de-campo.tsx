"use client";
// Mensagem de erro de campo (feature 004, RF-02): componente único para todo o
// formulário, preservando o contrato observável de sempre — parágrafo com
// role="alert" — que as suítes de integração asserem.
import { Text } from "@primer/react";

export function ErroDeCampo({ mensagem }: { mensagem: string | undefined }) {
  if (!mensagem) return null;
  return (
    <Text as="p" role="alert" className="erro-campo">
      {mensagem}
    </Text>
  );
}
