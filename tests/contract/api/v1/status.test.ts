import { describe, expect, test } from "vitest";
import manifesto from "../../../../package.json";

// Contrato de GET /api/v1/status (features 002 e 022; RF-01 a RF-06 e RF-09 da 022;
// _reversa_forward/022-status-healthcheck-e-deploy/interfaces/http-get-api-v1-status.md,
// que estende o contrato da 002 de forma aditiva dentro de /api/v1).
// Substitui o contrato histórico evolutivo (bundle e5e52a8): corpo fixo, cache proibido.
// Exige servidor de pé com build de produção (npm run build && npm start) ou o alvo
// apontado por API_BASE_URL (job de contrato do CI; verificação pós-deploy).
//
// Feature 024 (RF-01 a RF-04, RF-06, RF-08, RF-10; RN-02, RN-05, RN-06, RN-08; D-07).
// Contrato desta revisão: _reversa_forward/024-status-conexoes-do-banco/interfaces/
// http-get-api-v1-status.md. O ramo íntegro de `banco` passa de uma chave para quatro,
// por acréscimo: teto_de_conexoes, conexoes_abertas e versao. O ramo degradado segue
// idêntico byte a byte, e é lá que a ausência dos três campos se afere.
//
// O ESTADO DEGRADADO se afere contra um SEGUNDO servidor, apontado por
// API_BASE_URL_DEGRADADO a uma DATABASE_URL inalcançável (D-08). Sem a variável o
// bloco é pulado, de modo que a suíte siga executável localmente com um servidor só.

const BASE = process.env.API_BASE_URL ?? "http://localhost:3000";
const URL_STATUS = `${BASE}/api/v1/status`;

const BASE_DEGRADADA = process.env.API_BASE_URL_DEGRADADO;
const URL_STATUS_DEGRADADO = `${BASE_DEGRADADA}/api/v1/status`;

const CHAVES = [
  "atualizado_em",
  "ambiente",
  "banco",
  "commit",
  "publicado_em",
  "versao",
];

const AMBIENTES = ["producao", "pre-visualizacao", "local"];
const CAUSAS = ["conexao", "consulta", "configuracao", "tempo_esgotado"];

// Feature 024 (RF-01 a RF-03): os três campos que só existem no ramo íntegro de `banco`.
// A lista serve aos dois lados da mesma regra — o conjunto de chaves do ramo íntegro e a
// ausência estrutural no ramo degradado (RN-02).
const CAMPOS_DE_CONEXAO = ["teto_de_conexoes", "conexoes_abertas", "versao"];

// RN-06: a versão do servidor de banco sai só como número, no molde "17.10". A âncora nas
// duas pontas recusa qualquer letra, e com ela a cadeia completa que o servidor devolve,
// que nomeia produto, arquitetura e compilador.
const PREFIXO_DE_VERSAO = /^\d+(?:\.\d+)*$/;

// A mesma regra por outro ângulo, aferida sobre o campo e não sobre o corpo inteiro, de
// modo que a falha diga qual campo vazou. A DENYLIST_DE_CONEXAO abaixo permanece intocada
// (D-07): este padrão a acompanha, não a substitui nem a afrouxa.
const NOME_DE_PRODUTO_DE_BANCO = /postgres|mysql|mariadb|sqlite|oracle/i;

// Denylist do RN-02 (invariável): dado clínico/pessoal, segredo e variável de
// ambiente jamais aparecem na resposta serializada. Metadados públicos do produto
// (versão, commit) são permitidos.
const DENYLIST = [
  /senha/i,
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /authorization/i,
  /bearer/i,
  /private[_-]?key/i,
  /process\.env/i,
  /paciente/i,
  /prontu[aá]rio/i,
  /glicemia/i,
  /\bcpf\b/i,
  /\bcns\b/i,
  /nascimento/i,
];

// Extensão da feature 022 (RF-06): o estado degradado é onde o vazamento seria mais
// provável, e a regra de ouro é operacional — o que infra/database.ts mascara no log,
// o corpo público não pode revelar. Host, URL de conexão e trecho de SQL ficam de fora.
const DENYLIST_DE_CONEXAO = [
  /postgres/i,
  /localhost/i,
  /127\.0\.0\.1/,
  /\bselect\b/i,
  /:\/\//,
  /\bhost\b/i,
  /54(32|33)/,
  /ECONNREFUSED/i,
];

async function corpoDe(url: string): Promise<Record<string, unknown>> {
  const resposta = await fetch(url);
  expect(resposta.status).toBe(200);
  return (await resposta.json()) as Record<string, unknown>;
}

