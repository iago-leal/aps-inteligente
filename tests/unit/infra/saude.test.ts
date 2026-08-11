import { afterAll, afterEach, describe, expect, test, vi } from "vitest";
import { ErroDeBanco, type LeituraDeSaude } from "../../../infra/database";
import { verificarBanco } from "../../../infra/saude";

// Unidade de infra/saude.ts (feature 022; RF-01, RF-02; RN-03; D-07;
// _reversa_forward/022-status-healthcheck-e-deploy/interfaces/conexao-banco.md §4).
// O duplo entra no lugar do banco: os cinco desfechos se exercitam sem servidor de pé,
// que é a razão de a conversão morar aqui e não no handler.
//
// A asserção que não pode faltar é a de que a função NUNCA rejeita. Erro esperado é
// valor (invariante 2 do domain.md); exceção que escape daqui é bug, não estado.
//
// Feature 024 (RF-01, RF-02, RF-03, RF-05, RF-07; RN-02, RN-03, RN-06; D-01, D-03 a D-05;
// _reversa_forward/024-status-conexoes-do-banco/interfaces/conexao-banco.md §§1 e 2).
// O arquivo passa a exercitar duas unidades, porque as duas respondem pela mesma pergunta:
// `verificarBanco` sobre um `saude()` duplicado, como sempre, e `saude()` sobre um driver
// duplicado, já que a validação das quatro colunas e a sanitização da versão são decisões
// puras. Levá-las ao nível de contrato exigiria servidor de pé para provar o que não
// depende de servidor algum, e ainda deixaria a coluna malformada sem como ser produzida:
// nenhum Postgres devolve `max_connections` em texto.

const { conexaoFalsa } = vi.hoisted(() => ({
  conexaoFalsa: { query: vi.fn(), release: vi.fn() },
}));

// O driver no lugar do banco. É o duplo mais externo que existe neste módulo, de modo que
// tudo o que `saude()` decide sobre a linha recebida continua sendo código real sob teste.
vi.mock("pg", () => {
  class PoolFalso {
    on() {
      return this;
    }
    connect() {
      return Promise.resolve(conexaoFalsa);
    }
    end() {
      return Promise.resolve();
    }
  }
  return { Pool: PoolFalso, default: { Pool: PoolFalso } };
});

vi.mock("../../../infra/database", async (original) => {
  const real = await original<typeof import("../../../infra/database")>();
  return { ...real, saude: vi.fn() };
});

const { saude } = await import("../../../infra/database");
const saudeDuplo = vi.mocked(saude);

// A implementação verdadeira de `saude()`, alcançada por baixo do duplo acima. O `pg`
// continua falso para ela, que é justamente o ponto: o banco sai de cena, a decisão fica.
const bancoReal = await vi.importActual<
  typeof import("../../../infra/database")
>("../../../infra/database");

// A leitura íntegra de referência, num lugar só: toda asserção de sucesso deste arquivo
// deriva daqui, e a linha bruta abaixo é a mesma leitura no vocabulário das colunas.
const LEITURA: LeituraDeSaude = {
  teto_de_conexoes: 100,
  conexoes_abertas: 3,
  versao: "17.10",
};

const LINHA_INTEGRA = {
  ok: 1,
  teto_de_conexoes: 100,
  conexoes_abertas: 3,
  versao: "17.10",
};

afterEach(() => {
  vi.mocked(saudeDuplo).mockReset();
});

describe("verificarBanco", () => {
  test("banco respondendo: estado íntegro com a leitura junto, sem causa", async () => {
    saudeDuplo.mockResolvedValue(LEITURA);

    const estado = await verificarBanco();

    expect(estado).toEqual({ estado: "integro", ...LEITURA });
    // RN-02 pela outra ponta: o ramo íntegro não carrega `causa`, e nada além dos três
    // valores apurados entra nele.
    expect(Object.keys(estado).sort()).toEqual([
      "conexoes_abertas",
      "estado",
      "teto_de_conexoes",
      "versao",
    ]);
  });

  test.each([
    ["conexao"],
    ["consulta"],
    ["configuracao"],
    ["tempo_esgotado"],
  ] as const)(
    "ErroDeBanco de causa %s vira valor degradado, sem rejeitar",
    async (causa) => {
      saudeDuplo.mockRejectedValue(
        new ErroDeBanco(
          causa,
          "mensagem interna que jamais atravessa a fronteira",
        ),
      );

      // RN-02: os três valores ficam ausentes, e não iguais a zero nem nulos. A igualdade
      // estrita é o que prova a ausência, e por isso ela não afrouxa para toMatchObject.
      await expect(verificarBanco()).resolves.toEqual({
        estado: "degradado",
        causa,
      });
    },
  );

  test("erro que não é ErroDeBanco também vira valor, e não exceção", async () => {
    saudeDuplo.mockRejectedValue(new TypeError("defeito inesperado do driver"));
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});

    // Cai no balde genérico do próprio infra/database.ts, onde tudo o que não é
    // conexão, configuração ou tempo é falha de consulta. E é barulhento: a linha
    // de log existe porque chegar aqui significa contrato interno quebrado.
    await expect(verificarBanco()).resolves.toEqual({
      estado: "degradado",
      causa: "consulta",
    });
    expect(registro).toHaveBeenCalledOnce();

    registro.mockRestore();
  });

  test("o teto pedido chega a saude() como veio, e a ausência dele também", async () => {
    saudeDuplo.mockResolvedValue(LEITURA);

    await verificarBanco(750);
    expect(saudeDuplo).toHaveBeenCalledWith({ tetoMs: 750 });

    saudeDuplo.mockClear();
    await verificarBanco();
    expect(saudeDuplo).toHaveBeenCalledWith(undefined);
  });

  test("a mensagem interna do erro não aparece no valor devolvido", async () => {
    saudeDuplo.mockRejectedValue(
      new ErroDeBanco(
        "conexao",
        "ECONNREFUSED: falha de conexão com o banco (host loca•••) após 12 ms; SELECT $1::int",
      ),
    );

    const estado = await verificarBanco();
    const serializado = JSON.stringify(estado);

    expect(serializado).not.toMatch(/host|select|•••|ECONNREFUSED/i);
    expect(Object.keys(estado).sort()).toEqual(["causa", "estado"]);
  });
});

