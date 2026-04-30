import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/AppShell";
import { AuthScreen } from "../components/AuthScreen";
import { CashComposer } from "../components/CashComposer";
import { CashFeed } from "../components/CashFeed";
import { DashboardSummaryPanel } from "../components/DashboardSummaryPanel";
import { EmployeesWorkspace } from "../components/EmployeesWorkspace";
import { FairLocationsWorkspace } from "../components/FairLocationsWorkspace";
import {
  createEmployee,
  createEmployeePayment,
  createCashMovement,
  createFairLocation,
  getFairLocationCashClosure,
  getDashboardSummary,
  getErrorMessage,
  getSession,
  listFairLocations,
  listEmployees,
  listCashMovements,
  login,
  register,
  type CashMovementPayload,
  type CreateEmployeePayload,
  type CreateEmployeePaymentPayload,
  type CreateFairLocationPayload,
  type DashboardSummary,
  type FairLocation,
  type FairLocationCashClosureSummary,
} from "../lib/api";
import { getCurrentMonthPeriod, type PeriodFilter } from "../lib/date";
import { validatePeriodFilter } from "../lib/validation";
import { useAuth } from "./auth-context";

type WorkspaceView = "dashboard" | "cash" | "employees" | "locations";
type DashboardScreen = "overview" | "days" | "locations";
type CashScreen = "history" | "new-entry";
type EmployeesScreen = "list" | "create" | "payment";
type LocationsScreen = "list" | "create" | "closure";

function getSubtabId(prefix: string, value: string) {
  return `${prefix}-${value}-tab`;
}

