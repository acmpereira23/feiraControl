import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CashComposer } from "./CashComposer";

describe("CashComposer", () => {
  it("impede envio quando os campos obrigatorios estao invalidos", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CashComposer
        errorMessage={null}
        fairLocations={[]}
        isLoadingLocations={false}
        isSaving={false}
        onSubmit={onSubmit}
        successMessage={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Registrar movimentacao" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Descreva o que entrou ou saiu do caixa.")).toBeInTheDocument();
    expect(screen.getByText("Informe um valor maior que zero.")).toBeInTheDocument();
    expect(document.querySelector('input[name="description"]')).toHaveFocus();
  });

  it("mostra mensagem de sucesso e envia payload valido", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CashComposer
        errorMessage={null}
        fairLocations={[]}
        isLoadingLocations={false}
        isSaving={false}
        onSubmit={onSubmit}
        successMessage="Movimentacao registrada com sucesso."
      />,
    );

    await user.type(
      screen.getByLabelText("Descricao"),
      "Venda do almoco",
    );
    await user.type(screen.getByLabelText("Valor"), "12");
    await user.click(screen.getByRole("button", { name: "Registrar movimentacao" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Movimentacao registrada com sucesso.")).toBeInTheDocument();
  });

  it("permite vincular a movimentacao a um local cadastrado", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CashComposer
        errorMessage={null}
        fairLocations={[
          {
            id: "fair-1",
            name: "Feira Central",
            city: "Campinas",
            state: "SP",
            reference: null,
            operatingDays: ["MONDAY"],
            createdAt: "2026-04-29T10:00:00Z",
            updatedAt: "2026-04-29T10:00:00Z",
          },
        ]}
        isLoadingLocations={false}
        isSaving={false}
        onSubmit={onSubmit}
        successMessage={null}
      />,
    );

    await user.type(screen.getByLabelText("Descricao"), "Venda da feira");
    await user.type(screen.getByLabelText("Valor"), "35");
    await user.selectOptions(screen.getByRole("combobox", { name: /local da feira/i }), "fair-1");
    await user.click(screen.getByRole("button", { name: "Registrar movimentacao" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Venda da feira",
        fairLocationId: "fair-1",
      }),
    );
  });
});
