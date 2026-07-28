import type { NextConfig } from "next";

// CSP sem terceiros (feature 002, RF-07; RN-06; reconstituição de ebad6a5):
// todo recurso sai da própria origem; sem conexões externas. Aplicada apenas em
// produção porque o dev server do Next exige eval/ws para o HMR funcionar.
const cspProducao = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Carimbo do instante do build (feature 022, RF-03; D-04). A chave `env` faz
// substituição estática no bundle, de modo que o valor congela no artefato e não é
// lido em runtime. O que ele NÃO é: não é a data do commit, que mede quando alguém
// escreveu o código, nem o instante da requisição, que é `atualizado_em`. É quando
// este deploy foi gerado — idêntico entre duas consultas, distinto entre deploys.
const publicadoEm = new Date().toISOString();

const config: NextConfig = {
  // Sem isto o Turbopack sobe a árvore procurando lockfile, encontra o de ~/ e
  // infere a raiz errada do workspace. Fixar aqui mantém o build determinístico.
  turbopack: { root: import.meta.dirname },
  env: { APS_PUBLICADO_EM: publicadoEm },
  // O @primer/react importa .css internamente; sem transpilar, o SSR tenta
  // carregá-lo como ESM externo e o Node rejeita a extensão (feature 004, RF-01).
  transpilePackages: ["@primer/react"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: cspProducao }]
            : []),
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default config;
