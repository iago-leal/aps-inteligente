// Rota da calculadora de idade gestacional (feature 007: RF-01/RF-02/RF-06; D-06).
import Head from "next/head";
import { TelaIdadeGestacional } from "interface/gestacao/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>Calculadora de Idade Gestacional · APS Inteligente</title>
        <meta
          name="description"
          content="Idade gestacional, data provável do parto e trimestre pela DUM ou pelo último ultrassom, pelo Guia Rápido Pré-Natal (SMS-Rio, 2025). Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaIdadeGestacional />
    </>
  );
}
