// Rota da ficha de consulta de puericultura (feature 020: RF-01; D-13). Sexta calculadora e
// segunda da seção `puericultura`; a tela é nomeada pela calculadora (consulta), não pela
// seção, no molde de `pages/puericultura/crescimento.tsx`.
import Head from "next/head";
import { TelaConsulta } from "interface/puericultura/consulta/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>Ficha de consulta de puericultura · APS Inteligente</title>
        <meta
          name="description"
          content="As dez consultas datadas da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020) em ficha preenchível, com o registro pronto em SOAP para colar no prontuário. Preenchimento 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaConsulta />
    </>
  );
}
