import type { AppProps } from "next/app";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "interface/estilos/globais.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fonte-texto",
  display: "swap",
});

// Monoespaçada reservada aos números clínicos (doses, faixas, médias): alinha as
// grandezas em coluna e as distingue do texto corrido.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--fonte-dados",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`app-raiz ${plexSans.variable} ${plexMono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
