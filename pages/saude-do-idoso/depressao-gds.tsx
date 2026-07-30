// Rota do rastreamento de depressão na pessoa idosa (feature 023: RF-11). Casca de
// metadados mais tela, no molde das outras sete rotas; separador e caixa de frase na forma
// fixada pela feature 018.
import Head from "next/head";
import { TelaDepressaoGeriatrica } from "interface/saude-do-idoso/tela";

export default function Pagina() {
  return (
    <>
      <Head>
        <title>
          Rastreamento de depressão na pessoa idosa · APS Inteligente
        </title>
        <meta
          name="description"
          content="Escala de Depressão Geriátrica em quinze itens, com o escore e a faixa na redação das Linhas de Cuidado (Ministério da Saúde). Cálculo 100% no navegador: nada é salvo nem enviado."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TelaDepressaoGeriatrica />
    </>
  );
}
