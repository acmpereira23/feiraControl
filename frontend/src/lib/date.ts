export type PeriodFilter = {
  startDate: string;
  endDate: string;
};

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentMonthPeriod(today = new Date()): PeriodFilter {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    startDate: formatDateInput(monthStart),
    endDate: formatDateInput(today),
  };
}

export function getTodayDate() {
  return formatDateInput(new Date());
}

export function isPeriodRangeInvalid(period: PeriodFilter) {
  if (!period.startDate || !period.endDate) {
    return false;
  }

  return period.startDate > period.endDate;
}

export function formatDisplayDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
