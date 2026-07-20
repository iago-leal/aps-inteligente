import type { NextApiRequest, NextApiResponse } from "next";
import manifesto from "../../../package.json";

// GET /api/v1/status (feature 002; RF-02, RF-03, RF-05 — contrato fixo em
// _reversa_forward/002-producao-pagina-e-api-status/interfaces/http-get-api-v1-status.md).
// Observabilidade mínima do deploy: público, sem autenticação, sem estado, sem
// dado clínico (ADR 0008). Mudança incompatível do corpo exige /api/v1 → /api/v2.

export default function status(requisicao: NextApiRequest, resposta: NextApiResponse) {
  // O Pages Router entrega qualquer método ao handler; a discriminação é nossa (RN-04).
  if (requisicao.method !== "GET") {
    resposta.setHeader("Allow", "GET");
    resposta.status(405).json({ erro: "Método não permitido; use GET." });
    return;
  }

  // RN-05: status cacheado mente — a resposta jamais sai de cache.
  resposta.setHeader("Cache-Control", "no-store");
  resposta.status(200).json({
    atualizado_em: new Date().toISOString(),
    versao: manifesto.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });
}
