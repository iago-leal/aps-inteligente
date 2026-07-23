# Legacy-impact: feature 014-risco-cardiovascular-pce

> Data: `2026-07-23`
> Identificador: `014-risco-cardiovascular-pce`
> Âncora: `_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`, `_reversa_sdd/state-machines.md`
> Natureza: feature **aditiva**. `git diff` dos três motores existentes (`models/insulina`, `models/gestacao`, `models/cardiopatia-isquemica`) **vazio**; nenhum contrato externo alterado (`GET /api/v1/status` byte a byte).

## 1. Arquivos afetados

| Arquivo afetado | Componente (architecture.md) | Tipo | Severidade | Justificativa |
|-----------------|------------------------------|------|------------|---------------|
| `models/risco-cardiovascular/tipos.ts` | Camada de domínio (#1) | componente-novo | LOW | Value objects da quarta unit de domínio; nenhuma unit existente importa daqui |
| `models/risco-cardiovascular/fonte-clinica.ts` | Camada de domínio (#1) | componente-novo | LOW | Coeficientes PCE congelados (fonte única da unit, ADR 0011) |
| `models/risco-cardiovascular/elegibilidade.ts` | Camada de domínio (#1) | componente-novo | LOW | Regra de escopo (idade 40–79, DCV prévia → fora-do-escopo) |
| `models/risco-cardiovascular/equacao.ts` | Camada de domínio (#1) | componente-novo | LOW | Núcleo de cálculo das quatro equações de Cox |
| `models/risco-cardiovascular/categoria.ts` | Camada de domínio (#1) | componente-novo | LOW | Cortes de categoria de risco |
| `models/risco-cardiovascular/validacao.ts` | Camada de domínio (#1) | componente-novo | LOW | Coleta total de ofensores + clamp fisiológico |
| `models/risco-cardiovascular/calculadora.ts` | Fachada de domínio (c4-components) | componente-novo | LOW | `CalculadoraRiscoCardiovascular`, API pública única da unit |
| `interface/risco-cardiovascular/{proveniencia,formulario,resultado,app,tela}.tsx` | Camada de interface (#2) | componente-novo | LOW | Nova tela sobre a `Moldura` comum; reusa `relator-de-erros` e `erro-de-campo` |
| `pages/cardiologia/risco-cardiovascular.tsx` | Rota (code-analysis módulo pages) | componente-novo | LOW | Nova rota; raiz e rotas existentes inalteradas |
| `interface/estilos/risco-cardiovascular.css` | Camada de estilo (addendum 009) | componente-novo | LOW | Folha própria, só tokens Primer; `globais.css` intocado |
| `interface/inicio/catalogo.ts` | Catálogo (addendum 010) | regra-alterada | MEDIUM | Segunda ficha da seção `cardiologia`; a ficha existente preservada byte a byte |
| `pages/_app.tsx` | Composition root (infra) | regra-alterada | LOW | +1 linha de import de CSS ao final do bloco; ordem dos demais imports intacta |
| `e2e/axe-baseline.json` | Linha de base de acessibilidade | delta-de-dados | LOW | +2 chaves em zero (`telaRiscoCardiovascular*`); chaves existentes intactas |
| `tests/**`, `e2e/plataforma.spec.ts` | Suíte de testes (#5) | componente-novo · regra-alterada | LOW | Testes novos da unit/tela + acréscimos aditivos em `inicio.test.tsx` e `plataforma.spec.ts` |

## 2. Diff conceitual por componente

**Camada de domínio.** A família de motores puros passa de três para quatro units. A nova `models/risco-cardiovascular/` replica a anatomia da unit de cardiopatia (feature 010) — `tipos`, `fonte-clinica`, `validacao`, `calculadora` — divergindo apenas na natureza do núcleo: no lugar do *lookup* numa matriz congelada de 24 células, entram quatro modelos de Cox sexo- e raça-específicos (Pooled Cohort Equations, Goff 2013), avaliados por `equacao.ts`. A fachada `CalculadoraRiscoCardiovascular.estimar` orquestra validação → escopo → clamp → equação → categoria, respeitando os invariantes transversais do domínio (erro como valor, coleta total de ofensores, toda saída referenciada, o motor informa e não escolhe conduta).

**Camada de interface.** A tela nova compõe-se sobre a `Moldura` comum (nenhuma alteração na Moldura), reusando `interface/calculadora/relator-de-erros` (telemetria nula) e `interface/calculadora/erro-de-campo`. A máquina de estado da tela (`vazio → sucesso | fora-do-escopo | erro | falha-inesperada`) espelha a da cardiopatia, sem ritual de revisão (D-08). A nota de proveniência ganha componente próprio, alimentado por texto congelado no domínio.

**Catálogo e rota.** A seção `cardiologia` do catálogo — antes com uma ficha — passa a ter duas; a ficha da dor torácica é preservada byte a byte. A tela é nomeada pela calculadora (`interface/risco-cardiovascular/`), não pela seção, para não colidir com `interface/cardiologia/` (D-02). O ícone da seção (`HeartIcon`) não muda, pois é por seção.

**Contratos externos.** Nenhum. Cálculo 100% client-side; zero requisição de rede nova; `GET /api/v1/status`, CSP e cabeçalhos intactos.

## 3. Preservadas (regras 🟢 do domain.md que continuam intactas)

- **Erro como valor; exceção só para invariante** (ADR 0004) — reaplicada na fachada nova sem alterar as existentes.
- **O motor informa, não escolhe conduta** (ADR 0005) — a calculadora só devolve risco % + categoria; teste de integração asserta ausência de recomendação (estatina).
- **Uma fonte clínica por unit de domínio** (ADR 0011) — a nova unit tem fonte única (PCE), sem mesclar com a cardiopatia.
- **Privacidade por construção** (ADR 0002) — sem `fetch`/`storage` de dado clínico; e2e de rede confirma.
- **Coleta total de ofensores** (domain.md regra 15) — validação nunca para no primeiro erro.
- **Constantes congeladas comentadas com a origem** (domain.md §6) — `Object.freeze` aninhado, coeficientes rastreando a Tabela A de Goff 2013.
- **Ritual de revisão só na prescrição de dose** (ADR 0012/D-08) — ausente nesta tela, como na cardiopatia.
- Os três motores existentes e todas as suas regras permanecem byte a byte.

## 4. Modificadas (regras 🟢 alteradas ou removidas)

- **Catálogo: cardinalidade da seção `cardiologia`** — a extração (addendum 010) assumia 1:1 entre seção e calculadora na cardiologia. A regra passa a **1:N**: a seção `cardiologia` agora expõe duas calculadoras. Nenhuma regra removida; a ficha original é preservada integralmente. Gera item de vigília (ver `regression-watch.md`).
