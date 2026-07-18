// @vitest-environment jsdom
// T025 — Contrato RelatorDeErros (MD-0010): nenhum payload clínico chega ao contrato;
// a implementação nula não faz nada; o painel honesto assume a tela (EC-07).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalculadoraApp } from "@/interface/calculadora/calculadora-app";
import {
  relatorNulo,
  type EventoDeErro,
} from "@/interface/calculadora/relator-de-erros";

afterEach(cleanup);

const PESO_DIGITADO = "87,5";

function calculaComMotorQueQuebra() {
  const eventos: EventoDeErro[] = [];
  const relator = {
    reportar: (evento: EventoDeErro) => void eventos.push(evento),
  };
  const motor = {
    calcular() {
      throw new Error(`estado interno corrompido: peso=${PESO_DIGITADO}`);
    },
  };
  render(<CalculadoraApp relator={relator} motor={motor} />);
  fireEvent.change(screen.getByLabelText(/peso \(kg\)/i), {
    target: { value: PESO_DIGITADO },
  });
  fireEvent.click(screen.getByRole("button", { name: /^calcular$/i }));
  return eventos;
}

describe("RelatorDeErros — evento anônimo sem payload clínico (MD-0010)", () => {
  it("a falha inesperada reporta apenas o nome do erro", () => {
    const eventos = calculaComMotorQueQuebra();
    expect(eventos).toHaveLength(1);
    expect(Object.keys(eventos[0])).toEqual(["nome"]);
    expect(eventos[0].nome).toBe("Error");
  });

  it("nenhum valor digitado pelo médico aparece no evento reportado", () => {
    const eventos = calculaComMotorQueQuebra();
    const serializado = JSON.stringify(eventos);
    expect(serializado).not.toContain("87");
    expect(serializado).not.toContain("peso");
  });

  it("a falha exibe o painel honesto orientando a não prescrever (EC-07)", () => {
    calculaComMotorQueQuebra();
    expect(screen.getByText(/não prescreva/i)).toBeTruthy();
  });

  it("a implementação nula é um no-op que não lança", () => {
    expect(() => relatorNulo.reportar({ nome: "Error" })).not.toThrow();
  });

  it("o fluxo normal não reporta evento algum", () => {
    const relator = { reportar: vi.fn() };
    render(<CalculadoraApp relator={relator} />);
    fireEvent.change(screen.getByLabelText(/peso \(kg\)/i), {
      target: { value: "80" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^calcular$/i }));
    expect(relator.reportar).not.toHaveBeenCalled();
  });
});
