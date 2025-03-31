export interface ParsedExpense {
  amount: number;
  description: string;
}

export function parseExpense(text: string): ParsedExpense | null {
  // Убираем лишние пробелы и приводим к нижнему регистру
  const cleanText = text.trim().toLowerCase();

  // Находим число (включая отрицательные) в строке
  const numberMatch = cleanText.match(/-?\d+/);
  if (!numberMatch) return null;

  const amount = parseInt(numberMatch[0]);
  // Проверяем, что сумма положительная
  if (isNaN(amount) || amount <= 0) return null;

  // Получаем описание, убирая сумму и лишние пробелы
  let description = cleanText
    .replace(numberMatch[0], "") // убираем сумму
    .replace(/\s+/g, " ") // убираем лишние пробелы
    .replace(/-/g, "") // убираем оставшиеся минусы
    .trim();

  // Если описание пустое
  if (!description) {
    description = "без описания";
  }

  return {
    amount,
    description,
  };
}
