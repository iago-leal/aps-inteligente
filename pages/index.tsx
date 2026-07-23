// Raiz da plataforma (feature 007: RF-05/RF-06; decisão do usuário de 2026-07-23:
// quem acessa a raiz vê a home; a calculadora de insulina vive em /dm2/insulina).
import Head from "next/head";
import { TelaInicio } from "interface/inicio/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>APS Inteligente — Calculadoras clínicas para a APS</title>
        <meta
          name="description"
          content="Calculadoras clínicas para a Atenção Primária à Saúde, por seção: Diabetes Mellitus tipo 2 e Pré-natal. Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaInicio />
    </>
  );
}