function conferirCamposDeDeploy(corpo: Record<string, unknown>): void {
  // Prova de frescor: carimbo ISO 8601 UTC válido, gerado na resposta.
  expect(new Date(corpo.atualizado_em as string).toISOString()).toBe(
    corpo.atualizado_em,
  );

  expect(corpo.versao).toBe(manifesto.version);

  // SHA do commit publicado; "local" é o fallback correto fora do provedor.
  expect(typeof corpo.commit).toBe("string");
  expect((corpo.commit as string).length).toBeGreaterThan(0);

  // RF-03: instante do build, em ISO 8601. Nulo só quando o build não carimbou.
  expect(typeof corpo.publicado_em).toBe("string");
  expect(new Date(corpo.publicado_em as string).toISOString()).toBe(
    corpo.publicado_em,
  );

  // RF-04: vocabulário próprio; o valor do provedor é traduzido, jamais repassado cru.
  expect(AMBIENTES).toContain(corpo.ambiente);
}

describe("GET /api/v1/status", () => {
  test("200 com as seis chaves da raiz, e nenhuma a mais", async () => {
    const resposta = await fetch(URL_STATUS);

    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toContain("application/json");

    const corpo = await resposta.json();
    expect(Object.keys(corpo).sort()).toEqual([...CHAVES].sort());
  });

  test("campos de deploy: atualizado_em, versao, commit, publicado_em e ambiente", async () => {
    conferirCamposDeDeploy(await corpoDe(URL_STATUS));
  });

  test("RF-05: os três campos da 002 mantêm nome, tipo e semântica", async () => {
    const corpo = await corpoDe(URL_STATUS);

    // Não se reaninharam nem trocaram de significado — é o que faz a mudança
    // caber em /api/v1 pela regra que o próprio contrato da 002 escreveu.
    expect(typeof corpo.atualizado_em).toBe("string");
    expect(corpo.versao).toBe(manifesto.version);
    expect(typeof corpo.commit).toBe("string");
  });

  test("RF-03: publicado_em é idêntico entre duas consultas, atualizado_em não", async () => {
    const primeira = await corpoDe(URL_STATUS);
    await new Promise((resolva) => setTimeout(resolva, 1_100));
    const segunda = await corpoDe(URL_STATUS);

    expect(segunda.publicado_em).toBe(primeira.publicado_em);
    expect(segunda.atualizado_em).not.toBe(primeira.atualizado_em);
  });

  test("RF-01: com o banco de pé, banco.estado é integro e não há causa", async () => {
    const corpo = await corpoDe(URL_STATUS);
    const banco = corpo.banco as Record<string, unknown>;

    // Até a feature 024 esta asserção dizia `toEqual({ estado: "integro" })`, porque o
    // ramo íntegro tinha uma chave só. O acréscimo do RF-04 moveu a igualdade exata para
    // o conjunto de chaves; o que a asserção afirmava, estado íntegro e ausência de
    // causa, continua afirmado aqui, e de forma mais estrita.
    expect(banco.estado).toBe("integro");
    expect(banco).not.toHaveProperty("causa");
    expect(Object.keys(banco).sort()).toEqual(
      ["estado", ...CAMPOS_DE_CONEXAO].sort(),
    );
  });

  test("RF-01 (024): teto_de_conexoes é um inteiro positivo", async () => {
    const corpo = await corpoDe(URL_STATUS);
    const banco = corpo.banco as Record<string, unknown>;

    expect(typeof banco.teto_de_conexoes).toBe("number");
    expect(Number.isInteger(banco.teto_de_conexoes)).toBe(true);
    expect(banco.teto_de_conexoes as number).toBeGreaterThan(0);
  });

  test("RF-02 (024): conexoes_abertas é inteiro com piso um, e não excede o teto", async () => {
    const corpo = await corpoDe(URL_STATUS);
    const banco = corpo.banco as Record<string, unknown>;

    expect(typeof banco.conexoes_abertas).toBe("number");
    expect(Number.isInteger(banco.conexoes_abertas)).toBe(true);

    // Piso um, e não zero: a própria requisição mantém uma conexão aberta enquanto apura,
    // de modo que um significa banco ocioso, e não banco vazio. Zero aqui denunciaria
    // contagem apurada em universo diferente do que o contrato declara.
    expect(banco.conexoes_abertas as number).toBeGreaterThanOrEqual(1);

    // RN-08: o teto é do servidor e a contagem é do banco corrente, de modo que a relação
    // verificável entre os dois é a de não-excedência, e não uma taxa exata de ocupação.
    expect(banco.conexoes_abertas as number).toBeLessThanOrEqual(
      banco.teto_de_conexoes as number,
    );
  });

  test("RF-03 (024): versao traz só o prefixo numérico, sem o nome do produto de banco", async () => {
    const corpo = await corpoDe(URL_STATUS);
    const banco = corpo.banco as Record<string, unknown>;

    expect(typeof banco.versao).toBe("string");
    expect(banco.versao as string).toMatch(PREFIXO_DE_VERSAO);

    // RN-06: a cadeia completa do servidor nomearia o produto e cairia na denylist do
    // corpo inteiro. Aferir também o campo faz a falha apontar a origem, em vez de acusar
    // um vazamento genérico em algum lugar do JSON.
    expect(banco.versao as string).not.toMatch(NOME_DE_PRODUTO_DE_BANCO);
  });

  test("cache proibido (RN-05): Cache-Control no-store", async () => {
    const resposta = await fetch(URL_STATUS);
    expect(resposta.headers.get("cache-control")).toBe("no-store");
  });

  test("sem estado (RN-02): nenhum Set-Cookie", async () => {
    const resposta = await fetch(URL_STATUS);
    expect(resposta.headers.get("set-cookie")).toBeNull();
  });

  test("denylist de privacidade (RN-02): resposta sem segredo nem dado clínico/pessoal", async () => {
    const resposta = await fetch(URL_STATUS);
    // A aferição é sobre o corpo REALMENTE serializado, de modo que os três campos da
    // feature 024 entram nela sem que um padrão precise ser acrescentado: a RN-05 estende
    // o alcance da denylist e não revoga item algum dela (D-07).
    const serializado = JSON.stringify(await resposta.json());
    for (const proibido of [...DENYLIST, ...DENYLIST_DE_CONEXAO]) {
      expect(serializado).not.toMatch(proibido);
    }
  });

  test.each(["POST", "PUT", "DELETE", "PATCH"])(
    "método %s (RN-04): 405 com Allow: GET, erro simples sem eco",
    async (metodo) => {
      const resposta = await fetch(URL_STATUS, {
        method: metodo,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eco: "jamais-refletido" }),
      });

      expect(resposta.status).toBe(405);
      expect(resposta.headers.get("allow")).toBe("GET");
      expect(resposta.headers.get("set-cookie")).toBeNull();

      const corpo = await resposta.json();
      expect(JSON.stringify(corpo)).not.toContain("jamais-refletido");
    },
  );
});

