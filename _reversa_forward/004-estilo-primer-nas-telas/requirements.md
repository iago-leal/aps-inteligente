# Requirements: Primer como base de estilo das telas da plataforma

> Identificador: `004-estilo-primer-nas-telas`
> Data: `2026-07-21`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature avalia e, se aprovada nos esclarecimentos, adota o **Primer** (design system do GitHub, https://primer.style) como base de estilo das telas da plataforma aps-inteligente, hoje compostas pela calculadora de insulina e destinadas a crescer (plataforma guarda-chuva). O problema de fundo que ela ataca: o estilo atual vive num CSS artesanal de ~700 linhas (`interface/estilos/globais.css`), acima do limite de 400 linhas do mantenedor (dívida técnica nº 4), e cada tela futura exigiria reescrever do zero componentes visuais (botões, campos, painéis, alertas) que um design system maduro entrega prontos, acessíveis e mantidos por terceiros. Beneficiários: o mantenedor único (menos CSS próprio para sustentar) e, indiretamente, o médico prescritor (consistência visual e acessibilidade entre telas presentes e futuras).

Decisão de identidade (esclarecimento 1, sessão 2026-07-21): a identidade Primer prevalece **integralmente** — tokens, tipografia e componentes. O projeto Claude Design "Tela de calculadora de insulina", até aqui fonte visual canônica portada token a token para `globais.css`, é superado e arquivado como referência histórica.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#6-dívidas-técnicas` | Dívida nº 4: `globais.css` com 699 LOC, acima do limite de 400 do mantenedor (a parte `formulario.tsx` foi quitada pela feature 001) | 🟢 |
| `_reversa_sdd/inventory.md#estrutura-de-pastas` | Estilo concentrado em `interface/estilos/globais.css`; UI React em `interface/calculadora/` com tema claro/escuro via `preferencia-de-tema.ts` (localStorage) | 🟢 |
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Privacidade por arquitetura: sem fetch em runtime, sem telemetria (ADR 0002/0007); dependência unidirecional `pages → interface → models` (ADR 0003) | 🟢 |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | CSP (Content Security Policy) sem terceiros, `Referrer-Policy` e `nosniff` reconstituídos em `next.config.ts` e vigiados por teste de contrato — qualquer estilo novo deve caber dentro dessa CSP | 🟢 |
| `_reversa_sdd/addenda/001-integrar-design-claude.md` | A tela atual realiza o design aprovado no Claude Design (tokens, tipografia IBM Plex Sans/Mono, layout, entrada por momento); `formulario.tsx` decomposto em subcomponentes | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-2--interfacecalculadora-apresentação` | Máquina de estados `EstadoResultado`, validação espelhada via `CONSTANTES` e ritual de revisão: comportamento da UI que a re-estilização não pode alterar | 🟢 |
| `_reversa_sdd/inventory.md#tecnologias-e-frameworks` | Next.js 16 (Pages Router), React 19, npm com lockfile, versões pinadas — o Primer React declara suporte a React moderno; compatibilidade exata a confirmar no plan | 🟡 |
| Verificação externa (2026-07-21, primer.style / npm / GitHub) | `@primer/react` ativo (v38.x, release dias atrás, migração para CSS Modules reduzindo bundle); `@primer/css` em modo KTLO ("keep the lights on"); `view_components` em manutenção. Adoção viável só pela via React | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico prescritor da APS (Atenção Primária à Saúde) | Calcular condutas de insulinização com interface clara, acessível e consistente | Usa a calculadora no consultório, alternando tema claro/escuro conforme o ambiente |
| Mantenedor único (iagoleal) | Criar telas novas da plataforma sem reescrever CSS de base a cada feature | Ao abrir a próxima ferramenta da plataforma, compõe a tela com componentes prontos do design system em vez de estilizar do zero |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A adoção do Primer é estritamente de apresentação: nenhuma regra clínica, validação, texto de conduta ou máquina de estados da UI muda; `models/insulina/**` permanece intocado. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1-estilo-arquitetural` (ADR 0003, domínio fora do framework)
   - Tipo: nova (fronteira da feature)
2. **RN-02:** A privacidade por arquitetura permanece: nenhum recurso de estilo (CSS, fonte, ícone, script) pode ser carregado de origem externa em runtime; tudo entra pelo bundle próprio, dentro da CSP sem terceiros vigiada pelo teste de contrato. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#6-fronteiras-de-escopo` (MD-0011) e `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md`
   - Tipo: alterada (a regra existente passa a condicionar a escolha de pacotes e o modo de importar fontes/estilos)
3. **RN-03:** Só entram pacotes do Primer com manutenção ativa: `@primer/react` (e primitives/tokens que ele consome). `@primer/css` (KTLO) e `view_components` (manutenção) ficam vetados. 🟡
   - Origem: verificação externa de 2026-07-21 (filtro de longevidade do Princípio nº 3 global)
   - Tipo: nova
4. **RN-04:** O comportamento de tema claro/escuro persiste como está para o usuário (alternância manual + persistência em localStorage), qualquer que seja o mecanismo interno de color mode adotado. 🟢
   - Origem no legado: `_reversa_sdd/inventory.md#estrutura-de-pastas` (`preferencia-de-tema.ts`)
   - Tipo: nova (invariante de preservação)
5. **RN-05:** A fonte visual canônica do projeto passa a ser o Primer; o projeto Claude Design e seus tokens (paleta verde-clínica, IBM Plex Sans/Mono) deixam de ter autoridade de estilo, e nenhum artefato novo pode citá-los como fonte. 🟢
   - Origem: esclarecimento 1 (sessão 2026-07-21), superando a leitura de `_reversa_sdd/addenda/001-integrar-design-claude.md` quanto à fonte visual (as regras clínicas daquela feature permanecem intactas)
   - Tipo: alterada

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Fundar a base de estilo Primer no projeto: dependência pinada, provider/tema configurado no shell (`pages/_app.tsx`) e diretriz de uso registrada para telas futuras | Must | `@primer/react` no `package.json` com lockfile atualizado; app builda e roda com o provider ativo; README documenta como criar tela nova com o padrão | 🟢 |
| RF-02 | Migrar a tela da calculadora **inteira** para componentes do design system (formulário, resultado, alertas, painel de conduta), sem mudança de comportamento | Must | As 3+ suítes de integração da UI passam sem alteração de asserções comportamentais; `EstadoResultado`, validação espelhada e ritual de revisão intactos | 🟢 |
| RF-03 | Preservar o tema claro/escuro do usuário, mapeando a alternância atual para o mecanismo de color mode da base nova | Must | Alternar o tema na UI muda todas as superfícies; a preferência sobrevive a recarga da página (localStorage) | 🟢 |
| RF-04 | Reduzir `globais.css` a resíduo abaixo do limite de 400 linhas nesta feature, movendo o que for componente para o design system e removendo os tokens do design superado | Must | `wc -l` de `globais.css` < 400; dívida técnica nº 4 quitada na extração | 🟢 |
| RF-05 | Manter ou melhorar a acessibilidade da tela (rótulos, contraste, navegação por teclado), com harness Playwright + axe montado nesta feature (quita a parte e2e da dívida técnica nº 3) | Should | Script `test:e2e` funcional com verificação axe; linha de base capturada sobre a tela atual antes da migração; tela re-estilizada sem violações novas em relação a ela | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança/Privacidade | Zero requisições de runtime a origens externas por causa do estilo; CSP do `next.config.ts` inalterada e verde no teste de contrato | ADR 0002; `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | 🟢 |
| Desempenho | Acréscimo de bundle medido antes/depois do build e registrado no relatório da feature, sem gate bloqueante; delta acima de 100 kB gzip no first load reabre o ponto como decisão no plano; a variante CSS Modules do v38 é a exigida | Esclarecimento 4 (sessão 2026-07-21); discussão de release do Primer React v38 | 🟢 |
| Reprodutibilidade | Versões pinadas e lockfile commitado; nenhum recurso de estilo resolvido em tempo de execução | Princípio nº 5.3 global; padrão já praticado no repo | 🟢 |
| Manutenibilidade | Menos CSS próprio sob responsabilidade do mantenedor; componentes visuais delegados a design system com organização ativa por trás (GitHub) | Dívida nº 4; filtro de longevidade | 🟢 |
| Observabilidade | n/a — feature de apresentação, sem novos pontos de falha em runtime além do build | Proporcionalidade (Princípio VIII do projeto) | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: calculadora re-estilizada preserva o comportamento
  Dado o formulário da calculadora preenchido com um caso válido de início de insulinização
  Quando o médico executa o cálculo e cumpre o ritual de revisão
  Então a conduta exibida é idêntica à da versão anterior, byte a byte nos textos clínicos
  E as suítes de integração da UI passam sem asserções comportamentais alteradas

Cenário: tema do usuário sobrevive à migração de estilo
  Dado o tema escuro selecionado e persistido em localStorage
  Quando a página é recarregada
  Então todas as superfícies renderizam no modo escuro da base nova

Cenário: privacidade por arquitetura resiste ao estilo novo
  Dado o build de produção servido localmente
  Quando a tela da calculadora é carregada e utilizada de ponta a ponta
  Então nenhuma requisição de rede sai para origem externa
  E o teste de contrato dos cabeçalhos de segurança (CSP) permanece verde

Cenário: fundação pronta para telas futuras (RF-01, RF-04)
  Dado o repositório após a feature
  Quando se inspeciona o manifesto, o shell da aplicação e o README
  Então a dependência do design system está pinada com lockfile commitado
  E o provider de tema está ativo no shell
  E `interface/estilos/globais.css` tem menos de 400 linhas

Cenário: acessibilidade não regride (RF-05)
  Dado a verificação automática de acessibilidade executada sobre a tela atual (linha de base)
  Quando a mesma verificação roda sobre a tela re-estilizada
  Então o número de violações é menor ou igual ao da linha de base

Cenário (negativo): pacote vetado não entra
  Dado o manifesto do projeto após a feature
  Quando se inspeciona a lista de dependências
  Então `@primer/css` e `@primer/view-components` não constam em nenhuma seção
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem a fundação (dependência + provider + diretriz), a feature não existe |
| RF-02 | Must | Uma base de estilo que a tela real não usa é decoração; a calculadora é a prova |
| RF-03 | Must | Regressão de tema é perda funcional visível ao usuário (RN-04) |
| RF-04 | Must | O usuário escolheu a migração completa nesta feature justamente para quitar a dívida nº 4 (esclarecimento 2) |
| RF-05 | Should | Acessibilidade já tem ferramenta no repo; não deve regredir, melhoria é bônus |
| RNF de desempenho | Should | Medição obrigatória sem gate; limiar de reabertura de 100 kB gzip fixado no esclarecimento 4 |

## 9. Esclarecimentos

### Sessão 2026-07-21

- **Q:** Precedência da fonte visual: Primer tematizado com os tokens aprovados, identidade Primer integral ou híbrido?
  **R:** Identidade Primer integral (opção b): tokens, tipografia e componentes do Primer; o design do Claude Design é superado e arquivado como referência histórica. Integrado no §1 e na RN-05.
- **Q:** Alcance da re-estilização: migrar a calculadora inteira agora, só a fundação, ou migração fatiada?
  **R:** Migrar a calculadora inteira nesta feature (opção a), quitando a dívida técnica nº 4 (`globais.css` 699 linhas). Integrado no RF-02 e RF-04 (promovido a Must).
- **Q:** Profundidade da adoção: componentes completos, só tokens/primitives, ou mistura?
  **R:** Componentes completos do design system (opção a), substituindo os elementos estilizados à mão. Integrado no RF-02.
- **Q:** Teto de acréscimo de bundle: gate numérico ou medição registrada?
  **R:** Sem gate bloqueante (opção c, recomendação do esclarecedor confirmada pelo usuário): medir antes/depois do build e registrar o delta no relatório da feature; delta acima de 100 kB gzip no first load reabre o ponto como decisão no plano. Integrado no RNF de desempenho e no MoSCoW.
- **Q:** Linha de base de acessibilidade: harness Playwright + axe agora, axe em jsdom, ou conferência manual?
  **R:** Montar nesta feature o harness mínimo Playwright + axe (opção a, recomendação do esclarecedor confirmada pelo usuário), capturando a linha de base antes da migração e quitando a parte e2e da dívida técnica nº 3. Integrado no RF-05.

## 10. Lacunas

Nenhuma lacuna aberta. A sessão de 2026-07-21 resolveu as cinco dúvidas levantadas (ver §9).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-21 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-21 | Sessão de esclarecimentos: dúvidas 1–3 resolvidas (identidade Primer integral; migração completa da calculadora; componentes completos); RF-04 promovido a Must; RN-05 criada | reversa |
| 2026-07-21 | Esclarecimentos 4 e 5 confirmados (medição de bundle sem gate, limiar 100 kB; harness Playwright + axe nesta feature); lacunas zeradas | reversa |
