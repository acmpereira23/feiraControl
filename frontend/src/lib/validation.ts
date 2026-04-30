import type {
  CashMovementPayload,
  CreateFairLocationPayload,
  CreateEmployeePayload,
  CreateEmployeePaymentPayload,
  LoginPayload,
  RegisterPayload,
} from "./api";
import type { PeriodFilter } from "./date";

export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export function validateLogin(payload: LoginPayload) {
  const errors: FieldErrors<"email" | "password"> = {};

  if (!payload.email.trim()) {
    errors.email = "Informe o email para entrar.";
  } else if (!isValidEmail(payload.email)) {
    errors.email = "Use um email valido, como nome@exemplo.com.";
  }

  if (!payload.password.trim()) {
    errors.password = "Informe a senha para continuar.";
  }

  return errors;
}

export function validateRegister(payload: RegisterPayload) {
  const errors: FieldErrors<"fullName" | "email" | "password"> = {};

  if (!payload.fullName.trim()) {
    errors.fullName = "Informe o nome do responsavel pela conta.";
  } else if (payload.fullName.trim().length < 3) {
    errors.fullName = "Use pelo menos 3 caracteres no nome.";
  }

  if (!payload.email.trim()) {
    errors.email = "Informe o email para criar o acesso.";
  } else if (!isValidEmail(payload.email)) {
    errors.email = "Use um email valido, como nome@exemplo.com.";
  }

  if (!payload.password.trim()) {
    errors.password = "Informe uma senha para proteger a conta.";
  } else if (payload.password.trim().length < 8) {
    errors.password = "Use pelo menos 8 caracteres na senha.";
  }

  return errors;
}

export function validateCashMovement(payload: CashMovementPayload) {
  const errors: FieldErrors<"description" | "amount" | "occurredOn"> = {};

  if (!payload.description.trim()) {
    errors.description = "Descreva o que entrou ou saiu do caixa.";
  } else if (payload.description.trim().length < 3) {
    errors.description = "Use pelo menos 3 caracteres na descricao.";
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.amount = "Informe um valor maior que zero.";
  }

  if (!payload.occurredOn) {
    errors.occurredOn = "Selecione a data da movimentacao.";
  }

  return errors;
}

export function validatePeriodFilter(period: PeriodFilter) {
  if (!period.startDate || !period.endDate) {
    return "Informe inicio e fim para consultar o periodo.";
  }

  if (period.startDate > period.endDate) {
    return "A data final precisa ser igual ou posterior a data inicial.";
  }

  return null;
}

export function validateEmployee(payload: CreateEmployeePayload) {
  const errors: FieldErrors<"name" | "defaultDailyRate" | "status"> = {};

  if (!payload.name.trim()) {
    errors.name = "Informe o nome do funcionario.";
  } else if (payload.name.trim().length < 3) {
    errors.name = "Use pelo menos 3 caracteres no nome.";
  }

  if (payload.defaultDailyRate !== undefined) {
    if (!Number.isFinite(payload.defaultDailyRate) || payload.defaultDailyRate <= 0) {
      errors.defaultDailyRate = "Use uma diaria maior que zero ou deixe em branco.";
    }
  }

  if (!payload.status) {
    errors.status = "Selecione um status valido.";
  }

  return errors;
}

export function validateEmployeePayment(payload: CreateEmployeePaymentPayload) {
  const errors: FieldErrors<"employeeId" | "amount" | "paidOn"> = {};

  if (!payload.employeeId.trim()) {
    errors.employeeId = "Selecione quem recebeu o pagamento.";
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.amount = "Informe um valor maior que zero.";
  }

  if (!payload.paidOn) {
    errors.paidOn = "Selecione a data do pagamento.";
  }

  return errors;
}

export function validateFairLocation(payload: CreateFairLocationPayload) {
  const errors: FieldErrors<"city" | "name" | "operatingDays" | "state"> = {};

  if (!payload.name.trim()) {
    errors.name = "Informe o nome do local da feira.";
  } else if (payload.name.trim().length < 3) {
    errors.name = "Use pelo menos 3 caracteres no nome do local.";
  }

  if (!payload.city.trim()) {
    errors.city = "Informe a cidade do local.";
  } else if (payload.city.trim().length < 2) {
    errors.city = "Use pelo menos 2 caracteres na cidade.";
  }

  if (!payload.state.trim()) {
    errors.state = "Informe o estado do local.";
  } else if (payload.state.trim().length < 2) {
    errors.state = "Use a sigla ou nome do estado com pelo menos 2 caracteres.";
  }

  if (payload.operatingDays.length === 0) {
    errors.operatingDays = "Selecione pelo menos um dia operacional.";
  }

  return errors;
}

export function hasFieldErrors<TField extends string>(errors: FieldErrors<TField>) {
  return Object.values(errors).some(Boolean);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
