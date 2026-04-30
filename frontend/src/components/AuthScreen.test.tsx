import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthScreen } from "./AuthScreen";

describe("AuthScreen", () => {
  it("bloqueia login invalido e exibe erros inline", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(undefined);

    render(
      <AuthScreen
        busy={false}
        errorMessage={null}
        noticeMessage={null}
        onLogin={onLogin}
        onRegister={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Entrar na operacao" }));

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText("Informe o email para entrar.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha para continuar.")).toBeInTheDocument();
  });

  it("limpa erros de validacao quando o usuario corrige os campos", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(undefined);

    render(
      <AuthScreen
        busy={false}
        errorMessage={null}
        noticeMessage={null}
        onLogin={onLogin}
        onRegister={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Entrar na operacao" }));
    await user.type(screen.getByRole("textbox", { name: /email/i }), "caixa@feiracontrol.com");
    await user.type(screen.getByPlaceholderText("Minimo de 8 caracteres…"), "12345678");

    await waitFor(() => {
      expect(screen.queryByText("Informe o email para entrar.")).not.toBeInTheDocument();
      expect(screen.queryByText("Informe a senha para continuar.")).not.toBeInTheDocument();
    });
  });
});
