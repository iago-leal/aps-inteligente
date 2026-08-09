// Classe declarada dos literais de `interface/contribuicao/**` (feature 019; T012).
//
// Único unit não clínico da camada, e a fronteira se marca em duas etapas — `MD-0022`. Aqui
// não há fonte a citar, porque não há conduta a fundamentar: o que o bloco de apoio pede é
// contribuição voluntária, e a isenção declarada no domínio é a primeira camada dessa
// fronteira.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, identificadores } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
  // ─── interface/contribuicao (feature 019) ───────────────────────────────────────
  //
  // Camada autoral por inteiro, com três exceções que são identificador pela ORIGEM
  // e não pelo diretório (RN-02): a chave PIX, o nome civil e a cidade do
  // beneficiário. Nenhum dos três é prosa a revisar — a chave é código de
  // recebimento, e nome e cidade são o que o padrão do Banco Central exige nos
  // campos 59 e 60, transcritos da vida civil. Os valores hoje são de EXEMPLO, e o
  // arquivo os declara como tais; quando os reais entrarem, a classe não muda.
  //
  // "PIX" aparece dentro de frases autorais e não se declara à parte: é marca do
  // arranjo de pagamento dentro da prosa do produto, e a prosa é que se revisa.

  "interface/contribuicao/beneficiario.ts": [
    // Os dois primeiros são os valores publicados; os dois últimos, os de exemplo
    // que permanecem no arquivo como oráculo da guarda de
    // `tests/unit/interface/beneficiario-sem-exemplo.test.ts`.
    ...identificadores([
      "Iago Leal",
      "BENEFICIARIO DE EXEMPLO",
      "CIDADE EXEMPLO",
    ]),
  ],

  "interface/contribuicao/acao-copiar.tsx": [
    ...autorais([
      "Não foi possível copiar. Selecione o texto nesta tela e copie manualmente.",
    ]),
  ],

  "interface/contribuicao/painel.tsx": [
    ...autorais([
      "Contribuição voluntária",
      "A contribuição é voluntária e não compra funcionalidade, prioridade, suporte nem acesso.",
      "A plataforma é gratuita e continua gratuita para quem não contribuir.",
      "Nada é processado nem confirmado aqui: a transferência acontece no aplicativo do seu banco, e esta página não fica sabendo se ela ocorreu.",
      "Código PIX copia e cola",
      "No próprio celular não dá para ler o código com a câmera do mesmo aparelho. Copie o código abaixo e cole no aplicativo do seu banco, que já chega com o beneficiário identificado.",
      "Copiar código copia e cola",
      "Código copiado: cole no aplicativo do banco.",
      "Chave PIX",
      "Copiar chave",
      "Chave copiada.",
      "Código para leitura por câmera",
      "Código PIX para leitura pela câmera de outro aparelho",
      "Beneficiário:",
      ", em",
      ".",
      "A configuração do beneficiário está incorreta e o código não pôde ser gerado.",
    ]),
  ],

  "interface/contribuicao/bloco-de-apoio.tsx": [
    ...autorais([
      "Apoie a plataforma",
      "A APS Inteligente é mantida por uma pessoa só e não tem anúncio, cadastro nem plano pago. Se ela poupa seu tempo na consulta, você pode contribuir com o valor que quiser, por PIX.",
      "Contribuir por PIX",
    ]),
  ],
};
