import type { AppProps } from "next/app";

// Feature 004 (RF-01/RN-05): fundação de estilo Primer — tokens de base e temas
// claro/escuro entram pelo bundle próprio, dentro da CSP sem terceiros (RN-02).
// A tipografia é a pilha de fontes do sistema do próprio Primer: nenhum arquivo
// de fonte é baixado (D-04).
import "@primer/primitives/dist/css/base/motion/motion.css";
import "@primer/primitives/dist/css/base/size/size.css";
import "@primer/primitives/dist/css/base/size/z-index.css";
import "@primer/primitives/dist/css/base/typography/typography.css";
import "@primer/primitives/dist/css/functional/motion/motion.css";
import "@primer/primitives/dist/css/functional/size/border.css";
import "@primer/primitives/dist/css/functional/size/breakpoints.css";
import "@primer/primitives/dist/css/functional/size/radius.css";
import "@primer/primitives/dist/css/functional/size/size.css";
import "@primer/primitives/dist/css/functional/size/viewport.css";
import "@primer/primitives/dist/css/functional/size/z-index.css";
import "@primer/primitives/dist/css/functional/spacing/space.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/themes/dark.css";
import "interface/estilos/globais.css";
import "interface/estilos/cabecalho.css";
import "interface/estilos/inicio.css";
import "interface/estilos/cardiologia.css";
import "interface/estilos/risco-cardiovascular.css";

import { ProvedorTemaPrimer } from "interface/calculadora/provedor-tema";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app-raiz">
      <ProvedorTemaPrimer>
        <Component {...pageProps} />
      </ProvedorTemaPrimer>
    </div>
  );
}
