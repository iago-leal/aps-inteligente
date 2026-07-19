"use client";
// Moldura da tela da calculadora: cabeçalho, selo de privacidade e alternador de
// tema. Só cuida de apresentação — nenhuma regra clínica nem estado de cálculo
// vive aqui (o cálculo é do CalculadoraApp).
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
          <h1>Calculadora de Insulina — DM2</h1>
          <p>
            APS Inteligente · Fonte única: Guia Rápido Diabetes Mellitus —
            SMS-Rio, 2.ª ed. atualizada, 2023
          </p>
        </div>
        <div className="cabecalho-acoes">
          <span className="selo-privacidade">Nada é salvo nem enviado</span>
          <button
            type="button"
            className="botao-tema"
            onClick={() => gravarTema(tema === "escuro" ? "claro" : "escuro")}
          >
            {tema === "escuro" ? "Tema claro" : "Tema escuro"}
          </button>
        </div>
      </header>
      <main>
        <CalculadoraApp />
      </main>
    </div>
  );
}
