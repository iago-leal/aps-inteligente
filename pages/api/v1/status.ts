import type { NextApiRequest, NextApiResponse } from "next";
import { verificarBanco } from "../../../infra/saude";
import manifesto from "../../../package.json";

// GET /api/v1/status (features 002 e 022; RF-01 a RF-05 e RF-09 da 022 — contrato fixo em
// _reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md,
// que estende o da 002 de forma aditiva).
// Observabilidade mínima do deploy: público, sem autenticação, sem estado, sem
// dado clínico (ADR 0008). Mudança incompatível do corpo exige /api/v1 → /api/v2.
//
// O código é 200 em todo estado do banco (MD-0031): o produto é integralmente cliente,
// as seis calculadoras seguem servindo com a dependência caída, e um 503 afirmaria queda
// de uma plataforma que está no ar. O código responde se a rota funcionou; o corpo
// responde o que ela apurou.

/** Vocabulário do produto, e não o do provedor: amarrar o corpo aos nomes de quem
 *  hospeda faria a troca de hospedagem virar mudança incompatível (D-05). */
function ambiente(): "producao" | "pre-visualizacao" | "local" {
  switch (process.env.VERCEL_ENV) {
    case "production":
      return "producao";
    case "preview":
      return "pre-visualizacao";
    default:
      return "local";
  }
}

export default async function status(
  requisicao: NextApiRequest,
  resposta: NextApiResponse,
) {
  // O Pages Router entrega qualquer método ao handler; a discriminação é nossa (RN-04).
  // Ela precede qualquer I/O: método errado não desperta a instância do banco.
  if (requisicao.method !== "GET") {
    resposta.setHeader("Allow", "GET");
    resposta.status(405).json({ erro: "Método não permitido; use GET." });
    return;
  }

  // Uma tentativa só, sob o teto de infra/database.ts (RN-06): repetir mascararia a
  // intermitência que o healthcheck existe para revelar.
  const banco = await verificarBanco();

  // RN-05: status cacheado mente — a resposta jamais sai de cache.
  resposta.setHeader("Cache-Control", "no-store");
  resposta.status(200).json({
    atualizado_em: new Date().toISOString(),
    versao: manifesto.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    // Carimbado no build por next.config.ts (RF-03; D-04). Nulo é o caminho honesto
    // para quem executar este handler fora de um build carimbado.
    publicado_em: process.env.APS_PUBLICADO_EM ?? null,
    ambiente: ambiente(),
    banco,
  });
}
