# Contrato: manifesto do aplicativo instalável

> Identificador: `018-revisao-linguagem-textos`
> Tipo: arquivo (`public/manifest.webmanifest`, servido em `/manifest.webmanifest`)
> Consumidores externos: navegador, ao instalar o aplicativo; tela inicial do dispositivo
> Origem no legado: feature 009 (`_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md`)
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Natureza do contrato

O manifesto é lido uma vez, pelo navegador, no momento da instalação, e o texto que ele declara **persiste no dispositivo do usuário** até a reinstalação. É a prosa de vida mais longa da plataforma: enquanto o `<title>` de uma aba se refaz a cada carga, o `name` do manifesto fica gravado sob o ícone na tela inicial de quem instalou. Daí entrar como contrato próprio, e não como mais três literais do inventário.

É declarado em `pages/_document.tsx` por `<link rel="manifest" href="/manifest.webmanifest" />`, sob a política de segurança de conteúdo vigente — `manifest-src` recai em `default-src 'self'`. Nada disso muda.

## 2. Estado atual, conferido 🟢

| Campo | Valor | Classe | Situação |
|---|---|---|---|
| `name` | `APS Inteligente` | autoral | Íntegro |
| `short_name` | `APSi` | identificador de marca | Fora da revisão |
| `description` | `Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador` | autoral | Sujeita a RF-04 e RF-03 |
| `start_url`, `scope`, `display` | `/`, `/`, `standalone` | identificador | Fora da revisão |
| `theme_color`, `background_color` | `#0969da`, `#ffffff` | identificador | Fora da revisão |
| `icons` | dois tiles, 192 e 512 | identificador | Fora da revisão |

A `description` traz um ponto médio, e o usa exatamente na função que RN-10 lhe atribui: separar duas unidades de informação de mesma hierarquia, ladeada por espaço simples. Serve de exemplo canônico para o par antes/depois do guia. (A cifra de quantas posições existem no repositório saiu daqui na terceira passagem, por L-13: contagem é dado gerado, e o inventário é quem a emite.) 🟢

**Este literal não é só do manifesto.** A mesma sequência, byte a byte, é o subtítulo do hero da home, em `interface/inicio/tela.tsx`. A duplicação precede a feature, e a revisão alcança os dois lados no mesmo ato, com a igualdade asseverada por teste — não por elegância, mas porque revisar um só converteria duplicação em divergência, que é o estado que RN-05 existe para impedir. A unificação técnica ficou descartada: o manifesto é JSON estático em `public/` e não importa constante de TypeScript (D-18). 🟢

## 3. O que muda

Apenas a `description`, e por dois motivos que se somam:

1. **RF-04, alinhamento ao catálogo, na forma negativa.** A descrição atual não enumera seções — diz apenas "Calculadoras clínicas para a Atenção Primária à Saúde" —, e por isso **não carrega o defeito de exatidão da home**. A leitura que este contrato adotava como estrita passou a ser a decidida: RN-06 e D-17 fixam **duas** formas de verificação, uma por superfície. A home responde à forma **positiva**, porque enumera e enumera errado, e só exigir dela a enumeração completa corrige o defeito e o impede de voltar. O manifesto responde à forma **negativa** — não enumerar subconjunto próprio —, que ele já cumpre hoje. Obrigá-lo às quatro seções custaria sessenta e três caracteres antes de qualquer moldura, contra o teto do parágrafo seguinte. 🟢
2. **RF-03, revisão de forma.** É prosa autoral e responde ao guia como qualquer outra: grafia, ponto médio, capitalização depois do separador. A pergunta que o guia terá de responder é se `cálculo 100% no navegador`, hoje em caixa baixa após o `·`, permanece assim.

**Restrição dura.** O manifesto tem um teto prático de comprimento útil: descrição longa é truncada na apresentação de instalação, com corte variável por plataforma. A reescrita deve caber com folga no que hoje existe — 78 caracteres — e não aproveitar a revisão para alongar. 🟡

## 4. O que não muda

- `name` e `short_name`, que são a marca fixada pela feature 009 e não prosa revisável. Alterá-los mudaria o rótulo sob o ícone de quem já instalou.
- Todos os campos de identificador: `start_url`, `scope`, `display`, cores e ícones.
- O `<link rel="manifest">` e a política de segurança de conteúdo.

## 5. Erros, idempotência e propagação

- **Idempotência.** Arquivo estático; a mesma requisição devolve o mesmo conteúdo.
- **Modo de falha.** JSON malformado quebra a instalação silenciosamente — o navegador ignora o manifesto e a instalabilidade desaparece sem erro visível. É o risco específico de editar este arquivo à mão, e a mitigação é o teste de validade que a feature deve garantir.
- **Propagação.** Aqui está a diferença que justifica o cuidado: **quem já instalou não recebe o texto novo** até que o navegador reavalie o manifesto ou o usuário reinstale. O momento e o critério dessa reavaliação variam por plataforma. A revisão, portanto, alcança instalações futuras de imediato e as existentes com atraso indeterminado. 🟡

Consequência prática para o plano: nenhuma. A descrição do manifesto não afirma nada clinicamente relevante, e a defasagem temporária não induz erro. Ficaria diferente se a revisão tivesse alterado `name` — e é mais uma razão para não alterá-lo.

## 6. Verificação

| O que se verifica | Onde |
|---|---|
| O arquivo é JSON válido e conserva os campos obrigatórios | Teste a criar em `tests/unit/textos/`, na leitura do arquivo. **Não** em `tests/contract/`, apesar da vizinhança temática com o `cabecalhos.test.ts`: aquela pasta roda só por `npm run test:api`, sob configuração que exige build de produção e servidor de pé, e ficaria fora dos gates do plano (D-15) |
| A `description` não enumera subconjunto próprio das seções de `CATALOGO` | Teste de RF-04, mesmo oráculo da home, **forma negativa** — a positiva é da home e não se aplica aqui (D-17) |
| A `description` permanece idêntica ao subtítulo de `interface/inicio/tela.tsx` | Asserção de igualdade entre as duas superfícies, na suíte padrão (D-18, RN-05) |
| `name` e `short_name` permanecem `APS Inteligente` e `APSi` | Asserção explícita, para que a revisão não os alcance por descuido |
| A `description` respeita a regra de forma do ponto médio | Teste de norma de RF-05 |
| Os três campos textuais constam do inventário com classe atribuída | Gerador de RF-02 |

Nota de implementação: o manifesto é JSON, não TypeScript, e fica fora do alcance da travessia de árvore sintática de D-03. O gerador precisa de um caminho de leitura próprio para ele — três campos lidos por chave, sem parser especial —, do mesmo modo que precisará para o `README.md`. 🟢

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-07-27 | Terceira passagem: §2 perde a contagem de posições de ponto médio (L-13) e registra que a `description` é literal duplicado com o subtítulo da home (D-18); §3 fixa a forma **negativa** da verificação de RF-04 para esta superfície, que era leitura do plano e virou decisão (D-17); §6 ganha a asserção de igualdade entre as duas superfícies | reversa |
