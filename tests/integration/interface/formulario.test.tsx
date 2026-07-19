// @vitest-environment jsdom
// T013 — Formulário da calculadora (RF-05/RF-06/RF-07 do requirements; RF-01..RF-03/RF-11 da UI).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormularioCalculadora } from "interface/calculadora/formulario";

afterEach(cleanup);

function renderizaFormulario() {
  const onCalcular = vi.fn();
  render(<FormularioCalculadora onCalcular={onCalcular} />);
  return { onCalcular };
}

function selecionaTitulacao() {
  fireEvent.click(screen.getByRole("radio", { name: /titulação de dose/i }));
}

function preenchePeso(valor: string) {
  fireEvent.change(screen.getByLabelText(/peso \(kg\)/i), {
    target: { value: valor },
  });
}

function calcular() {
  fireEvent.click(screen.getByRole("button", { name: /^calcular$/i }));
}

describe("Campos por modo (RF-06 do requirements; RF-01 da UI)", () => {
  it("no modo início, a seção de esquema atual não aparece", () => {
    renderizaFormulario();
    expect(screen.queryByText(/esquema atual/i)).toBeNull();
  });

  it("na titulação, a seção de esquema atual aparece", () => {
    renderizaFormulario();
    selecionaTitulacao();
    expect(screen.getByText(/esquema atual/i)).toBeTruthy();
  });

  it("a seleção de modo é explícita, com as duas opções nomeadas", () => {
    renderizaFormulario();
    expect(
      screen.getByRole("radio", { name: /início de insulinização/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: /titulação de dose/i }),
    ).toBeTruthy();
  });
});

describe("Unidades visíveis nos rótulos (RF-06 do requirements; RF-02 da UI)", () => {
  it("peso em kg, glicemia em mg/dL e dose em UI aparecem nos rótulos", () => {
    renderizaFormulario();
    expect(screen.getByLabelText(/peso \(kg\)/i)).toBeTruthy();
    expect(
      screen.getAllByLabelText(/glicemia \(mg\/dl\)/i).length,
    ).toBeGreaterThanOrEqual(1);
    selecionaTitulacao();
    expect(
      screen.getAllByLabelText(/dose \(ui\)/i).length,
    ).toBeGreaterThanOrEqual(1);
  });
});

describe("Vírgula e ponto equivalentes (RF-05 do requirements; RF-03/EC-01 da UI)", () => {
  it("peso '82,5' e '82.5' produzem o mesmo valor na entrada do motor", () => {
    for (const bruto of ["82,5", "82.5"]) {
      const { onCalcular } = renderizaFormulario();
      preenchePeso(bruto);
      calcular();
      expect(onCalcular).toHaveBeenCalledTimes(1);
      expect(onCalcular.mock.calls[0][0].pesoKg).toBe(82.5);
      cleanup();
    }
  });
});

describe("Validação no blur com as faixas do motor (RF-05)", () => {
  it("peso 400 mostra erro localizado no campo ao sair dele", () => {
    renderizaFormulario();
    const campo = screen.getByLabelText(/peso \(kg\)/i);
    fireEvent.change(campo, { target: { value: "400" } });
    fireEvent.blur(campo);
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /350/.test(el.textContent ?? "")),
    ).toBe(true);
  });

  it("com campo inválido, o envio é bloqueado", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("400");
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
  });

  it("texto não numérico é rejeitado no campo (EC-02 da UI)", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("oitenta");
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
  });
});

describe("Múltiplas glicemias (RF-07 do requirements; RF-11 da UI)", () => {
  it("é possível registrar 3 valores e remover qualquer um antes do cálculo", () => {
    renderizaFormulario();
    selecionaTitulacao();
    const adicionar = screen.getByRole("button", {
      name: /adicionar glicemia/i,
    });
    fireEvent.click(adicionar);
    fireEvent.click(adicionar);
    expect(screen.getAllByLabelText(/glicemia \(mg\/dl\)/i)).toHaveLength(3);

    fireEvent.click(
      screen.getAllByRole("button", { name: /remover glicemia/i })[0],
    );
    expect(screen.getAllByLabelText(/glicemia \(mg\/dl\)/i)).toHaveLength(2);
  });
});

describe("Envio incompleto bloqueado (RF-06 do requirements; RF-02 da UI)", () => {
  it("titulação sem peso não chama o motor e aponta o campo", () => {
    const { onCalcular } = renderizaFormulario();
    selecionaTitulacao();
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
  });
});
