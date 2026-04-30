import axios from "axios";
import { http } from "./http";

export type Session = {
  userId: string;
  email: string;
  authorities: string[];
};

export type AuthResult = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  session: Session;
};

export type StoredAuthSession = {
  token: string;
  session: Session;
  expiresAt: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  startDate: string | null;
  endDate: string | null;
  byDay: DashboardDaySummary[];
  byLocation: DashboardLocationSummary[];
};

export type DashboardDaySummary = {
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  totalIncome: number;
  totalExpense: number;
  profit: number;
  movementCount: number;
};

export type DashboardLocationSummary = {
  fairLocationId: string;
  fairLocationName: string;
  city: string;
  state: string;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  movementCount: number;
};

export type CashMovementType = "INCOME" | "EXPENSE";
export type OperatingDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type CashMovement = {
  id: string;
  fairLocationId: string | null;
  type: CashMovementType;
  description: string;
  amount: number;
  occurredOn: string;
  createdAt: string;
  updatedAt: string;
};

export type CashMovementPayload = {
  type: CashMovementType;
  description: string;
  amount: number;
  occurredOn: string;
  fairLocationId?: string;
};

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export type Employee = {
  id: string;
  name: string;
  documentNumber: string | null;
  role: string | null;
  defaultDailyRate: number | null;
  hiredOn: string | null;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeePayload = {
  name: string;
  documentNumber?: string;
  role?: string;
  defaultDailyRate?: number;
  hiredOn?: string;
  status: EmployeeStatus;
};

export type EmployeePayment = {
  id: string;
  employeeId: string;
  cashMovementId: string;
  amount: number;
  paidOn: string;
  notes: string | null;
  createdAt: string;
};

export type CreateEmployeePaymentPayload = {
  employeeId: string;
  amount: number;
  paidOn: string;
  notes?: string;
};

export type FairLocation = {
  id: string;
  name: string;
  city: string;
  state: string;
  reference: string | null;
  operatingDays: OperatingDay[];
  createdAt: string;
  updatedAt: string;
};

export type CreateFairLocationPayload = {
  name: string;
  city: string;
  state: string;
  reference?: string;
  operatingDays: OperatingDay[];
};

export type FairLocationCashClosureSummary = {
  fairLocationId: string;
  fairLocationName: string;
  city: string;
  state: string;
  startDate: string | null;
  endDate: string | null;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  movementCount: number;
};

type ApiErrorShape = {
  message?: string;
  error?: string;
  details?: string[];
};

export async function register(payload: RegisterPayload) {
  const { data } = await http.post<AuthResult>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await http.post<AuthResult>("/auth/login", payload);
  return data;
}

export async function getSession() {
  const { data } = await http.get<Session>("/auth/me");
  return data;
}

export async function getDashboardSummary(startDate?: string, endDate?: string) {
  const { data } = await http.get<DashboardSummary>("/dashboard", {
    params: {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  });
  return data;
}

export async function listCashMovements(startDate?: string, endDate?: string) {
  const { data } = await http.get<CashMovement[]>("/cash-movements", {
    params: {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  });
  return data;
}

export async function createCashMovement(payload: CashMovementPayload) {
  const { data } = await http.post<CashMovement>("/cash-movements", payload);
  return data;
}

export async function listEmployees() {
  const { data } = await http.get<Employee[]>("/employees");
  return data;
}

export async function createEmployee(payload: CreateEmployeePayload) {
  const { data } = await http.post<Employee>("/employees", payload);
  return data;
}

export async function createEmployeePayment(payload: CreateEmployeePaymentPayload) {
  const { data } = await http.post<EmployeePayment>("/employee-payments", payload);
  return data;
}

export async function listFairLocations() {
  const { data } = await http.get<FairLocation[]>("/fair-locations");
  return data;
}

export async function createFairLocation(payload: CreateFairLocationPayload) {
  const { data } = await http.post<FairLocation>("/fair-locations", payload);
  return data;
}

export async function getFairLocationCashClosure(
  fairLocationId: string,
  startDate?: string,
  endDate?: string,
) {
  const { data } = await http.get<FairLocationCashClosureSummary>(`/fair-locations/${fairLocationId}/cash-closure`, {
    params: {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  });
  return data;
}

export function restoreAuthToken(token: string) {
  http.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete http.defaults.headers.common.Authorization;
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const status = error.response?.status;
    const details = error.response?.data?.details ?? [];
    if (details.length > 0) {
      return details.join(" ");
    }

    const rawMessage = error.response?.data?.message ?? error.response?.data?.error ?? error.message;

    if (status === 401) {
      return "Email ou senha invalidos. Revise os dados e tente novamente.";
    }

    if (status === 409) {
      return "Este email ja esta em uso. Entre com a conta existente ou use outro email.";
    }

    if (status === 400 && rawMessage === "Request validation failed") {
      return "Revise os campos destacados e tente novamente.";
    }

    if (status === 400 && rawMessage === "Employee not found") {
      return "Selecione um funcionario valido para registrar o pagamento.";
    }

    if (status === 400 && rawMessage === "Fair location not found") {
      return "Selecione um local de feira valido para consultar o fechamento.";
    }

    return rawMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}
