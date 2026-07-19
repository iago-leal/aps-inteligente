import type { NextConfig } from "next";

const config: NextConfig = {
  // Sem isto o Turbopack sobe a árvore procurando lockfile, encontra o de ~/ e
  // infere a raiz errada do workspace. Fixar aqui mantém o build determinístico.
  turbopack: { root: import.meta.dirname },
};

export default config;
