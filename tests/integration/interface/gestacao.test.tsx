// @vitest-environment jsdom
// T006 — Tela da calculadora de idade gestacional (RF-01..RF-04, RF-07, RF-09;
// RN-05/RN-07/RN-11; D-08: sem ritual de revisão — datação não prescreve).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppIdadeGestacional } from "interface/gestacao/app";

afterEach(cleanup);

const HOJE = "2026-07-23";

function renderiza(props: Partial<Parameters<typeof AppIdadeGestacional>[0]> = {}) {
  render(<AppIdadeGestacional dataDeHoje={HOJE} {...props} />);
}

function preencheDum(valor: string) {
  fireEvent.change(screen.getByLabelText(/data da última menstruação/i), {
    target: { value: valor },
  });
}

function preencheUltrassom(data: string, semanas: string, dias: string) {
  fireEvent.change(screen.getByLabelText(/data do exame/i), {
    target: { value: data },
  });
  fireEvent.change(screen.getByLabelText(/semanas no exame/i), {
    target: { value: semanas },
  });
  fireEvent.change(screen.getByLabelText(/dias no exame/i), {
    target: { value: dias },
  });
}

function calcular() {
  fireEvent.click(screen.getByRole("button", { name: /^calcular$/i }));
}

describe("Datação pela DUM (RF-01; cenário 1 do requirements §7)", () => {
  it("DUM 2026-01-01 → IG 29 semanas e 0 dias, DPP 08/10/2026, 3.º trimestre", () => {
    renderiza();
    preencheDum("2026-01-01");
    calcular();
    expect(screen.getByText(/29 semanas e 0 dias/i)).toBeTruthy();
    expect(screen.getByText(/08\/10\/2026/)).toBeTruthy();
    expect(screen.getByText(/3\.º trimestre/i)).toBeTruthy();
  });

  it("a referência clínica acompanha o resultado (RF-04)", () => {
    renderiza();
    preencheDum("2026-01-01");
    calcular();
    expect(screen.getAllByText(/guia rápido pré-natal/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/p\. 3[12]/i).length).toBeGreaterThan(0);
  });

  it("a data de referência e a nota de estimativa aparecem junto ao resultado (RF-07; RN-07)", () => {
    renderiza();
    preencheDum("2026-01-01");
    calcular();
    expect(screen.getByText(/23\/07\/2026/)).toBeTruthy();
    expect(screen.getByText(/estimativa/i)).toBeTruthy();
  });
});

describe("Datação pelo ultrassom (RF-02; cenário 2 do requirements §7)", () => {
  it("exame 2026-06-10 com 12s3d → IG 18 semanas e 4 dias, DPP 22/12/2026, 2.º trimestre", () => {
    renderiza();
    preencheUltrassom("2026-06-10", "12", "3");
    calcular();
    expect(screen.getByText(/18 semanas e 4 dias/i)).toBeTruthy();
    expect(screen.getByText(/22\/12\/2026/)).toBeTruthy();
    expect(screen.getByText(/2\.º trimestre/i)).toBeTruthy();
  });
});

describe("Entrada dupla com divergência explicitada (RF-09; RN-11)", () => {
  it("DUM 2026-01-01 + USG 2026-03-10 (8s0d): as duas datações, divergência de 12 dias e destaque da USG", () => {
    renderiza();
    preencheDum("2026-01-01");
    preencheUltrassom("2026-03-10", "8", "0");
    calcular();
    expect(screen.getByRole("heading", { name: /pela dum/i })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /pelo ultrassom/i }),
    ).toBeTruthy();
    expect(screen.getByText(/12 dias/i)).toBeTruthy();
    expect(
      screen.getByText(/datação pelo ultrassom .* referência/i),
    ).toBeTruthy();
  });

  it("divergência dentro da margem: a DUM é confirmada, sem destaque de descarte", () => {
    renderiza();
    preencheDum("2026-01-13");
    preencheUltrassom("2026-03-10", "8", "0");
    calcular();
    expect(screen.getByText(/dum confirmada/i)).toBeTruthy();
    expect(
      screen.queryByText(/datação pelo ultrassom .* referência/i),
    ).toBeNull();
  });
});

describe("Validação com coleta total e mensagens por campo (RF-03; RN-05)", () => {
  it("DUM futura → ofensor visível, nenhum resultado", () => {
    renderiza();
    preencheDum("2026-08-01");
    calcular();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(screen.getByText(/dum no futuro|dum futura/i)).toBeTruthy();
    expect(screen.queryByText(/semanas e \d dias/i)).toBeNull();
  });

  it("dois ofensores aparecem de uma só vez (coleta total)", () => {
    renderiza();
    preencheUltrassom("2026-09-01", "45", "0");
    calcular();
    expect(screen.getByText(/exame no futuro/i)).toBeTruthy();
    expect(screen.getByText(/entre 0 e 42 semanas/i)).toBeTruthy();
  });

  it("sem nenhuma datação → orienta a informar DUM ou ultrassom", () => {
    renderiza();
    calcular();
    expect(screen.getByText(/informe a dum ou o ultrassom/i)).toBeTruthy();
  });
});

describe("Sem ritual de revisão nesta tela (D-08: datação não prescreve)", () => {
  it("não existe checkbox de revisão nem bloco 'pronto para prescrever'", () => {
    renderiza();
    preencheDum("2026-01-01");
    calcular();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/pronto para prescrever/i)).toBeNull();
  });
});

describe("Invalidação por edição e falha honesta (padrões do legado)", () => {
  it("editar depois de calcular marca o resultado como desatualizado", () => {
    renderiza();
    preencheDum("2026-01-01");
    calcular();
    preencheDum("2026-01-02");
    expect(screen.getByText(/desatualizado/i)).toBeTruthy();
  });

  it("exceção do motor leva ao painel honesto, sem valores clínicos", () => {
    renderiza({
      motor: {
        calcular() {
          throw new Error("bug");
        },
      },
    });
    preencheDum("2026-01-01");
    calcular();
    expect(screen.getByText(/falha inesperada/i)).toBeTruthy();
    expect(screen.queryByText(/semanas e \d dias/i)).toBeNull();
  });
});
