import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { createTestQueryClient } from "../test/create-test-query-client";

const mockAuthContext = {
  authState: {
    status: "authenticated" as const,
    session: {
      userId: "user-1",
      email: "owner@feira.com",
      authorities: ["OWNER"],
    },
    token: "token",
    expiresAt: Date.now() + 60_000,
  },
  clearAuthMessage: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
};

const apiMocks = vi.hoisted(() => ({
  createCashMovement: vi.fn(),
  createEmployee: vi.fn(),
  createEmployeePayment: vi.fn(),
  createFairLocation: vi.fn(),
  getDashboardSummary: vi.fn(),
  getFairLocationCashClosure: vi.fn(),
  getSession: vi.fn(),
  listCashMovements: vi.fn(),
  listEmployees: vi.fn(),
  listFairLocations: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  ...apiMocks,
  getErrorMessage: (error: unknown) => (error instanceof Error ? error.message : "Erro inesperado."),
}));

vi.mock("./auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

function renderApp() {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App context flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    apiMocks.getSession.mockResolvedValue(mockAuthContext.authState.session);
    apiMocks.getDashboardSummary.mockResolvedValue({
      totalIncome: 0,
      totalExpense: 0,
      profit: 0,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      byDay: [],
      byLocation: [],
    });
    apiMocks.listCashMovements.mockResolvedValue([]);
    apiMocks.listEmployees.mockResolvedValue([
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
    ]);
    apiMocks.listFairLocations.mockResolvedValue([]);
    apiMocks.createCashMovement.mockResolvedValue({
      id: "cash-1",
      type: "INCOME",
      description: "Venda do almoco",
      amount: 12,
      occurredOn: "2026-04-29",
      fairLocationId: null,
      createdAt: "2026-04-29T10:00:00Z",
      updatedAt: "2026-04-29T10:00:00Z",
    });
    apiMocks.createEmployee.mockResolvedValue({
      id: "employee-2",
      name: "Joao Pedro",
      documentNumber: null,
      role: null,
      defaultDailyRate: null,
      hiredOn: null,
      status: "ACTIVE",
      createdAt: "2026-04-29T10:00:00Z",
      updatedAt: "2026-04-29T10:00:00Z",
    });
    apiMocks.createEmployeePayment.mockResolvedValue({
      id: "payment-1",
      employeeId: "employee-1",
      cashMovementId: "cash-99",
      amount: 120,
      paidOn: "2026-04-29",
      notes: null,
      createdAt: "2026-04-29T10:00:00Z",
    });
    apiMocks.createFairLocation.mockResolvedValue({
      id: "location-1",
      name: "Feira Central",
      city: "Campinas",
      state: "SP",
      reference: null,
      operatingDays: ["MONDAY"],
      createdAt: "2026-04-29T10:00:00Z",
      updatedAt: "2026-04-29T10:00:00Z",
    });
    apiMocks.getFairLocationCashClosure.mockResolvedValue({
      fairLocationId: "location-1",
      fairLocationName: "Feira Central",
      city: "Campinas",
      state: "SP",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      totalIncome: 600,
      totalExpense: 180,
      profit: 420,
      movementCount: 7,
    });
  });

  it("retorna ao livro caixa com feedback visivel apos registrar movimentacao", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-cash"));
    await user.click(screen.getByRole("tab", { name: /novo lancamento/i }));
    await user.type(screen.getByLabelText("Descricao"), "Venda do almoco");
    await user.type(screen.getByLabelText("Valor"), "12");
    await user.click(screen.getByRole("button", { name: "Registrar movimentacao" }));

    await waitFor(() => {
      expect(screen.getByText("Movimentacao registrada e painel atualizado.")).toBeInTheDocument();
    });

    expect(screen.getByText("Livro caixa do periodo")).toBeInTheDocument();
  });

  it("mostra contexto do local quando a movimentacao do caixa esta vinculada", async () => {
    const user = userEvent.setup();
    apiMocks.listFairLocations.mockResolvedValue([
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
    ]);
    apiMocks.listCashMovements.mockResolvedValue([
      {
        id: "cash-1",
        type: "INCOME",
        description: "Venda do almoco",
        amount: 12,
        occurredOn: "2026-04-29",
        fairLocationId: "fair-1",
        createdAt: "2026-04-29T10:00:00Z",
        updatedAt: "2026-04-29T10:00:00Z",
      },
    ]);

    renderApp();

    await user.click(screen.getByTestId("nav-cash"));

    await waitFor(() => {
      expect(screen.getByText("Feira Central")).toBeInTheDocument();
    });

    expect(screen.getByText("Campinas/SP")).toBeInTheDocument();
  });

  it("retorna para equipe ativa com feedback visivel apos cadastrar funcionario", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-employees"));
    await user.click(screen.getByRole("tab", { name: /novo funcionario/i }));
    await user.type(screen.getByLabelText("Nome"), "Joao Pedro");
    await user.click(screen.getByRole("button", { name: "Cadastrar funcionario" }));

    await waitFor(() => {
      expect(screen.getByText("Funcionario cadastrado e disponivel para a operacao.")).toBeInTheDocument();
    });

    expect(screen.getByText("Funcionarios cadastrados")).toBeInTheDocument();
  });

  it("limpa feedback stale ao trocar de modulo e voltar", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-cash"));
    await user.click(screen.getByRole("tab", { name: /novo lancamento/i }));
    await user.type(screen.getByLabelText("Descricao"), "Venda do almoco");
    await user.type(screen.getByLabelText("Valor"), "12");
    await user.click(screen.getByRole("button", { name: "Registrar movimentacao" }));

    await waitFor(() => {
      expect(screen.getByText("Movimentacao registrada e painel atualizado.")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("nav-dashboard"));
    await user.click(screen.getByTestId("nav-cash"));

    expect(screen.queryByText("Movimentacao registrada e painel atualizado.")).not.toBeInTheDocument();
    expect(screen.getByText("Livro caixa do periodo")).toBeInTheDocument();
  });

  it("permite navegar entre subtelas por teclado nas tabs", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-cash"));

    const historyTab = screen.getByRole("tab", { name: /livro caixa/i });
    expect(historyTab).toHaveAttribute("aria-selected", "true");

    historyTab.focus();
    await user.keyboard("{ArrowRight}");

    const newEntryTab = screen.getByRole("tab", { name: /novo lancamento/i });
    expect(newEntryTab).toHaveFocus();
    expect(newEntryTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(historyTab).toHaveFocus();
    expect(historyTab).toHaveAttribute("aria-selected", "true");
  });

  it("troca subtelas do dashboard e exibe o painel correspondente", async () => {
    const user = userEvent.setup();
    apiMocks.getDashboardSummary.mockResolvedValue({
      totalIncome: 700,
      totalExpense: 250,
      profit: 450,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      byDay: [
        {
          dayOfWeek: "MONDAY",
          totalIncome: 400,
          totalExpense: 120,
          profit: 280,
          movementCount: 4,
        },
      ],
      byLocation: [
        {
          fairLocationId: "fair-1",
          fairLocationName: "Feira Central",
          city: "Campinas",
          state: "SP",
          totalIncome: 700,
          totalExpense: 250,
          profit: 450,
          movementCount: 5,
        },
      ],
    });

    renderApp();

    expect(screen.getByText("Resumo da operacao atual")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /por dia/i }));
    expect(screen.getByText("Quando a operacao rende mais")).toBeInTheDocument();
    expect(screen.getByText("Segunda")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /por local/i }));
    expect(screen.getByText("Quais feiras sustentam o resultado")).toBeInTheDocument();
    expect(screen.getByText("Feira Central")).toBeInTheDocument();
    expect(apiMocks.getDashboardSummary).toHaveBeenCalledTimes(1);
  });

  it("orienta o usuario quando existem locais cadastrados mas ainda nao ha vinculacao no dashboard por local", async () => {
    const user = userEvent.setup();
    apiMocks.listFairLocations.mockResolvedValue([
      {
        id: "fair-1",
        name: "Feira Central",
        city: "Campinas",
        state: "SP",
        reference: null,
        operatingDays: ["SATURDAY"],
        createdAt: "2026-04-29T10:00:00Z",
        updatedAt: "2026-04-29T10:00:00Z",
      },
    ]);
    apiMocks.getDashboardSummary.mockResolvedValue({
      totalIncome: 300,
      totalExpense: 120,
      profit: 180,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      byDay: [],
      byLocation: [],
    });

    renderApp();

    await user.click(screen.getByRole("tab", { name: /por local/i }));

    await waitFor(() => {
      expect(screen.getByText("Sem vinculacao no caixa")).toBeInTheDocument();
    });

    expect(screen.getByText(/Ja existem feiras cadastradas/)).toBeInTheDocument();
  });

  it("retorna para equipe ativa com feedback visivel apos registrar repasse", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-employees"));
    await user.click(screen.getByRole("tab", { name: /novo repasse/i }));
    await user.selectOptions(screen.getByLabelText("Funcionario"), "employee-1");
    await user.type(screen.getByLabelText("Valor pago"), "120");
    await user.click(screen.getByRole("button", { name: "Registrar pagamento" }));

    await waitFor(() => {
      expect(screen.getByText("Pagamento registrado e saida automatica enviada ao caixa.")).toBeInTheDocument();
    });

    expect(screen.getByText("Funcionarios cadastrados")).toBeInTheDocument();
  });

  it("reaproveita cache de equipe ao alternar entre lista, cadastro e repasse", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-employees"));

    await waitFor(() => {
      expect(apiMocks.listEmployees).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("tab", { name: /novo funcionario/i }));
    await user.click(screen.getByRole("tab", { name: /novo repasse/i }));
    await user.click(screen.getByRole("tab", { name: /equipe ativa/i }));

    expect(apiMocks.listEmployees).toHaveBeenCalledTimes(1);
  });

  it("nao consulta historico do caixa ao alternar para novo lancamento", async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(apiMocks.getDashboardSummary).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByTestId("nav-cash"));

    await waitFor(() => {
      expect(apiMocks.listCashMovements).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("tab", { name: /novo lancamento/i }));

    expect(apiMocks.listCashMovements).toHaveBeenCalledTimes(1);
    expect(apiMocks.getDashboardSummary).toHaveBeenCalledTimes(1);
  });

  it("carrega locais ao abrir novo lancamento e envia o fairLocationId selecionado", async () => {
    const user = userEvent.setup();
    apiMocks.listFairLocations.mockResolvedValue([
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
    ]);

    renderApp();

    await user.click(screen.getByTestId("nav-cash"));

    await waitFor(() => {
      expect(apiMocks.listFairLocations).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("tab", { name: /novo lancamento/i }));
    await user.type(screen.getByLabelText("Descricao"), "Venda da feira");
    await user.type(screen.getByLabelText("Valor"), "35");
    await user.selectOptions(screen.getByRole("combobox", { name: /local da feira/i }), "fair-1");
    await user.click(screen.getByRole("button", { name: "Registrar movimentacao" }));

    await waitFor(() => {
      expect(apiMocks.createCashMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          fairLocationId: "fair-1",
        }),
      );
    });
  });

  it("reaproveita cache de locais ao alternar entre lista e cadastro", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId("nav-locations"));

    await waitFor(() => {
      expect(apiMocks.listFairLocations).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("tab", { name: /novo local/i }));
    await user.click(screen.getByRole("tab", { name: /locais ativos/i }));

    expect(apiMocks.listFairLocations).toHaveBeenCalledTimes(1);
  });

  it("consulta fechamento por local em subtela dedicada", async () => {
    const user = userEvent.setup();
    apiMocks.listFairLocations.mockResolvedValue([
      {
        id: "location-1",
        name: "Feira Central",
        city: "Campinas",
        state: "SP",
        reference: null,
        operatingDays: ["SATURDAY"],
        createdAt: "2026-04-29T10:00:00Z",
        updatedAt: "2026-04-29T10:00:00Z",
      },
    ]);

    renderApp();

    await user.click(screen.getByTestId("nav-locations"));
    await user.click(screen.getByRole("tab", { name: /fechamento/i }));
    await user.selectOptions(screen.getByLabelText("Local da feira"), "location-1");

    await waitFor(() => {
      expect(apiMocks.getFairLocationCashClosure).toHaveBeenCalledWith(
        "location-1",
        expect.any(String),
        expect.any(String),
      );
    });

    expect(screen.getByTestId("fair-location-closure-summary")).toBeInTheDocument();
    expect(screen.getByText("Feira Central")).toBeInTheDocument();
    expect(screen.getByText("Campinas, SP")).toBeInTheDocument();
  });
});
