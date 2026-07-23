// Rota da calculadora de insulina (feature 007: RF-06/RF-08; D-06) — conteúdo e
// metadados preservados da antiga raiz; a entrada no catálogo aponta para cá.
import Head from "next/head";
import { TelaCalculadora } from "interface/calculadora/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>Calculadora de Insulina — DM2 · APS Inteligente</title>
        <meta
          name="description"
          content="Apoio à decisão para insulinização no DM2 pelo Guia Rápido Diabetes Mellitus (SMS-Rio, 2.ª ed. 2023). Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaCalculadora />
    </>
  );
}