export function App() {
  const queryClient = useQueryClient();
  const { authState, clearAuthMessage, signIn, signOut } = useAuth();
  const [view, setView] = useState<WorkspaceView>("dashboard");
  const [dashboardScreen, setDashboardScreen] = useState<DashboardScreen>("overview");
  const [cashScreen, setCashScreen] = useState<CashScreen>("history");
  const [employeesScreen, setEmployeesScreen] = useState<EmployeesScreen>("list");
  const [locationsScreen, setLocationsScreen] = useState<LocationsScreen>("list");
  const [locationClosureFilter, setLocationClosureFilter] = useState(() => ({
    fairLocationId: "",
    ...getCurrentMonthPeriod(),
  }));
  const [period, setPeriod] = useState<PeriodFilter>(() => getCurrentMonthPeriod());
  const [cashSuccessMessage, setCashSuccessMessage] = useState<string | null>(null);
  const [employeeSuccessMessage, setEmployeeSuccessMessage] = useState<string | null>(null);
  const [employeePaymentSuccessMessage, setEmployeePaymentSuccessMessage] = useState<string | null>(null);
  const [locationSuccessMessage, setLocationSuccessMessage] = useState<string | null>(null);
  const periodError = validatePeriodFilter(period);
  const isDashboardView = view === "dashboard";
  const isDashboardLocationsView = view === "dashboard" && dashboardScreen === "locations";
  const isCashView = view === "cash";
  const isCashHistoryView = view === "cash" && cashScreen === "history";
  const isCashNewEntryView = view === "cash" && cashScreen === "new-entry";
  const isEmployeesListView = view === "employees" && employeesScreen === "list";
  const isEmployeesPaymentView = view === "employees" && employeesScreen === "payment";
  const isLocationsListView = view === "locations" && locationsScreen === "list";
  const isLocationsClosureView = view === "locations" && locationsScreen === "closure";
  const shouldQueryPeriodData = !periodError && (isDashboardView || isCashHistoryView);
  const locationClosurePeriodError = validatePeriodFilter({
    startDate: locationClosureFilter.startDate,
    endDate: locationClosureFilter.endDate,
  });

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    enabled: authState.status === "authenticated",
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => getDashboardSummary(period.startDate || undefined, period.endDate || undefined),
    enabled: authState.status === "authenticated" && shouldQueryPeriodData,
    staleTime: 30 * 1000,
  });

  const cashMovementsQuery = useQuery({
    queryKey: ["cash-movements", period],
    queryFn: () => listCashMovements(period.startDate || undefined, period.endDate || undefined),
    enabled: authState.status === "authenticated" && isCashHistoryView && !periodError,
    staleTime: 30 * 1000,
  });

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
    enabled: authState.status === "authenticated" && (isEmployeesListView || isEmployeesPaymentView),
    staleTime: 60 * 1000,
  });

  const fairLocationsQuery = useQuery({
    queryKey: ["fair-locations"],
    queryFn: listFairLocations,
    enabled: authState.status === "authenticated" && (isLocationsListView || isLocationsClosureView || isCashView || isDashboardLocationsView),
    staleTime: 60 * 1000,
  });

  const fairLocationClosureQuery = useQuery({
    queryKey: [
      "fair-location-cash-closure",
      locationClosureFilter.fairLocationId,
      locationClosureFilter.startDate,
      locationClosureFilter.endDate,
    ],
    queryFn: () => getFairLocationCashClosure(
      locationClosureFilter.fairLocationId,
      locationClosureFilter.startDate || undefined,
      locationClosureFilter.endDate || undefined,
    ),
    enabled: authState.status === "authenticated"
      && isLocationsClosureView
      && locationClosureFilter.fairLocationId.length > 0
      && !locationClosurePeriodError,
    staleTime: 30 * 1000,
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (result) => {
      signIn(result.accessToken, result.session, result.expiresInSeconds);
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      signIn(result.accessToken, result.session, result.expiresInSeconds);
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const createCashMovementMutation = useMutation({
    mutationFn: (payload: CashMovementPayload) => createCashMovement(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cash-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setCashSuccessMessage("Movimentacao registrada e painel atualizado.");
      setCashScreen("history");
      setView("cash");
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEmployeeSuccessMessage("Funcionario cadastrado e disponivel para a operacao.");
      setEmployeePaymentSuccessMessage(null);
      setEmployeesScreen("list");
      setView("employees");
    },
  });

  const createEmployeePaymentMutation = useMutation({
    mutationFn: (payload: CreateEmployeePaymentPayload) => createEmployeePayment(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
        queryClient.invalidateQueries({ queryKey: ["cash-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setEmployeePaymentSuccessMessage("Pagamento registrado e saida automatica enviada ao caixa.");
      setEmployeeSuccessMessage(null);
      setEmployeesScreen("list");
      setView("employees");
    },
  });

  const createFairLocationMutation = useMutation({
    mutationFn: (payload: CreateFairLocationPayload) => createFairLocation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fair-locations"] });
      setLocationSuccessMessage("Local cadastrado e pronto para uso no caixa e no dashboard.");
      setLocationsScreen("list");
      setView("locations");
    },
  });

  const session = sessionQuery.data ?? authState.session;
  const fairLocations = fairLocationsQuery.data ?? [];
  const fairLocationsById = useMemo(
    () => new Map<string, FairLocation>(fairLocations.map((location) => [location.id, location])),
    [fairLocations],
  );
  const loadingApp = authState.status === "booting";
  const isRefreshing = sessionQuery.isFetching
    || (isDashboardView ? dashboardQuery.isFetching : false)
    || (isDashboardLocationsView ? fairLocationsQuery.isFetching : false)
    || (isCashHistoryView ? dashboardQuery.isFetching || cashMovementsQuery.isFetching || fairLocationsQuery.isFetching : false)
    || (isCashNewEntryView ? fairLocationsQuery.isFetching : false)
    || (isEmployeesListView || isEmployeesPaymentView ? employeesQuery.isFetching : false)
    || (isLocationsListView ? fairLocationsQuery.isFetching : false)
    || (isLocationsClosureView ? fairLocationsQuery.isFetching || fairLocationClosureQuery.isFetching : false);

  const authError = registerMutation.error ?? loginMutation.error;
  const workspaceError = (isDashboardView || view === "cash") && periodError
    ? new Error(periodError)
    : view === "cash"
      ? fairLocationsQuery.error ?? dashboardQuery.error ?? cashMovementsQuery.error ?? sessionQuery.error
    : view === "employees"
      ? employeesQuery.error ?? sessionQuery.error
      : view === "locations"
        ? fairLocationsQuery.error ?? sessionQuery.error
        : dashboardQuery.error ?? cashMovementsQuery.error ?? sessionQuery.error;
  const dashboardSummary = periodError ? undefined : dashboardQuery.data;
  const cashItems = periodError ? [] : cashMovementsQuery.data ?? [];
  const hasOperationalData = (dashboardSummary?.totalIncome ?? 0) > 0 || (dashboardSummary?.totalExpense ?? 0) > 0;

  const spotlight = useMemo(() => {
    const summary = dashboardSummary;
    if (!summary || !hasOperationalData) {
      return "Abra o caixa do dia, registre as primeiras movimentacoes e acompanhe o lucro sem caderno paralelo.";
    }

    const profit = summary.profit.toFixed(2).replace(".", ",");
    return `Lucro atual no periodo filtrado: R$ ${profit}. Revise entradas, saidas e mantenha a operacao sob controle.`;
  }, [dashboardSummary, hasOperationalData]);

  const dashboardTabDescription = dashboardScreen === "overview"
    ? "Leitura principal do periodo com totais, contexto operacional e direcao consolidada do caixa."
    : dashboardScreen === "days"
      ? "Comparacao dedicada por dia da semana para identificar ritmo real sem disputar espaco com outros blocos."
      : "Comparacao dedicada por local para entender quais feiras sustentam o resultado do periodo.";

  const cashTabDescription = cashScreen === "history"
    ? "Tela de consulta do livro caixa com historico e totais do periodo em uma leitura continua."
    : "Tela de lancamento rapido para registrar movimentacao sem competir com o historico.";

  const employeesTabDescription = employeesScreen === "list"
    ? "Tela principal da equipe para consultar quem esta ativo, quem saiu do fluxo e o estado do cadastro."
    : employeesScreen === "create"
      ? "Tela de cadastro de funcionario com foco total na entrada operacional do time."
      : "Tela propria para registrar repasses sem misturar pagamento com consulta de equipe.";

  const locationsTabDescription = locationsScreen === "list"
    ? "Use a tela principal de locais para consultar a base ativa de feiras ja cadastradas."
    : locationsScreen === "create"
      ? "Cadastre novos locais em uma tela dedicada, sem comprimir consulta e formulario no mesmo bloco."
      : "Feche uma feira especifica com leitura consolidada de entradas, saidas e resultado do periodo.";

  function clearCashContext() {
    setCashSuccessMessage(null);
    createCashMovementMutation.reset();
  }

  function clearEmployeesContext() {
    setEmployeeSuccessMessage(null);
    setEmployeePaymentSuccessMessage(null);
    createEmployeeMutation.reset();
    createEmployeePaymentMutation.reset();
  }

  function clearLocationsContext() {
    setLocationSuccessMessage(null);
    createFairLocationMutation.reset();
  }

  function handleSelectView(nextView: WorkspaceView) {
    if (nextView === view) {
      return;
    }

    clearCashContext();
    clearEmployeesContext();
    clearLocationsContext();

    setView(nextView);

    if (nextView === "dashboard") {
      setDashboardScreen("overview");
      return;
    }

    if (nextView === "cash") {
      setCashScreen("history");
      return;
    }

    if (nextView === "employees") {
      setEmployeesScreen("list");
      return;
    }

    setLocationsScreen("list");
  }

  function handleCashScreenChange(nextScreen: CashScreen) {
    if (nextScreen !== cashScreen) {
      clearCashContext();
    }

    setCashScreen(nextScreen);
  }

  function handleEmployeesScreenChange(nextScreen: EmployeesScreen) {
    if (nextScreen !== employeesScreen) {
      clearEmployeesContext();
    }

    setEmployeesScreen(nextScreen);
  }

  function handleLocationsScreenChange(nextScreen: LocationsScreen) {
    if (nextScreen !== locationsScreen) {
      clearLocationsContext();
    }

    setLocationsScreen(nextScreen);
  }

  if (loadingApp) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink-strong)]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="w-full max-w-md rounded-[2rem] border border-[var(--line-soft)] bg-[var(--paper)]/90 p-8 text-center shadow-[var(--shadow-panel)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              FeiraControl
            </p>
            <h1 className="mt-3 font-serif text-4xl text-[var(--ink-strong)]">Abrindo o caderno</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
              Restaurando sessao e preparando seus dados financeiros.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (authState.status !== "authenticated" || !session) {
    return (
      <AuthScreen
        busy={registerMutation.isPending || loginMutation.isPending}
        errorMessage={authError ? getErrorMessage(authError) : null}
        noticeMessage={authState.status === "anonymous" ? authState.message : null}
        onInteraction={() => {
          clearAuthMessage();
          registerMutation.reset();
          loginMutation.reset();
        }}
        onLogin={async (payload) => {
          clearAuthMessage();
          registerMutation.reset();
          await loginMutation.mutateAsync(payload);
        }}
        onRegister={async (payload) => {
          clearAuthMessage();
          loginMutation.reset();
          await registerMutation.mutateAsync(payload);
        }}
      />
    );
  }

  return (
    <AppShell
      activeView={view}
      isRefreshing={isRefreshing}
      onLogout={() => {
        signOut({ reason: "signed_out", message: "Sessao encerrada com sucesso." });
      }}
      onSelectView={handleSelectView}
      session={session}
      spotlight={spotlight}
    >
      {isDashboardView || view === "cash" ? (
        <AppShell.Filters
          endDate={period.endDate}
          errorMessage={periodError}
          startDate={period.startDate}
          onChange={(nextPeriod) => {
            setCashSuccessMessage(null);
            setPeriod(nextPeriod);
          }}
        />
      ) : null}

      {workspaceError ? (
        <AppShell.Alert
          message={getErrorMessage(workspaceError)}
          title={periodError ? "Revise o periodo selecionado" : "Nao foi possivel atualizar a operacao"}
        />
      ) : null}

      {view === "dashboard" ? (
        <>
          <AppShell.SectionTabs
            activeValue={dashboardScreen}
            description={dashboardTabDescription}
            items={[
              { description: "Receita, despesa e leitura geral do periodo.", label: "Painel geral", value: "overview" },
              { description: "Comparacao por dia da semana.", label: "Por dia", value: "days" },
              { description: "Desempenho por local de feira.", label: "Por local", value: "locations" },
            ]}
            onChange={setDashboardScreen}
            panelId="dashboard-panel"
            tabIdPrefix="dashboard-screen"
            title="Dashboard"
          />
          <div
            aria-labelledby={getSubtabId("dashboard-screen", dashboardScreen)}
            id="dashboard-panel"
            role="tabpanel"
            tabIndex={-1}
          >
            <DashboardSummaryPanel
              activeScreen={dashboardScreen}
              filter={period}
              fairLocationsCount={fairLocations.length}
              hasMovements={hasOperationalData}
              isLoadingLocations={fairLocationsQuery.isLoading}
              isLoading={dashboardQuery.isLoading}
              session={session}
              summary={dashboardSummary}
            />
          </div>
        </>
      ) : view === "cash" ? (
        <>
          <AppShell.SectionTabs
            activeValue={cashScreen}
            description={cashTabDescription}
            items={[
              { description: "Livro caixa e resumo do periodo filtrado.", label: "Livro caixa", value: "history" },
              { description: "Registrar entrada ou saida em tela dedicada.", label: "Novo lancamento", value: "new-entry" },
            ]}
            onChange={handleCashScreenChange}
            panelId="cash-panel"
            tabIdPrefix="cash-screen"
            title="Caixa"
          />
          <div aria-labelledby={getSubtabId("cash-screen", cashScreen)} id="cash-panel" role="tabpanel" tabIndex={-1}>
            {cashScreen === "new-entry" ? (
              <CashComposer
                errorMessage={createCashMovementMutation.error ? getErrorMessage(createCashMovementMutation.error) : null}
                fairLocations={fairLocations}
                isLoadingLocations={fairLocationsQuery.isLoading}
                isSaving={createCashMovementMutation.isPending}
                onInteraction={() => clearCashContext()}
                onSubmit={async (payload) => {
                  await createCashMovementMutation.mutateAsync(payload);
                }}
                successMessage={cashSuccessMessage}
              />
            ) : (
              <CashFeed
                fairLocationsById={fairLocationsById}
                filter={period}
                isLoading={cashMovementsQuery.isLoading}
                items={cashItems}
                successMessage={cashSuccessMessage}
                summary={dashboardSummary ?? emptySummary(period)}
              />
            )}
          </div>
        </>
      ) : view === "employees" ? (
        <>
          <AppShell.SectionTabs
            activeValue={employeesScreen}
            description={employeesTabDescription}
            items={[
              { description: "Tela principal com equipe cadastrada.", label: "Equipe ativa", value: "list" },
              { description: "Cadastro em tela separada.", label: "Novo funcionario", value: "create" },
              { description: "Repasse em tela separada.", label: "Novo repasse", value: "payment" },
            ]}
            onChange={handleEmployeesScreenChange}
            panelId="employees-panel"
            tabIdPrefix="employees-screen"
            title="Equipe"
          />
          <div
            aria-labelledby={getSubtabId("employees-screen", employeesScreen)}
            id="employees-panel"
            role="tabpanel"
            tabIndex={-1}
          >
            <EmployeesWorkspace
              activeScreen={employeesScreen}
              createErrorMessage={createEmployeeMutation.error ? getErrorMessage(createEmployeeMutation.error) : null}
              createSuccessMessage={employeeSuccessMessage}
              employees={employeesQuery.data ?? []}
              isCreatingEmployee={createEmployeeMutation.isPending}
              isLoadingEmployees={employeesQuery.isLoading}
              isPayingEmployee={createEmployeePaymentMutation.isPending}
              onCreateEmployee={async (payload) => {
                setEmployeePaymentSuccessMessage(null);
                createEmployeePaymentMutation.reset();
                await createEmployeeMutation.mutateAsync(payload);
              }}
              onCreatePayment={async (payload) => {
                setEmployeeSuccessMessage(null);
                createEmployeeMutation.reset();
                await createEmployeePaymentMutation.mutateAsync(payload);
              }}
              onInteraction={() => clearEmployeesContext()}
              paymentErrorMessage={
                createEmployeePaymentMutation.error ? getErrorMessage(createEmployeePaymentMutation.error) : null
              }
              paymentSuccessMessage={employeePaymentSuccessMessage}
            />
          </div>
        </>
      ) : (
        <>
          <AppShell.SectionTabs
            activeValue={locationsScreen}
            description={locationsTabDescription}
            items={[
              { description: "Base principal com locais ja cadastrados.", label: "Locais ativos", value: "list" },
              { description: "Cadastro em tela separada para novas feiras.", label: "Novo local", value: "create" },
              { description: "Leitura consolidada por feira e periodo.", label: "Fechamento", value: "closure" },
            ]}
            onChange={handleLocationsScreenChange}
            title="Locais de Feira"
          />
          <FairLocationsWorkspace
            activeScreen={locationsScreen}
            closureErrorMessage={
              isLocationsClosureView && fairLocationClosureQuery.error
                ? getErrorMessage(fairLocationClosureQuery.error)
                : null
            }
            closurePeriod={{
              startDate: locationClosureFilter.startDate,
              endDate: locationClosureFilter.endDate,
            }}
            closurePeriodError={locationClosurePeriodError}
            closureSelectedLocationId={locationClosureFilter.fairLocationId}
            closureSummary={fairLocationClosureQuery.data as FairLocationCashClosureSummary | undefined}
            createErrorMessage={
              createFairLocationMutation.error ? getErrorMessage(createFairLocationMutation.error) : null
            }
            createSuccessMessage={locationSuccessMessage}
            isCreatingLocation={createFairLocationMutation.isPending}
            isLoadingClosure={fairLocationClosureQuery.isLoading}
            isLoadingLocations={fairLocationsQuery.isLoading}
            locations={fairLocations}
            onChangeClosureLocation={(fairLocationId) => {
              setLocationSuccessMessage(null);
              createFairLocationMutation.reset();
              setLocationClosureFilter((current) => ({ ...current, fairLocationId }));
            }}
            onChangeClosurePeriod={(period) => {
              setLocationSuccessMessage(null);
              createFairLocationMutation.reset();
              setLocationClosureFilter((current) => ({ ...current, ...period }));
            }}
            onCreateLocation={async (payload) => {
              await createFairLocationMutation.mutateAsync(payload);
            }}
            onInteraction={() => clearLocationsContext()}
          />
        </>
      )}
    </AppShell>
  );
}

function emptySummary(filter: PeriodFilter): DashboardSummary {
  return {
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    startDate: filter.startDate,
    endDate: filter.endDate,
    byDay: [],
    byLocation: [],
  };
}
