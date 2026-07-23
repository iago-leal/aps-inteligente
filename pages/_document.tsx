import { Head, Html, Main, NextScript } from "next/document";

// Feature 009 (RF-03; RN-04): identidade instalável a partir do tile APSi.
// favicon e apple-touch-icon apontam ao tile same-origin; o manifesto PWA
// (public/manifest.webmanifest) declara nome, cor e ícones 192/512. Tudo sob a
// CSP vigente (img-src 'self' data:; manifest-src recai em default-src 'self').
export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" type="image/png" href="/apsi-tile-192.png" />
        <link rel="apple-touch-icon" href="/apsi-tile.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0969da" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
