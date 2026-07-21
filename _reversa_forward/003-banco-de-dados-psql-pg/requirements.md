# Requirements: Fundação de banco de dados relacional (serviço local, acesso e saúde)

> Identificador: `003-banco-de-dados-psql-pg`
> Data: `2026-07-21`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature materializa a intenção de infraestrutura declarada no legado (`infra/compose.yaml` vazio desde a refundação): um banco de dados relacional que sobe localmente por comando único e reproduzível e existe também em produção, por meio de provedor gerenciado integrado à plataforma de hospedagem; uma camada de acesso programático confinada à infraestrutura; e uma verificação de saúde com falha barulhenta, executada dentro da suíte de contrato da API. É fundação pura: nenhum esquema de negócio nasce aqui — a demanda concreta de persistência virá em feature futura (sessão de esclarecimento de 2026-07-21). Nenhum dado clínico ou pessoal é persistido: a fronteira MD-0003/MD-0011 permanece intacta, e o comportamento do produto (calculadora e contrato do endpoint de status) não muda. Restrição declarada pelo usuário no pedido: banco PostgreSQL, com acesso interativo via cliente `psql` e consultas programáticas via biblioteca `pg` (registrada como restrição de stack, não como requisito funcional; a decisão técnica formal pertence ao roadmap).

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#3-dados` | "Sem banco (ausência por design)"; gatilho registrado: a futura etapa de banco reabre LGPD (Lei Geral de Proteção de Dados), autenticação e specs | 🟢 |
| `_reversa_sdd/domain.md#6-fronteiras-de-escopo` | Persistência de dado clínico excluída por arquitetura (MD-0003); rotas de API permitidas apenas sem dado clínico (MD-0011) | 🟢 |
| `_reversa_sdd/domain.md#7-intenções-declaradas-e-não-realizadas` | `infra/compose.yaml` existe porém vazio — intenção de infraestrutura declarada e não realizada | 🟢 |
| `_reversa_sdd/inventory.md#estrutura` | `infra/compose.yaml` como placeholder de infraestrutura; sem banco de dados no projeto | 🟢 |
| `_reversa_sdd/permissions.md#vigilância-futura` | Se a etapa do banco se concretizar, autenticação, papéis e análise LGPD deixam de ser "n/a" e exigem spec própria **antes do código** | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | Privacidade resolvida por arquitetura: sem coleta, sem backend com estado para dado do usuário | 🟢 |
| `_reversa_sdd/erd-complete.md` | Entidades do domínio existem apenas em memória (`EntradaCalculo` → `SaidaCalculo`); nada delas é persistido | 🟢 |
| `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md` | Estado atual: produção no ar com `GET /api/v1/status` de contrato fixo e CI de três jobs com deploy gateado; mudança incompatível de contrato exige `/api/v2` | 🟢 |
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Três camadas com dependência unidirecional; regra clínica isolada de framework (ADR 0003) — a camada de infraestrutura é o único lugar legítimo para acesso a dados | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Mantenedor do projeto | Ter um banco local reproduzível para desenvolver features de persistência | Executa um comando, o banco sobe; consulta interativamente e programaticamente; verifica a saúde; derruba sem resíduo |
| Médico prescritor da APS (atenção primária à saúde) | Não é afetado nesta fase | A calculadora em produção segue 100% client-side; nenhum fluxo do prescritor toca o banco |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Nenhum dado clínico ou pessoal é persistido no banco nesta feature; o esquema criado (se algum) não contém tabela ou coluna que represente paciente, cálculo clínico ou identificador pessoal. A fronteira MD-0003/MD-0011 permanece em vigor com alcance ampliado: agora existe banco, e a exclusão passa a valer também dentro dele. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#6-fronteiras-de-escopo` (MD-0003, MD-0011); `_reversa_sdd/adrs/0002`
   - Tipo: nova (reafirmação com alcance novo)
