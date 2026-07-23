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
