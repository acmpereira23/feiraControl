import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardSummaryPanel } from "./DashboardSummaryPanel";

describe("DashboardSummaryPanel", () => {
  it("exibe estados vazios para os blocos analiticos quando nao ha dados suficientes", () => {
    render(
      <DashboardSummaryPanel
        activeScreen="days"
        fairLocationsCount={0}
        filter={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        hasMovements={false}
        isLoading={false}
        isLoadingLocations={false}
        session={{ userId: "user-1", email: "owner@feira.com", authorities: ["OWNER"] }}
        summary={{
          totalIncome: 0,
          totalExpense: 0,
          profit: 0,
          startDate: "2026-04-01",
          endDate: "2026-04-30",
          byDay: [],
          byLocation: [],
        }}
      />,
    );

    expect(screen.getByText("Sem leitura por dia")).toBeInTheDocument();
  });

  it("exibe cards analiticos quando o dashboard possui agregacoes por dia", () => {
    render(
      <DashboardSummaryPanel
        activeScreen="days"
        fairLocationsCount={1}
        filter={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        hasMovements={true}
        isLoading={false}
        isLoadingLocations={false}
        session={{ userId: "user-1", email: "owner@feira.com", authorities: ["OWNER"] }}
        summary={{
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
        }}
      />,
    );

    expect(screen.getByText("Segunda")).toBeInTheDocument();
    expect(screen.getAllByTestId("dashboard-day-card")).toHaveLength(1);
  });

  it("exibe cards analiticos quando o dashboard possui agregacoes por local", () => {
    render(
      <DashboardSummaryPanel
        activeScreen="locations"
        fairLocationsCount={1}
        filter={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        hasMovements={true}
        isLoading={false}
        isLoadingLocations={false}
        session={{ userId: "user-1", email: "owner@feira.com", authorities: ["OWNER"] }}
        summary={{
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
        }}
      />,
    );

    expect(screen.getByText("Feira Central")).toBeInTheDocument();
    expect(screen.getAllByTestId("dashboard-location-card")).toHaveLength(1);
  });

  it("explica quando nao ha locais cadastrados para leitura por local", () => {
    render(
      <DashboardSummaryPanel
        activeScreen="locations"
        fairLocationsCount={0}
        filter={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        hasMovements={false}
        isLoading={false}
        isLoadingLocations={false}
        session={{ userId: "user-1", email: "owner@feira.com", authorities: ["OWNER"] }}
        summary={{
          totalIncome: 0,
          totalExpense: 0,
          profit: 0,
          startDate: "2026-04-01",
          endDate: "2026-04-30",
          byDay: [],
          byLocation: [],
        }}
      />,
    );

    expect(screen.getByText("Nenhum local cadastrado")).toBeInTheDocument();
  });

  it("explica quando ha locais cadastrados mas nao ha vinculacao no caixa", () => {
    render(
      <DashboardSummaryPanel
        activeScreen="locations"
        fairLocationsCount={2}
        filter={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        hasMovements={true}
        isLoading={false}
        isLoadingLocations={false}
        session={{ userId: "user-1", email: "owner@feira.com", authorities: ["OWNER"] }}
        summary={{
          totalIncome: 250,
          totalExpense: 100,
          profit: 150,
          startDate: "2026-04-01",
          endDate: "2026-04-30",
          byDay: [],
          byLocation: [],
        }}
      />,
    );

    expect(screen.getByText("Sem vinculacao no caixa")).toBeInTheDocument();
    expect(screen.getByText(/Ja existem feiras cadastradas/)).toBeInTheDocument();
  });
});
