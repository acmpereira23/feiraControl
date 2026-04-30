import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Session, StoredAuthSession } from "../lib/api";
import { clearAuthToken, getSession, restoreAuthToken } from "../lib/api";
import { ensureUnauthorizedInterceptor, registerUnauthorizedListener } from "../lib/http";
import { useAuth } from "./auth-context";
import { renderWithProviders } from "../test/render-with-providers";

vi.mock("../lib/api", () => {
  return {
    getSession: vi.fn(),
    restoreAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
  };
});

let unauthorizedListener: (() => void) | null = null;

vi.mock("../lib/http", () => {
  return {
    ensureUnauthorizedInterceptor: vi.fn(),
    registerUnauthorizedListener: vi.fn((listener: () => void) => {
      unauthorizedListener = listener;
      return () => {
        if (unauthorizedListener === listener) {
          unauthorizedListener = null;
        }
      };
    }),
  };
});

const mockedGetSession = vi.mocked(getSession);
const mockedRestoreAuthToken = vi.mocked(restoreAuthToken);
const mockedClearAuthToken = vi.mocked(clearAuthToken);
const mockedEnsureUnauthorizedInterceptor = vi.mocked(ensureUnauthorizedInterceptor);
const mockedRegisterUnauthorizedListener = vi.mocked(registerUnauthorizedListener);

const storageKey = "feiracontrol.auth";

const initialSession: Session = {
  userId: "3fd5f350-a825-46fb-bd74-fad3b6b4dd17",
  email: "caixa@feiracontrol.com",
  authorities: ["OWNER"],
};

const refreshedSession: Session = {
  ...initialSession,
  email: "atualizado@feiracontrol.com",
};

function AuthStateProbe() {
  const { authState, signIn, signOut } = useAuth();

  return (
    <div>
      <p data-testid="status">{authState.status}</p>
      <p data-testid="email">{authState.status === "authenticated" ? authState.session.email : ""}</p>
      <p data-testid="message">{authState.status === "anonymous" ? authState.message ?? "" : ""}</p>
      <p data-testid="reason">{authState.status === "anonymous" ? authState.reason ?? "" : ""}</p>
      <button
        onClick={() => signIn("token-de-teste", initialSession, 3600)}
        type="button"
      >
        Simular Login
      </button>
      <button
        onClick={() => signOut({ reason: "signed_out", message: "Sessao encerrada com sucesso." })}
        type="button"
      >
        Simular Logout
      </button>
    </div>
  );
}

function saveStoredSession(session: StoredAuthSession) {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

describe("AuthProvider", () => {
  beforeEach(() => {
    mockedGetSession.mockReset();
    mockedRestoreAuthToken.mockReset();
    mockedClearAuthToken.mockReset();
    mockedEnsureUnauthorizedInterceptor.mockClear();
    mockedRegisterUnauthorizedListener.mockClear();
    unauthorizedListener = null;
  });

  it("restaura sessao valida e atualiza os dados com o backend", async () => {
    saveStoredSession({
      token: "token-valido",
      session: initialSession,
      expiresAt: Date.now() + 60_000,
    });
    mockedGetSession.mockResolvedValue(refreshedSession);

    renderWithProviders(<AuthStateProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    expect(mockedRestoreAuthToken).toHaveBeenCalledWith("token-valido");
    expect(mockedGetSession).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("email")).toHaveTextContent("atualizado@feiracontrol.com");

    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as StoredAuthSession;
    expect(stored.session.email).toBe("atualizado@feiracontrol.com");
  });

  it("descarta sessao expirada antes de consultar o backend", async () => {
    saveStoredSession({
      token: "token-expirado",
      session: initialSession,
      expiresAt: Date.now() - 1_000,
    });

    renderWithProviders(<AuthStateProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    });

    expect(screen.getByTestId("reason")).toHaveTextContent("expired");
    expect(screen.getByTestId("message")).toHaveTextContent("Sua ultima sessao ja expirou");
    expect(mockedGetSession).not.toHaveBeenCalled();
    expect(mockedClearAuthToken).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("limpa a sessao autenticada no logout manual", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthStateProbe />);

    await user.click(screen.getByRole("button", { name: "Simular Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    expect(window.localStorage.getItem(storageKey)).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Simular Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    });

    expect(screen.getByTestId("reason")).toHaveTextContent("signed_out");
    expect(screen.getByTestId("message")).toHaveTextContent("Sessao encerrada com sucesso.");
    expect(mockedClearAuthToken).toHaveBeenCalled();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("derruba a sessao quando uma requisicao autenticada retorna nao autorizada", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthStateProbe />);

    expect(mockedEnsureUnauthorizedInterceptor).toHaveBeenCalledTimes(1);
    expect(mockedRegisterUnauthorizedListener).toHaveBeenCalledTimes(1);
    expect(unauthorizedListener).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Simular Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await act(async () => {
      unauthorizedListener?.();
    });

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    });

    expect(screen.getByTestId("reason")).toHaveTextContent("expired");
    expect(screen.getByTestId("message")).toHaveTextContent("Sua sessao expirou ou deixou de ser valida");
    expect(mockedClearAuthToken).toHaveBeenCalled();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
