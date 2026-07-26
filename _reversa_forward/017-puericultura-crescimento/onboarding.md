# Onboarding: testar a calculadora de crescimento infantil pela primeira vez

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Público: o mantenedor, inclusive o de daqui a doze meses, que quer verificar a feature à mão.

## 1. Antes de começar

Nada aqui exige credencial, chave, serviço externo ou banco de dados. O cálculo é local e a
tela não faz requisição de rede.

```bash
cd ~/dev/aps-inteligente
npm ci                 # instala com o lockfile, sem resolver versões de novo
npm run typecheck      # deve passar limpo
npm test               # unidade + integração + regressão
npm run dev            # sobe em http://localhost:3000
```

Se a feature ainda não foi implementada, os passos §4 e §5 servem como roteiro de aceitação: são
os mesmos casos que os testes automatizados devem cobrir.

## 2. Onde a feature vive

| Camada | Caminho |
|---|---|
| Rota | `pages/puericultura/crescimento.tsx` |
| Tela | `interface/puericultura/` |
| Motor | `models/puericultura/` |
| Curvas da OMS (dado gerado) | `models/puericultura/oms/tabelas/` |
| Curvas de pré-termo (equações) | `models/puericultura/intergrowth/equacoes.ts` |
| Gerador do dado (dev-time) | `scripts/gerar-tabelas-oms.ts` |
| Entrada na home | `interface/inicio/catalogo.ts`, seção `puericultura` |

## 3. Regenerar as tabelas da OMS (só quando necessário)

O dado já está commitado; este passo só se justifica ao conferir procedência ou ao reagir a uma
revisão da OMS.

O gerador **não baixa nada**: lê as planilhas do disco, em `referencias/oms/`, pasta ignorada
pelo git. A separação é deliberada — o download é passo à parte, explícito e auditável, ao passo
que a conversão é determinística e repetível offline. Quem nunca baixou as planilhas roda antes o
passo de aquisição, que resolve as URLs do contrato `interfaces/tabelas-de-referencia.md` §2 e
grava o `sha256` de cada arquivo ao lado dele:

```bash
node scripts/baixar-tabelas-oms.ts       # baixa para referencias/oms/ e registra os sha256
node scripts/gerar-tabelas-oms.ts        # lê do disco, verifica e reescreve os módulos
git diff --stat models/puericultura/oms/tabelas/
```

Sem `npx`: o Node 26 do `engines` executa TypeScript nativamente, de modo que nada é resolvido
pela rede fora do `package-lock.json` (D-14 do roadmap).

Um `git diff` **vazio** é o resultado esperado e é a prova de que a origem não mudou. Qualquer
divergência exige leitura antes de commit: pode ser revisão legítima da OMS ou arquivo trocado
na origem. As regras de conferência estão em `interfaces/tabelas-de-referencia.md`.

## 4. Roteiro de verificação manual

Abra `http://localhost:3000`, confirme que a home mostra a quarta seção, **Puericultura**, e
clique no cartão da avaliação de crescimento.

### 4.1 Lactente a termo, medidas completas

| Campo | Valor |
|---|---|
| Sexo | masculino |
| Data de nascimento | `2026-01-10` |
| Data da medição | `2026-08-10` (212 dias de vida) |
| Peso | `8,2` kg |
| Comprimento | `68,5` cm, medido **deitado** |
| Perímetro cefálico | `44,0` cm |
| Idade gestacional ao nascer | em branco |

Esperado — quatro índices, todos próximos da mediana, calculados contra as tabelas oficiais:

| Índice | Escore z | Classificação |
|---|---|---|
| P/I | −0,1 | Peso adequado para a idade |
| C/I | −0,3 | Comprimento adequado para a idade |
| IMC/I | +0,1 | Eutrofia |
| PC/I | 0,0 | Perímetro cefálico adequado para a idade |

Confira também que a tela declara ter tratado a criança como nascida a termo (a idade
gestacional ficou em branco) e que cada índice traz o padrão OMS e a página da caderneta.

### 4.2 A nomenclatura do IMC muda aos 5 anos

Dois casos que diferem em um mês de idade e quase nada de IMC:

| Idade na medição | Peso | Estatura (em pé) | IMC | Escore z | Classificação esperada |
|---|---|---|---|---|---|
| 4 anos e 11 meses (1795 dias) | `21,3` kg | `105,4` cm | 19,2 | ≈ +2,5 | **Sobrepeso** |
| 5 anos exatos (1826 dias) | `21,3` kg | `105,3` cm | 19,2 | ≈ +2,5 | **Obesidade** |

Se as duas telas mostrarem o mesmo rótulo, a troca de nomenclatura de RN-06 não está
implementada — é a armadilha central da fonte.

### 4.3 Correção de cauda

Mesma criança de §4.1, trocando apenas o peso para `5,0` kg. O escore z de P/I deve sair
**−4,3**, não −4,5: o valor bruto pela LMS é −4,501 e a correção de cauda o traz para −4,325.
Repita com a estatura em valor igualmente extremo e confirme que **nenhuma** correção é aplicada
ali (RN-03).

