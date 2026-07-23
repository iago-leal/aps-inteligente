// Rota da calculadora de dor torácica / probabilidade pré-teste (feature 010:
// RF-01/RF-08; D-06).
import Head from "next/head";
import { TelaCardiologia } from "interface/cardiologia/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>
          Probabilidade Pré-teste de Cardiopatia Isquêmica · APS Inteligente
        </title>
        <meta
          name="description"
          content="Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de investigação, pelo TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017). Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaCardiologia />
    </>
  );
}
