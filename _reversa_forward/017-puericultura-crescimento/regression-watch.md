# Regression watch: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Criado em: `2026-07-26` (execução parcial: Fase 1 + T029)
> Regra de leitura: o **watch principal** só recebe regras que eram 🟢 no legado e que esta
> feature alterou. Premissas 🟡 e itens sem peso de regressão vão para "Observações".

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/code-analysis.md` Módulo 10 — `interface/inicio` | O catálogo tem **quatro** seções, e `puericultura` é a quarta, com exatamente uma ficha | presença | A extração volta a descrever três seções, ou a seção nova aparece sem ficha |
| W002 | `_reversa_sdd/code-analysis.md` Módulo 10 — mapa de ícones | O mapa tem quatro pares e mantém o fallback `null` para seção sem entrada | presença | Fallback removido, ou seção nova sem ícone |
| W003 | `_reversa_sdd/architecture.md` §1 — camadas | Os scripts dev-time (`scripts/**`) não são importados por `models/**`, `interface/**` nem `pages/**` | ausência | Qualquer `import` de `scripts/` fora de `scripts/` |
| W004 | `_reversa_sdd/adrs/0002` — privacidade por construção | Nenhum `fetch` em código de aplicação; o único da feature vive em `scripts/baixar-tabelas-oms.mts` | ausência | `fetch`, `XMLHttpRequest` ou `storage` em `models/puericultura/**` ou `interface/puericultura/**` |
| W005 | Contrato de aquisição §6 — procedência | `models/puericultura/oms/tabelas/manifesto.json` existe, com 14 origens e 14 `sha256` distintos | presença | Manifesto ausente, incompleto, ou com hash repetido (indício de arquivo trocado na origem) |

## Observações (sem peso de regressão)

- **Estado intermediário assumido.** O catálogo já anuncia `/puericultura/crescimento`, rota que
  ainda não existe (T045 pendente). É consequência da regra de anti-drift do README, que manda o
  catálogo vir primeiro; some quando a fase de integração fechar.
- **D-15 e D-16 ainda não têm código.** As fronteiras de 3683 dias e de 730 dias estão decididas
  e documentadas, mas os testes de limite (T011, T015, T016) e o domínio que as aplica são das
  fases seguintes. Nada a vigiar até lá.
- **`tsconfig.json` com `allowImportingTsExtensions`.** Vale só sob `noEmit`. Se algum dia o
  projeto passar a emitir com `tsc`, a opção precisa sair junto com a extensão nos imports.
- **Coeficientes do INTERGROWTH-21st (MD-0002).** Antes 🟡 por procedência indireta, agora
  conferidos contra as 1596 células das tabelas oficiais. Ganham peso de regressão quando o
  código que os usa existir (T035): o teste de T012 é que os prenderá.
- **Premissas clínicas 🟡 do plano** (roadmap §4, incluída a nova de leitura no mês 120) seguem
  como estão, no precedente de `architecture.md` §6, dívida 5.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso a cada `/reversa`. -->

## Arquivadas

<!-- Vazio. -->