### 4.4 Conversão de posição

Criança de 1 ano e 8 meses medida **em pé**, `82,0` cm. O índice deve usar `82,7` cm e a saída
deve declarar a conversão de +0,7 cm. Depois faça o inverso: criança de 2 anos e 3 meses medida
deitada, `90,0` cm, que deve virar `89,3` cm.

### 4.5 Prematuro dentro da janela das curvas de pré-termo

| Campo | Valor |
|---|---|
| Sexo | masculino |
| Idade gestacional ao nascer | 32 semanas e 0 dias |
| Idade na medição | 4 semanas de vida (36 semanas pós-menstruais) |
| Peso | `2,3` kg |
| Comprimento | `45,0` cm |
| Perímetro cefálico | `32,0` cm |

Esperado: três índices lidos no INTERGROWTH-21st, com escores z de **−0,5** (peso), **−0,8**
(comprimento) e **−0,6** (perímetro cefálico), cada um declarando o padrão de pré-termo e a
idade pós-menstrual de 36 semanas. O **IMC não aparece**, e a sua ausência não é apresentada
como erro (RN-17).

### 4.6 Transferência de padrão e limites da idade corrigida

- Mesmo prematuro com 64 semanas pós-menstruais: padrão INTERGROWTH-21st.
- Com 65 semanas: padrão OMS, e a idade usada passa a ser a corrigida, com o desconto explícito.
- Prematuro de 30 semanas, aos 18 meses: idade corrigida, desconto de 10 semanas.
- O mesmo aos 2 anos e 1 mês: idade cronológica, sem correção.
- Prematuro de 27 semanas: correção mantida até os 3 anos.

## 5. Recusas honestas (o que **não** deve aparecer)

| Cenário | Esperado |
|---|---|
| Criança de 12 anos | Nenhum escore z; a tela informa a cobertura de 0 a 10 anos da caderneta. Nenhum valor aproximado em tela |
| Criança com **3682 dias** e a mesma com **3683** | A primeira calcula, lida no mês 120; a segunda é recusada. É o par que fixa a fronteira superior (D-15) |
| Perímetro cefálico aos **730 dias** e aos **731** | O primeiro calcula PC/I; o segundo o põe fora de escopo, sem tocar nos demais índices (D-16) |
| Idade pós-menstrual de 26 semanas | Nenhum escore z; a tela informa que as curvas de pré-termo começam em 27 semanas |
| Perímetro cefálico numa criança de 3 anos | PC/I fora do escopo, com a cobertura de 0 a 2 anos; **os demais índices calculados normalmente** |
| Sem sexo, data de nascimento posterior à medição e peso −3 kg | Os **três** ofensores exibidos ao mesmo tempo |
| Qualquer edição depois de um resultado | O resultado vigente marcado como desatualizado |
| Procurar a caixa de confirmação de revisão | Ela não existe: classificar crescimento não prescreve dose |

Confirme ainda que o bloco de proveniência fica **fora** do painel de resultado e diz duas
coisas: que a classificação vale para uma medição isolada, ao passo que a caderneta avalia a
tendência de medidas sucessivas, e quais padrões de referência a calculadora usa.

## 6. Verificação de privacidade e de rede

Com o DevTools aberto na aba de rede, preencha e calcule: **nenhuma** requisição deve partir
durante a avaliação. Confirme também que `localStorage` guarda apenas `aps-inteligente:tema`.

## 7. Verificações automatizadas

```bash
npm test                       # unidade, integração, regressão
npm run test:coverage          # models/** deve ficar ≥ 90%
npm run test:e2e               # Playwright, inclui a varredura axe da rota nova
npm run lint && npm run typecheck
npm run build                  # mede o bundle: ver o passo seguinte
```

Na saída de `npm run build`, compare o *First Load JS* das rotas existentes com o da última
execução em `main`: elas devem ficar **inalteradas**. Só a rota `/puericultura/crescimento` pode
crescer, e é ela que carrega as tabelas (D-09 do roadmap). Se o crescimento incomodar, a
alavanca já está pronta: a fachada aceita o repositório de tabelas por construtor, o que permite
migrar para carga dinâmica sem tocar no motor.

## 8. Se algo divergir

1. **Escore diferente do esperado por pouco (terceira casa):** provável arredondamento na
   geração das tabelas; confira o módulo de dados contra a planilha de origem.
2. **Escore diferente entre 5 e 10 anos, contra o software oficial da OMS:** esperado por
   decisão registrada (D-06). Nós lemos o mês completo; o AnthroPlus interpola entre meses.
3. **Escore muito diferente, ordem de grandeza:** suspeite de tabela trocada e rode as
   verificações V4 e V7 de `interfaces/tabelas-de-referencia.md`.
4. **Rótulo trocado perto dos 5 anos:** revise as duas fronteiras de D-05 (1826 dias para o
   rótulo, 1856 dias para a tabela).
5. **Prematuro com escore estranho:** confira se a idade pós-menstrual foi computada como
   idade gestacional ao nascer **mais** idade cronológica, e não como idade corrigida.
