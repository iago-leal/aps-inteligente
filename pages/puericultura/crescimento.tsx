// Rota da avaliação do crescimento infantil (feature 017: RF-11/RF-14; D-12). Quinta
// calculadora e primeira da seção `puericultura`; a tela é nomeada pela calculadora
// (crescimento), não pela seção, no molde de pages/cardiologia/risco-cardiovascular.
import Head from "next/head";
import { TelaCrescimento } from "interface/puericultura/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>Avaliação do crescimento infantil · APS Inteligente</title>
        <meta
          name="description"
          content="Escores z de peso, comprimento/estatura, IMC e perímetro cefálico com a classificação da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), inclusive para nascidos pré-termo. Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaCrescimento />
    </>
  );
}