describe.skipIf(!BASE_DEGRADADA)(
  "GET /api/v1/status — banco inalcançável",
  () => {
    test("RF-02: o código segue 200, e não 503", async () => {
      const resposta = await fetch(URL_STATUS_DEGRADADO);

      // MD-0031: degradado significa banco fora, não produto fora. As seis
      // calculadoras são integralmente cliente e seguem servindo.
      expect(resposta.status).toBe(200);
      expect(resposta.headers.get("cache-control")).toBe("no-store");
      expect(resposta.headers.get("set-cookie")).toBeNull();
    });

    test("RF-01: banco.estado degradado, com causa em vocabulário público fechado", async () => {
      const corpo = await corpoDe(URL_STATUS_DEGRADADO);
      const banco = corpo.banco as Record<string, unknown>;

      expect(banco.estado).toBe("degradado");
      expect(CAUSAS).toContain(banco.causa);
      expect(Object.keys(banco).sort()).toEqual(["causa", "estado"]);
    });

    test("RF-06 (024): os três campos de conexão ausentes, nenhum valendo zero ou nulo", async () => {
      const corpo = await corpoDe(URL_STATUS_DEGRADADO);
      const banco = corpo.banco as Record<string, unknown>;

      for (const campo of CAMPOS_DE_CONEXAO) {
        // Ausente é coisa diferente de presente e vazio, e é a distinção que a RN-02
        // exige: `in` recusa a chave declarada com `undefined`, que a leitura do valor
        // confundiria com campo inexistente.
        expect(campo in banco).toBe(false);
        expect(banco[campo]).not.toBe(0);
        expect(banco[campo]).not.toBeNull();
      }

      // A ausência precisa alcançar o JSON, e não só o objeto desembrulhado. A aferição é
      // sobre `banco` isolado, e não sobre o corpo inteiro, porque `versao` é também
      // chave da raiz, onde nomeia a versão do produto e permanece obrigatória.
      const bancoSerializado = JSON.stringify(banco);
      for (const campo of CAMPOS_DE_CONEXAO) {
        expect(bancoSerializado).not.toContain(`"${campo}"`);
      }
    });

    test("os campos que não dependem do banco continuam corretos", async () => {
      const corpo = await corpoDe(URL_STATUS_DEGRADADO);

      expect(Object.keys(corpo).sort()).toEqual([...CHAVES].sort());
      conferirCamposDeDeploy(corpo);
    });

    test("RF-06: nem no degradado vazam host, URL de conexão ou trecho de SQL", async () => {
      const resposta = await fetch(URL_STATUS_DEGRADADO);
      // Mesma aferição do alvo íntegro, sobre o corpo realmente serializado e com a
      // denylist preservada item a item (D-07). É o alvo onde o vazamento seria mais
      // provável, e a feature 024 não afrouxou nenhuma das duas listas.
      const serializado = JSON.stringify(await resposta.json());
      for (const proibido of [...DENYLIST, ...DENYLIST_DE_CONEXAO]) {
        expect(serializado).not.toMatch(proibido);
      }
    });
  },
);
