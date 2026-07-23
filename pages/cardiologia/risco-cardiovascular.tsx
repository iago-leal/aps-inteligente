// Rota da calculadora de risco cardiovascular (feature 014: RF-01/RF-08; D-02). A
// seção `cardiologia` passa a ter duas calculadoras; a tela é nomeada pela
// calculadora (risco-cardiovascular), não pela seção.
import Head from "next/head";
import { TelaRiscoCardiovascular } from "interface/risco-cardiovascular/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>
          Risco Cardiovascular em 10 anos (Pooled Cohort Equations) · APS
          Inteligente
        </title>
        <meta
          name="description"
          content="Estimativa do risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (ACC/AHA 2013). Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaRiscoCardiovascular />
    </>
  );
}
