export function getDateFilter(period: "day" | "week" | "month"): string {
  const date = new Date();
  switch (period) {
    case "day":
      date.setHours(0, 0, 0, 0);
      break;
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
  }
  return date.toISOString();
}
