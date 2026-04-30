import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FairLocationsWorkspace } from "./FairLocationsWorkspace";

describe("FairLocationsWorkspace", () => {
  it("bloqueia cadastro invalido e exibe erros inline", async () => {
    const user = userEvent.setup();
    const onCreateLocation = vi.fn().mockResolvedValue(undefined);

    render(
      <FairLocationsWorkspace
        activeScreen="create"
        closureErrorMessage={null}
        closurePeriod={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        closureSelectedLocationId=""
        createErrorMessage={null}
        createSuccessMessage={null}
        isCreatingLocation={false}
        isLoadingClosure={false}
        isLoadingLocations={false}
        locations={[]}
        onChangeClosureLocation={vi.fn()}
        onChangeClosurePeriod={vi.fn()}
        onCreateLocation={onCreateLocation}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cadastrar local" }));

    expect(onCreateLocation).not.toHaveBeenCalled();
    expect(screen.getByText("Informe o nome do local da feira.")).toBeInTheDocument();
    expect(screen.getByText("Selecione pelo menos um dia operacional.")).toBeInTheDocument();
  });

  it("envia cadastro valido de local", async () => {
    const user = userEvent.setup();
    const onCreateLocation = vi.fn().mockResolvedValue(undefined);

    render(
      <FairLocationsWorkspace
        activeScreen="create"
        closureErrorMessage={null}
        closurePeriod={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        closureSelectedLocationId=""
        createErrorMessage={null}
        createSuccessMessage="Local cadastrado e pronto para uso no caixa e no dashboard."
        isCreatingLocation={false}
        isLoadingClosure={false}
        isLoadingLocations={false}
        locations={[]}
        onChangeClosureLocation={vi.fn()}
        onChangeClosurePeriod={vi.fn()}
        onCreateLocation={onCreateLocation}
      />,
    );

    await user.type(screen.getByLabelText("Nome do local"), "Feira Central");
    await user.type(screen.getByLabelText("Cidade"), "Campinas");
    await user.type(screen.getByLabelText("Estado"), "sp");
    await user.click(screen.getByRole("button", { name: "Seg" }));
    await user.click(screen.getByRole("button", { name: "Qua" }));
    await user.click(screen.getByRole("button", { name: "Cadastrar local" }));

    expect(onCreateLocation).toHaveBeenCalledWith({
      city: "Campinas",
      name: "Feira Central",
      operatingDays: ["MONDAY", "WEDNESDAY"],
      reference: undefined,
      state: "SP",
    });
    expect(screen.getByText("Local cadastrado e pronto para uso no caixa e no dashboard.")).toBeInTheDocument();
  });

  it("exibe estado vazio da base de locais", () => {
    render(
      <FairLocationsWorkspace
        activeScreen="list"
        closureErrorMessage={null}
        closurePeriod={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        closureSelectedLocationId=""
        createErrorMessage={null}
        createSuccessMessage={null}
        isCreatingLocation={false}
        isLoadingClosure={false}
        isLoadingLocations={false}
        locations={[]}
        onChangeClosureLocation={vi.fn()}
        onChangeClosurePeriod={vi.fn()}
        onCreateLocation={vi.fn()}
      />,
    );

    expect(screen.getByTestId("fair-locations-empty")).toBeInTheDocument();
    expect(screen.getByText("Nenhum local cadastrado ainda.")).toBeInTheDocument();
  });

  it("exibe estado vazio do fechamento quando nenhum local foi selecionado", () => {
    render(
      <FairLocationsWorkspace
        activeScreen="closure"
        closureErrorMessage={null}
        closurePeriod={{ startDate: "2026-04-01", endDate: "2026-04-30" }}
        closureSelectedLocationId=""
        createErrorMessage={null}
        createSuccessMessage={null}
        isCreatingLocation={false}
        isLoadingClosure={false}
        isLoadingLocations={false}
        locations={[
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
        ]}
        onChangeClosureLocation={vi.fn()}
        onChangeClosurePeriod={vi.fn()}
        onCreateLocation={vi.fn()}
      />,
    );

    expect(screen.getByTestId("fair-location-closure-no-selection")).toBeInTheDocument();
    expect(screen.getByText("Selecione uma feira")).toBeInTheDocument();
  });
});
