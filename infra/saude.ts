// infra/saude.ts — verificação de saúde do banco como VALOR (feature 022; RF-01, RF-02;
// RN-03; D-07). Contrato: _reversa_forward/022-status-healthcheck-e-deploy/interfaces/
// conexao-banco.md §4.
//
// Razão de existir, em uma linha: erro esperado é valor (invariante 2 do domain.md), e a
// rota não é lugar de política de falha. Único importador de `saude()` em produção, o que
// mantém `infra/database.ts` como ponto de acesso exclusivo ao banco.
//
// Feature 024 (RF-04, RF-06; RN-02; D-04, D-06). Contrato desta revisão:
// _reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md §2.
//
// O que este módulo NÃO faz, e isso é tão importante quanto o que faz: não formata
// mensagem, não lê ambiente, não compõe resposta. Desde a 024 também não INTERPRETA os
// números que transporta: não calcula proporção, não classifica ocupação, não decide se
// o banco está cheio. Só traduz desfecho em estado, e leva a leitura junto.
import {
  ErroDeBanco,
  saude,
  type CausaDeErroDeBanco,
  type LeituraDeSaude,
} from "./database";

// A assimetria entre os ramos é o mecanismo, e não um efeito colateral: os três valores
// vivem onde poderiam ter sido apurados, de modo que a RN-02 fica garantida por tipo, e
// nenhuma condicional em runtime precisa afirmá-la.
export type EstadoDoBanco =
  | ({ readonly estado: "integro" } & LeituraDeSaude)
  | { readonly estado: "degradado"; readonly causa: CausaDeErroDeBanco };

export async function verificarBanco(tetoMs?: number): Promise<EstadoDoBanco> {
  try {
    const leitura = await saude(tetoMs === undefined ? undefined : { tetoMs });
    return { estado: "integro", ...leitura };
  } catch (origem) {
    if (origem instanceof ErroDeBanco) {
      return { estado: "degradado", causa: origem.causa };
    }
    // Exceção que não é ErroDeBanco é BUG do contrato interno, não estado esperado.
    // Ainda assim não escapa daqui — quem chama é o healthcheck, e derrubá-lo seria
    // trocar degradação por indisponibilidade. Cai no balde genérico de `consulta`,
    // como o próprio infra/database.ts classifica desde a 003, e faz barulho.
    console.error(
      JSON.stringify({
        nivel: "erro",
        origem: "infra/saude",
        causa: "consulta",
        erro:
          origem instanceof Error
            ? origem.name
            : "ErroDesconhecido: saude() rejeitou fora do contrato",
      }),
    );
    return { estado: "degradado", causa: "consulta" };
  }
}