2. **RN-02:** O domínio clínico (`models/insulina/`) e a interface (`interface/calculadora/`) permanecem sem qualquer dependência do banco; todo acesso a dados vive exclusivamente na camada de infraestrutura (`infra/`). 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1-estilo-arquitetural` (ADR 0003, dependência unidirecional)
   - Tipo: nova
3. **RN-03:** O endpoint de saúde existente (`GET /api/v1/status`) não passa a depender do banco: seu contrato fixo e sua propriedade "não depende de nenhum estado externo" são preservados. Saúde do banco é verificação separada, que vive na suíte de contrato da API sem alterar o contrato do endpoint. 🟢
   - Origem no legado: `_reversa_sdd/addenda/002-producao-pagina-e-api-status.md`; RN-01 da feature 002
   - Tipo: nova (proteção de regra existente)
4. **RN-04:** Configuração de conexão fica fora do código (variáveis de ambiente); nenhuma credencial é commitada. 🟢
   - Origem no legado: princípio global 5.1 ("configuração fora do código"); `.reversa/principles.md` (Princípio I — spec antes de código)
   - Tipo: nova
5. **RN-05:** Falha de conexão ou de saúde do banco é barulhenta: erro nomeado, mensagem clara, sem fallback silencioso e sem sucesso fingido. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1-estilo-arquitetural` (erros como valores, ADR 0004, por analogia); princípio global "erros barulhentos > performance"
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O serviço de banco local sobe por comando único e reproduzível a partir do descritor versionado em `infra/`, com versão do serviço pinada | Must | Em máquina com o runtime de containers instalado, um comando documentado deixa o banco aceitando conexões; reexecutar é idempotente | 🟢 |
| RF-02 | A camada de infraestrutura expõe módulo de acesso programático com conexão e execução de consultas parametrizadas | Must | Uma consulta de fumaça retorna resultado; consulta com parâmetros funciona; o módulo é o único ponto de acesso ao banco no projeto e passa no typecheck do repositório | 🟢 |
| RF-03 | O mantenedor abre sessão interativa de linha de comando no banco por atalho documentado | Should | Um comando único (script do manifesto ou documentado no README) abre a sessão interativa conectada ao banco local | 🟢 |
| RF-04 | A verificação de saúde do banco roda dentro da suíte de contrato da API, sem alterar o contrato do endpoint de status | Must | Com o banco acessível, o teste de saúde passa junto da suíte; com o banco fora, falha explícita com erro nomeado dentro de tempo-limite finito e documentado (RN-05); o contrato de `GET /api/v1/status` permanece idêntico (RN-03) | 🟢 |
| RF-05 | O README responde: como subir o banco, como configurar as variáveis, como verificar saúde, como derrubar | Must | As quatro respostas existem e funcionam quando seguidas do zero | 🟢 |
| RF-06 | O ambiente local pode ser derrubado e limpo sem resíduo (serviço e volume de dados) | Could | Um comando derruba o serviço e remove o volume; nova subida parte do estado inicial | 🟡 |
| RF-07 | O banco existe em produção por meio de provedor gerenciado integrado à plataforma de hospedagem, com credenciais apenas em variáveis de ambiente do projeto | Must | A consulta de fumaça executa com sucesso contra a instância de produção usando credenciais de ambiente; nenhuma credencial aparece no repositório; provedor com nível de entrada gratuito preferido (Princípio global nº 3) | 🟢 |

Nota de derivação (Princípio II): o `P_n` foi clarificado na sessão de 2026-07-21 como **fundação de infraestrutura pura** — habilitar persistência para features futuras, sem esquema de negócio nesta entrega. Os RFs derivam desse problema validado e da restrição de stack declarada pelo usuário.

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Reprodutibilidade | Versão do serviço de banco pinada no descritor; dependência de acesso pinada no manifesto com lockfile commitado | Princípio global 5.3 (build determinístico); `_reversa_sdd/architecture.md#6` ("sem dívida de dependências: versões pinadas") | 🟢 |
| Segurança | Credenciais só em variáveis de ambiente; banco local não exposto além do host; nenhum dado clínico ou pessoal no esquema (RN-01) | `_reversa_sdd/adrs/0002`; `_reversa_sdd/permissions.md#vigilância-futura` | 🟢 |
| Observabilidade | Erros de conexão e de saúde nomeados (classe ou enum) com log estruturado na camada de infraestrutura; nunca falha silenciosa | Princípio global 5.2; RN-05 | 🟢 |
| Desempenho | n/a nesta fase — sem carga de produção nem consulta de negócio | Fundação local, sem usuário externo | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: subir o banco e verificar saúde
  Dado uma máquina com o runtime de containers instalado e as variáveis de ambiente configuradas
  Quando o mantenedor executa o comando de subida e, em seguida, a verificação de saúde
  Então o banco aceita conexões e a verificação retorna sucesso

Cenário: consulta programática pela camada de infraestrutura
  Dado o banco local de pé
  Quando o módulo de acesso executa a consulta de fumaça parametrizada
  Então o resultado retorna sem erro e a conexão é devolvida ao pool

Cenário: sessão interativa
  Dado o banco local de pé
  Quando o mantenedor executa o atalho de sessão interativa
  Então uma sessão de linha de comando conectada ao banco se abre

Cenário: banco fora do ar (caso negativo)
  Dado o serviço de banco parado
  Quando a verificação de saúde é executada
  Então ela termina em falha explícita, com erro nomeado e mensagem clara, sem sucesso silencioso

Cenário: fronteira de privacidade preservada (caso negativo)
  Dado o esquema criado por esta feature
  Quando inspecionado
  Então não existe tabela nem coluna que represente dado clínico ou pessoal

