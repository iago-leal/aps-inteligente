# Data Delta — 006-checkbox-revisao-redundante

> Data: `2026-07-22`
> Base: `_reversa_sdd/erd-complete.md` (entidades em memória; sem banco por design)

## 1. Entidades do domínio

Nenhuma mudança. `EntradaCalculo`, `SaidaCalculo` e todas as variantes permanecem intocadas (`git diff models/` vazio é critério de pronto).

## 2. Tipos novos (camada de interface, efêmeros)

| Tipo | Onde vive | Forma | Persistência |
|------|-----------|-------|--------------|
| `EstadoCopia` | `resultado.tsx` (estado local) | união literal `"ocioso" \| "copiado" \| "falhou"` | nenhuma — estado de componente, zerado quando `revisaoValida` deixa de valer |
| `ResultadoCopia` | `area-de-transferencia.ts` (retorno do adaptador) | `{ ok: true } \| { ok: false }` | nenhuma |
| Texto do plano | valor de retorno de `formatarPlano(saida)` | `string` derivada da `ResultadoCalculo` exibida | nenhuma — vai à área de transferência do dispositivo por gesto do usuário; a página não a armazena |

## 3. Migrações

n/a — sem banco, sem storage novo. O único storage do app segue sendo a chave de tema (`aps-inteligente:tema`), inalterada.

## 4. Nota de privacidade (LGPD)

O texto do plano contém dado clínico derivado da entrada do prescritor e vai para a área de transferência do sistema operacional — fora do controle da página, como qualquer cópia manual que o prescritor já faça hoje. A ação é local, explícita e iniciada pelo usuário; nada trafega em rede e nada é retido pela aplicação (RN-04). O gatilho registrado na extração ("banco de dados reabre LGPD") não é acionado por esta feature.
