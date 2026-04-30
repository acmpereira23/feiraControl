import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const unauthorizedListeners = new Set<() => void>();

let interceptorConfigured = false;

function notifyUnauthorizedListeners() {
  unauthorizedListeners.forEach((listener) => {
    listener();
  });
}

function hasAuthorizationHeader(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const authorizationHeader = error.config?.headers?.Authorization
    ?? error.config?.headers?.authorization;

  return typeof authorizationHeader === "string" && authorizationHeader.length > 0;
}

export function registerUnauthorizedListener(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function ensureUnauthorizedInterceptor() {
  if (interceptorConfigured) {
    return;
  }

  http.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401 && hasAuthorizationHeader(error)) {
        notifyUnauthorizedListeners();
      }

      throw error;
    },
  );

  interceptorConfigured = true;
}
