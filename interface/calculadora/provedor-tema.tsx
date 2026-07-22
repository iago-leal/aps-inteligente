"use client";
// RF-01/RF-03 (feature 004-estilo-primer-nas-telas): adaptador entre a preferência
// de tema do usuário (preferencia-de-tema.ts, fonte de verdade em localStorage) e o
// color mode do Primer. O ThemeProvider é consumidor da preferência, nunca dono:
// chave e valores persistidos permanecem os de sempre (RN-04; data-delta §3).
import { BaseStyles, ThemeProvider } from "@primer/react";
import { useSyncExternalStore, type ReactNode } from "react";
import { assinarTema, lerTema, lerTemaNoServidor } from "./preferencia-de-tema";

export function ProvedorTemaPrimer({ children }: { children: ReactNode }) {
  // No servidor a tela nasce clara e o cliente ajusta — mesmo contrato de antes.
  const tema = useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor);

  return (
    <ThemeProvider
      colorMode={tema === "escuro" ? "night" : "day"}
      dayScheme="light"
      nightScheme="dark"
    >
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  );
}
