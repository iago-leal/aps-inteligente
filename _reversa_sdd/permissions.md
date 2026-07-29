# Permissões e Papéis — aps-inteligente

> Regenerado pelo Reversa Detective em 2026-07-28 (**re-extração nº 4**).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Veredito

🟢 **Não há RBAC, ACL, autenticação nem sessão.** A plataforma é um conjunto de páginas estáticas com cálculo 100% client-side (MD-0003, ADR 0002): não existe usuário identificado nem backend com estado de aplicação. A ausência é **por design**, porque a privacidade se resolve por arquitetura: sem coleta, não há acesso a controlar.

O veredito sobrevive intacto às oito features desta janela, e três delas mereciam a conferência, por serem as que mais se aproximaram de mudá-lo:

- **A feature 019** trouxe um meio de pagamento à home, e não trouxe transação: o painel de PIX é **vitrine de chave**, montada no próprio navegador, sem confirmação, sem retorno e sem que a plataforma saiba se alguém contribuiu. Não nasceu identidade, nem valor a proteger.
- **A feature 020** trouxe a primeira tela que registra dados de um **terceiro**, a criança, e nenhum campo a identifica: não há nome, prontuário nem documento, o registro é derivado em memória e nada é salvo, o que o roteiro de ponta a ponta afere por zero rede e zero durável novo.
- **A feature 022** ligou o healthcheck ao banco, e a rota continua **pública, sem autenticação e sem dado clínico**.

## Papel único

| Papel | Descrição | Acesso |
|---|---|---|
| Prescritor (anônimo) | Médico da APS usando qualquer das seis calculadoras no navegador | Tudo que a tela oferece; nenhum dado sai do dispositivo |

🟡 As personas do PRD antigo são variações do mesmo papel técnico: não há diferenciação de capacidade no código. 🟢 O **paciente e a criança** aparecem como sujeitos dos dados digitados, jamais como usuários: não têm conta, não são identificados e não deixam rastro.

## Gates comportamentais (o que existe em vez de permissão)

Controles com papel análogo ao de autorização, todos voltados à **segurança clínica**, e não à identidade:

1. 🟢 **Ritual de revisão** (insulina): "Pronto para prescrever" e **Copiar plano** só se habilitam depois de marcado "Revisei a dose e a fonte", e qualquer edição desfaz. Gate de responsabilização. **Específico da insulina** (ADR 0012): datar, estratificar, estimar risco, avaliar crescimento e preencher ficha não prescrevem dose.
2. 🟢 **Gate de HbA1c na intensificação** (insulina): o motor recusa iniciar Regular sem HbA1c acima de 7% e pré-prandiais aferidas. Autorização clínica embutida na regra.
3. 🟢 **Recusa fora do escopo da fonte** (transversal): insulina fora de NPH/Regular, idade fora de 30–69 na cardiopatia, idade fora de 40–79 ou DCV prévia no risco cardiovascular, `sem-parametro-na-fonte` no 3.º trimestre. São "não autorizações" clínicas: o motor prefere calar a extrapolar.
4. 🆕 🟢 **Recusa parcial** (puericultura): o perímetro cefálico sai de escopo acima de 730 dias **sem derrubar** os demais índices. É a gradação que faltava ao gate anterior, que era tudo ou nada.
5. 🆕 🟢 **Recusa em vez de truncamento** (contribuição): nome acima de 25 caracteres ou cidade acima de 15 fazem o painel exibir erro, e não um beneficiário errado na câmera de quem contribui.
6. 🆕 🟢 **Omissão como asserção negativa** (consulta): campo sem resposta não entra no registro, e seção sem item some inteira, cabeçalho incluído. O gate protege contra o produto **afirmar averiguação que não houve**, que é a forma de dano específica de um texto de prontuário.
7. 🆕 🟢 **O produto não forma juízo próprio** (consulta): a seção de avaliação só recebe o que a fonte imprime como juízo, e os escores vão para a objetiva. O motor transpõe, não conclui.

## Superfície de rede (sem controle de acesso, por contrato)

🟢 A única superfície de rede continua sendo `GET /api/v1/status` (feature 002, ADR 0008): **público, sem autenticação, sem estado de aplicação e sem dado clínico**, deliberadamente sem guarda de acesso porque não há o que proteger. Discrimina só o método HTTP (405 com `Allow: GET`) e responde `no-store`.

🆕 🟢 **O que mudou na feature 022 é o que a rota faz, não quem pode chamá-la.** O handler passou a `async` e consulta o banco a cada requisição, de modo que a rota deixou de ser pura. Três consequências para esta análise:

1. **A discriminação de método precede todo I/O**, e por isso um `POST` não desperta a instância do banco. É a única forma de "controle de acesso" da rota, e é sobre verbo, não sobre identidade.
2. **A guarda de privacidade permanece comportamental**, sem allowlist nominal, e teve o alcance ampliado: "não vazar" passou a incluir não vazar **host, URL de conexão nem trecho de SQL** no corpo, e a suíte de contrato afere isso sobre o corpo realmente serializado, **nos dois estados do banco**.
3. **A falha da dependência é valor, não código de status** (`MD-0031`, ADR 0020): 200 em todo estado do banco, com o estado e a causa em vocabulário público. Isso significa que o corpo passou a revelar, a quem quer que chame, se o banco está íntegro ou degradado. É informação operacional deliberadamente pública, no mesmo espírito de `commit` e `versao`, e não há nada nela que identifique instância, credencial ou consulta.

🟢 O banco (`infra/database.ts`) continua acessível **exclusivamente** pelo healthcheck, agora com `infra/saude.ts` como único importador de `saude()` em produção, e não guarda nada de clínico: não tem tabela de negócio, e a consulta é `SELECT $1::int AS ok`.

## Configuração e segredo

🟢 **A chave PIX mora no repositório, e é decisão e não descuido** (feature 019): é dado público por natureza, existe para ser exibido, e num produto client-side uma variável `NEXT_PUBLIC_*` terminaria no mesmo bundle sem proteger coisa alguma. `beneficiario.ts` é ponto único de configuração, na camada de apresentação e não no domínio, porque é dado de instalação e não regra. O valor de exemplo permanece no código como **oráculo**: a suíte reprova enquanto o beneficiário real for igual a ele.

🟢 **A credencial do banco não está no código** e não aparece no corpo nem no log: o log estruturado mascara sempre o host, e nunca imprime URL nem credencial.

## Vigilância futura

- 🔴 Se uma etapa de persistência de dado clínico vier a existir (gatilho MD-0003/MD-0011), autenticação, papéis e análise LGPD deixam de ser "n/a" e exigem spec própria antes do código. Nada no estado atual aponta para isso, e a feature 020, que teria sido a candidata natural, resolveu o problema **sem** persistir.
- 🟡 Se aparecer consumidor que consulte `/api/v1/status` em laço, a verificação de dependência migra para rota própria (`MD-0032`). O gatilho é observável e a migração é barata por construção, porque o campo já existe e o contrato é aditivo.
- 🟢 A guarda de privacidade da API está viva e verificada, e não presumida: a feature 022 a exercitou com o banco de pé e com o banco fora.
