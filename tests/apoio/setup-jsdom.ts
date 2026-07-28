// Setup de ambiente para os testes jsdom.
//
// O TooltipV2 do @primer/react — acionado por IconButton (feature 011: toggle de
// tema e comando de início) — usa o popover-polyfill do @oddbird, que faz
// `root.adoptedStyleSheets = [sheet, ...root.adoptedStyleSheets]`. O jsdom não
// implementa `adoptedStyleSheets`, então o spread lança "is not iterable" e todo
// render de IconButton quebra. Damos a ele um array gravável, inerte no jsdom.
//
// Guarda por typeof: este setup também carrega nos testes de ambiente `node`
// (onde Document/ShadowRoot não existem) — nesses, é um no-op.
for (const proto of [
  typeof Document !== "undefined" ? Document.prototype : undefined,
  typeof ShadowRoot !== "undefined" ? ShadowRoot.prototype : undefined,
]) {
  if (proto && !Object.getOwnPropertyDescriptor(proto, "adoptedStyleSheets")) {
    Object.defineProperty(proto, "adoptedStyleSheets", {
      configurable: true,
      writable: true,
      value: [],
    });
  }
}

// Feature 019: o Dialog do @primer/react observa o próprio corpo por
// `useOverflow`, que instancia `ResizeObserver`. O jsdom não o implementa, e sem
// ele todo render do painel de contribuição quebra no efeito de montagem. O dublê
// abaixo é inerte de propósito: nada no jsdom muda de tamanho, de modo que jamais
// haveria entrada a notificar — o que se testa aqui é conteúdo e semântica, e a
// geometria fica com os roteiros de ponta a ponta, onde há navegador de verdade.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Feature 020: o ActionMenu do @primer/react — o seletor entre as dez fichas — consulta
// `window.matchMedia` para decidir se abre como menu ou como folha em tela estreita. O jsdom
// não o implementa, e sem ele todo render da ficha quebra na montagem. O dublê responde
// sempre "não corresponde", que é o caminho de tela larga: a disposição responsiva é assunto
// dos roteiros de ponta a ponta, onde há navegador com viewport de verdade.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((consulta: string) => ({
    matches: false,
    media: consulta,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
