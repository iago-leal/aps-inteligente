"use client";
// Moldura da tela da calculadora: cabeçalho, selo de privacidade e alternador de
// tema. Só cuida de apresentação — nenhuma regra clínica nem estado de cálculo
// vive aqui (o cálculo é do CalculadoraApp). Feature 004: componentes Primer
// (RF-02); o data-tema permanece como marcador observável da preferência (RN-04).
import { Button, Heading, Label, Text } from "@primer/react";
import { useSyncExternalStore } from "react";
import { CalculadoraApp } from "./calculadora-app";
import {
  assinarTema,
  gravarTema,
  lerTema,
  lerTemaNoServidor,
} from "./preferencia-de-tema";

export function TelaCalculadora() {
  const tema = useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor);

  return (
    <div className="pagina" data-tema={tema}>
      <header className="cabecalho">
        <div className="cabecalho-identidade">
          <Heading as="h1">Calculadora de Insulina — DM2</Heading>
          <Text as="p" size="small">
            APS Inteligente · Fonte única: Guia Rápido Diabetes Mellitus —
            SMS-Rio, 2.ª ed. atualizada, 2023
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
      <main>
        <CalculadoraApp />
      </main>
    </div>
  );
}
