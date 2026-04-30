import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearAuthToken,
  getSession,
  restoreAuthToken,
  type Session,
  type StoredAuthSession,
} from "../lib/api";
import { ensureUnauthorizedInterceptor, registerUnauthorizedListener } from "../lib/http";

type AuthState =
  | { status: "booting"; session: null; token: null }
  | {
      status: "anonymous";
      session: null;
      token: null;
      reason: "signed_out" | "expired" | "invalid_session" | null;
      message: string | null;
    }
  | { status: "authenticated"; session: Session; token: string; expiresAt: number };

type AuthContextValue = {
  authState: AuthState;
  clearAuthMessage: () => void;
  signIn: (token: string, session: Session, expiresInSeconds: number) => void;
  signOut: (options?: {
    message?: string | null;
    preserveMessage?: boolean;
    reason?: "signed_out" | "expired" | "invalid_session" | null;
  }) => void;
};

const storageKey = "feiracontrol.auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    status: "booting",
    session: null,
    token: null,
  });

  useEffect(() => {
    ensureUnauthorizedInterceptor();
  }, []);

  useEffect(() => {
    const unregisterUnauthorizedListener = registerUnauthorizedListener(() => {
      clearAuthToken();
      window.localStorage.removeItem(storageKey);
      queryClient.clear();
      setAuthState({
        status: "anonymous",
        session: null,
        token: null,
        reason: "expired",
        message: "Sua sessao expirou ou deixou de ser valida. Entre novamente para continuar.",
      });
    });

    return unregisterUnauthorizedListener;
  }, [queryClient]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setAuthState({
        status: "anonymous",
        session: null,
        token: null,
        reason: null,
        message: null,
      });
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredAuthSession;
      if (!parsed.token || !parsed.session || !parsed.expiresAt) {
        throw new Error("Stored session is malformed.");
      }

      if (Date.now() >= parsed.expiresAt) {
        clearAuthToken();
        window.localStorage.removeItem(storageKey);
        setAuthState({
          status: "anonymous",
          session: null,
          token: null,
          reason: "expired",
          message: "Sua ultima sessao ja expirou. Faca login novamente para entrar no sistema.",
        });
        return;
      }

      restoreAuthToken(parsed.token);
      setAuthState({
        status: "authenticated",
        token: parsed.token,
        session: parsed.session,
        expiresAt: parsed.expiresAt,
      });

      void getSession()
        .then((session) => {
          setAuthState({
            status: "authenticated",
            token: parsed.token,
            session,
            expiresAt: parsed.expiresAt,
          });
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({ token: parsed.token, session, expiresAt: parsed.expiresAt }),
          );
        })
        .catch(() => {
          clearAuthToken();
          window.localStorage.removeItem(storageKey);
          queryClient.clear();
          setAuthState({
            status: "anonymous",
            session: null,
            token: null,
            reason: "invalid_session",
            message: "Nao foi possivel restaurar sua sessao. Faca login novamente para continuar.",
          });
        });
    } catch {
      clearAuthToken();
      window.localStorage.removeItem(storageKey);
      queryClient.clear();
      setAuthState({
        status: "anonymous",
        session: null,
        token: null,
        reason: "invalid_session",
        message: "Encontramos um problema na sessao salva e limpamos o acesso por seguranca.",
      });
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      clearAuthMessage() {
        setAuthState((current) => {
          if (current.status !== "anonymous" || !current.message) {
            return current;
          }

          return { ...current, message: null, reason: null };
        });
      },
      signIn(token, session, expiresInSeconds) {
        const expiresAt = Date.now() + expiresInSeconds * 1000;
        restoreAuthToken(token);
        window.localStorage.setItem(storageKey, JSON.stringify({ token, session, expiresAt }));
        setAuthState({ status: "authenticated", token, session, expiresAt });
      },
      signOut(options) {
        clearAuthToken();
        window.localStorage.removeItem(storageKey);
        queryClient.clear();
        setAuthState({
          status: "anonymous",
          session: null,
          token: null,
          reason: options?.reason ?? "signed_out",
          message: options?.preserveMessage ? authState.status === "anonymous" ? authState.message : null : options?.message ?? null,
        });
      },
    }),
    [authState, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
