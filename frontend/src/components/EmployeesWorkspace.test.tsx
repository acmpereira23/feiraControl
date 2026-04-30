import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmployeesWorkspace } from "./EmployeesWorkspace";

describe("EmployeesWorkspace", () => {
  it("bloqueia cadastro invalido e exibe erros inline", async () => {
    const user = userEvent.setup();
    const onCreateEmployee = vi.fn().mockResolvedValue(undefined);

    render(
      <EmployeesWorkspace
        activeScreen="create"
        createErrorMessage={null}
        createSuccessMessage={null}
        employees={[]}
        isCreatingEmployee={false}
        isLoadingEmployees={false}
        isPayingEmployee={false}
        onCreateEmployee={onCreateEmployee}
        onCreatePayment={vi.fn()}
        paymentErrorMessage={null}
        paymentSuccessMessage={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cadastrar funcionario" }));

    expect(onCreateEmployee).not.toHaveBeenCalled();
    expect(screen.getByText("Informe o nome do funcionario.")).toBeInTheDocument();
    expect(document.querySelector('input[name="employeeName"]')).toHaveFocus();
  });

  it("envia pagamento valido para um funcionario ativo", async () => {
    const user = userEvent.setup();
    const onCreatePayment = vi.fn().mockResolvedValue(undefined);

    render(
      <EmployeesWorkspace
        activeScreen="payment"
        createErrorMessage={null}
        createSuccessMessage={null}
        employees={[
          {
            id: "employee-1",
            name: "Maria Clara",
            documentNumber: null,
            role: "Caixa",
            defaultDailyRate: 120,
            hiredOn: "2026-04-20",
            status: "ACTIVE",
            createdAt: "2026-04-20T10:00:00Z",
            updatedAt: "2026-04-20T10:00:00Z",
          },
        ]}
        isCreatingEmployee={false}
        isLoadingEmployees={false}
        isPayingEmployee={false}
        onCreateEmployee={vi.fn()}
        onCreatePayment={onCreatePayment}
        paymentErrorMessage={null}
        paymentSuccessMessage="Pagamento registrado e saida automatica enviada ao caixa."
      />,
    );

    await user.selectOptions(screen.getByLabelText("Funcionario"), "employee-1");
    await user.type(screen.getByLabelText("Valor pago"), "120");
    await user.click(screen.getByRole("button", { name: "Registrar pagamento" }));

    expect(onCreatePayment).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Pagamento registrado e saida automatica enviada ao caixa.")).toBeInTheDocument();
  });
});
