"use client";
// Moldura comum das telas da plataforma (feature 007, D-09; RF-05/RF-08):
// cabeçalho com identidade, selo de privacidade e alternador de tema — extraída
// byte a byte de interface/calculadora/tela.tsx (feature 004: componentes Primer;
// data-tema como marcador observável da preferência, RN-04 daquela feature).
// Nota: preferencia-de-tema.ts permanece em interface/calculadora/ porque o
// provedor de tema e sua suíte apontam para lá; realocação fica para re-extração.
import { Button, Heading, Label, Text } from "@primer/react";
import { useSyncExternalStore, type ReactNode } from "react";
import {
  assinarTema,
  gravarTema,
  lerTema,
  lerTemaNoServidor,
} from "interface/calculadora/preferencia-de-tema";

export interface PropsMoldura {
  readonly titulo: string;
  readonly subtitulo: string;
  readonly children: ReactNode;
}

export function Moldura({ titulo, subtitulo, children }: PropsMoldura) {
  const tema = useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor);

  return (
    <div className="pagina" data-tema={tema}>
      <header className="cabecalho">
        <div className="cabecalho-identidade">
          <Heading as="h1">{titulo}</Heading>
          <Text as="p" size="small">
            {subtitulo}
          </Text>
        </div>
        <div className="cabecalho-acoes">
          <Label variant="success" size="large">
            Nada é salvo nem enviado
          </Label>
          <Button
            type="button"
            size="small"
            onClick={() => gravarTema(tema === "escuro" ? "claro" : "escuro")}
          >
            {tema === "escuro" ? "Tema claro" : "Tema escuro"}
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
