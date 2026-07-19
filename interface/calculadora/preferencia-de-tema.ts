// Preferência de tema como fonte externa ao React: o localStorage é lido por
// useSyncExternalStore, que trata a ausência do storage no servidor sem provocar
// divergência de hidratação. Storage bloqueado degrada para o tema claro.
export type Tema = "claro" | "escuro";

const CHAVE = "aps-inteligente:tema";

const ouvintes = new Set<() => void>();

export function assinarTema(aoMudar: () => void): () => void {
  ouvintes.add(aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

export function lerTema(): Tema {
  try {
    return window.localStorage.getItem(CHAVE) === "escuro" ? "escuro" : "claro";
  } catch {
    return "claro";
  }
}

/** No servidor não há preferência gravada: a tela nasce clara e o cliente ajusta. */
export function lerTemaNoServidor(): Tema {
  return "claro";
}

export function gravarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CHAVE, tema);
  } catch {
    // Preferência não persiste, mas a troca vale para esta sessão.
  }
  for (const ouvinte of ouvintes) ouvinte();
}