// Unidade de `saude()`, em infra/database.ts (feature 024; RF-01, RF-02, RF-03, RF-05,
// RF-07; RN-03, RN-06; D-01, D-03, D-05). O que está sob teste é a leitura da linha: o
// que ela precisa trazer para ser aceita, e o que sai dela depois de sanitizada.
describe("saude, sobre o driver duplicado", () => {
  const URL_ORIGINAL = process.env.DATABASE_URL;
  process.env.DATABASE_URL =
    "postgres://aps:aps@localhost:5432/aps_inteligente";

  afterEach(() => {
    conexaoFalsa.query.mockReset();
    conexaoFalsa.release.mockReset();
  });

  afterAll(async () => {
    // O pool guarda a URL com que foi criado; devolvê-la sem drenar deixaria a próxima
    // suíte com um pool preso à conexão falsa.
    await bancoReal.encerrar();
    if (URL_ORIGINAL === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = URL_ORIGINAL;
    }
  });

  test("linha completa: os três valores sobem numa ida só", async () => {
    conexaoFalsa.query.mockResolvedValue({ rows: [LINHA_INTEGRA] });

    await expect(bancoReal.saude()).resolves.toEqual(LEITURA);
    // RF-05: uma consulta por verificação, e não uma por valor apurado.
    expect(conexaoFalsa.query).toHaveBeenCalledOnce();
  });

  test("a versão sai só como número, mesmo com sufixo de distribuição", async () => {
    conexaoFalsa.query.mockResolvedValue({
      rows: [{ ...LINHA_INTEGRA, versao: "17.10 (Debian 17.10-1.pgdg120+1)" }],
    });

    const leitura = await bancoReal.saude();

    // RN-06: o sufixo nomeia a distribuição, e a cadeia inteira casaria com a denylist
    // do corpo público. O que atravessa a fronteira é o prefixo, e nada além dele.
    expect(leitura.versao).toBe("17.10");
    expect(leitura.versao).not.toMatch(/debian|postgres/i);

    // D-03 pela raiz: a versão nasce de `current_setting`, jamais de `version()`.
    const [sql] = conexaoFalsa.query.mock.calls[0] as [string];
    expect(sql).toContain("current_setting('server_version')");
    expect(sql).not.toMatch(/version\(\)/);
  });

  test.each([
    [
      "teto em texto, como viria sem o cast da consulta",
      { ...LINHA_INTEGRA, teto_de_conexoes: "100" },
    ],
    [
      "contagem abaixo do piso, que é um porque a própria requisição se conta",
      { ...LINHA_INTEGRA, conexoes_abertas: 0 },
    ],
    [
      "versão sem prefixo numérico algum",
      { ...LINHA_INTEGRA, versao: "desconhecida" },
    ],
  ])(
    "coluna fora do formato reprova a verificação inteira, com causa consulta (%s)",
    async (_rotulo, linha) => {
      conexaoFalsa.query.mockResolvedValue({ rows: [linha] });

      // RN-03 e D-05: não existe estado intermediário de banco íntegro com números
      // indisponíveis, e a causa é a de sempre — uma quinta causa diria a quem lê o
      // healthcheck algo que ele não pode acionar.
      await expect(bancoReal.saude()).rejects.toMatchObject({
        name: "ErroDeBanco",
        causa: "consulta",
      });
    },
  );

  test("a reprovação da linha deixa rastro estruturado, e nomeia coluna, nunca valor", async () => {
    conexaoFalsa.query.mockResolvedValue({
      rows: [{ ...LINHA_INTEGRA, conexoes_abertas: 0, versao: "desconhecida" }],
    });
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(bancoReal.saude()).rejects.toMatchObject({
      causa: "consulta",
    });

    // Esta é a única degradação que não nasce de exceção do driver, e por isso a única
    // que passaria sem rastro se o log ficasse a cargo de `registrar()`. Degradação
    // perpétua e silenciosa seria indistinguível de banco fora (RN-05, RNF de
    // observabilidade).
    expect(registro).toHaveBeenCalledOnce();
    const linha = JSON.parse(registro.mock.calls[0]![0] as string) as {
      causa: string;
      colunas: string[];
      host: string;
    };
    expect(linha.causa).toBe("consulta");
    expect(linha.colunas).toEqual(["conexoes_abertas", "versao"]);
    expect(linha.host).toBe("loca•••");

    // A régua da 003: nem URL, nem credencial, nem o texto da consulta.
    const bruta = registro.mock.calls[0]![0] as string;
    expect(bruta).not.toMatch(/aps:aps|postgres:\/\/|SELECT|desconhecida/);

    registro.mockRestore();
  });
});