Cenário: saúde do banco dentro da suíte de contrato
  Dado o build de produção local de pé e o banco local acessível
  Quando a suíte de contrato da API executa
  Então o teste de saúde do banco passa e o contrato de GET /api/v1/status permanece inalterado

Cenário: banco de produção acessível
  Dado o provedor gerenciado provisionado e as credenciais nas variáveis de ambiente do projeto
  Quando a consulta de fumaça roda contra a instância de produção
  Então o resultado retorna sem erro e nenhuma credencial consta do repositório

Cenário: retomada do zero pelo README
  Dado um clone limpo do repositório em máquina com o runtime de containers
  Quando o mantenedor segue apenas o README
  Então consegue subir o banco, configurar as variáveis, verificar a saúde e derrubar o serviço

Cenário: teardown sem resíduo
  Dado o banco local de pé com dados de teste gravados
  Quando o mantenedor executa o comando de derrubada com limpeza
  Então o serviço para, o volume de dados é removido e uma nova subida parte do estado inicial

Cenário: produção intocada (caso negativo)
  Dado o deploy de produção vigente
  Quando a feature é entregue
  Então o contrato de GET /api/v1/status permanece idêntico e a calculadora segue 100% client-side
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem o serviço reproduzível não há feature; é a intenção declarada do legado |
| RF-02 | Must | O acesso programático confinado à infraestrutura é o valor durável da fundação (RN-02) |
| RF-04 | Must | Erros barulhentos são princípio do mantenedor; saúde verificável é o critério de "está de pé" |
| RF-05 | Must | README MVP é obrigação global a cada mudança que o invalide |
| RF-07 | Must | Ambiente-alvo inclui produção por decisão do usuário (sessão 2026-07-21); sem ele a fundação não serve ao produto publicado |
| RF-03 | Should | Conveniência de operação; o acesso programático já cobre o essencial |
| RF-06 | Could | Higiene de ambiente; não bloqueia o uso da fundação |
| RNF de reprodutibilidade | Must | Single maintainer intermitente: o ambiente precisa subir igual daqui a meses |

## 9. Esclarecimentos

### Sessão 2026-07-21

- **Q:** Qual demanda de fundo o banco atende — que dados ele vai armazenar?
  **R:** (1a) Nenhuma ainda: fundação de infraestrutura pura; a demanda concreta de persistência virá em feature futura. Nenhum esquema de negócio nasce nesta entrega.
- **Q:** Confirma que o banco fica restrito a dados não clínicos e não pessoais (fronteira MD-0003/MD-0011 mantida)?
  **R:** (2a) Sim, confirmado. RN-01 vigente sem exceção; o gatilho de autenticação/LGPD (`permissions.md#vigilância-futura`) permanece armado para o futuro, não disparado.
- **Q:** Qual o ambiente-alvo desta feature?
  **R:** (3b) Local **e** produção nesta mesma feature. Produção via provedor de banco gerenciado integrado à plataforma de hospedagem (marketplace; a plataforma não oferece mais banco próprio), com preferência por nível de entrada gratuito (Princípio global nº 3). Originou o RF-07.
- **Q:** Em que linguagem nasce o módulo de acesso da camada de infraestrutura?
  **R:** (4a) Na linguagem tipada do repositório (TypeScript): o módulo será `infra/database.ts`, sujeito ao typecheck do CI. O `infra/database.js` vazio criado em 2026-07-21 será substituído por esse módulo (remoção registrada como ação do coding).
- **Q:** Onde a verificação de saúde do banco deve rodar?
  **R:** (livre) "Rodar dentro do teste de status" — integrada à suíte de contrato da API (`test:api`), ao lado do teste do endpoint de status, sem alterar o contrato do endpoint (RN-03). Implicação registrada para o plano: o job de contrato do CI passa a precisar de um banco alcançável (serviço de banco no job ou instância gerenciada), decisão técnica do roadmap.

## 10. Lacunas

- Nenhuma lacuna aberta. As três dúvidas iniciais (escopo/demanda, privacidade, ambiente-alvo) foram resolvidas na sessão de 2026-07-21 acima.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-21 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-21 | Sessão de esclarecimento: 5 respostas integradas; RF-04 reescrito (saúde na suíte de contrato), RF-07 adicionado (produção via provedor gerenciado); lacunas zeradas | reversa-clarify |

## Pendências de Qualidade

- Q-018 (SoluçãoImplícita) — desvio deliberado: o documento cita uma vez, no resumo, os nomes de stack (`PostgreSQL`, `psql`, `pg`) porque são **restrição declarada pelo usuário no pedido**, não escolha do redator; os RFs permanecem funcionais e a decisão técnica formal fica para o roadmap (`/reversa-plan`).
