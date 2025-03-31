import { parseExpense } from "./parser";

describe("parseExpense", () => {
  test("parses normal format: amount first", () => {
    expect(parseExpense("2000 продукты")).toEqual({
      amount: 2000,
      description: "продукты",
    });
  });

  test("parses amount last", () => {
    expect(parseExpense("продукты 2000")).toEqual({
      amount: 2000,
      description: "продукты",
    });
  });

  test("parses amount in the middle", () => {
    expect(parseExpense("купил 2000 продукты")).toEqual({
      amount: 2000,
      description: "купил продукты",
    });
  });

  test("handles multiple words in description", () => {
    expect(parseExpense("2000 продукты в магазине")).toEqual({
      amount: 2000,
      description: "продукты в магазине",
    });
  });

  test("handles only amount", () => {
    expect(parseExpense("2000")).toEqual({
      amount: 2000,
      description: "без описания",
    });
  });

  test("handles extra spaces", () => {
    expect(parseExpense("  2000    продукты   рэми  ")).toEqual({
      amount: 2000,
      description: "продукты рэми",
    });
  });

  test("returns null for invalid input", () => {
    expect(parseExpense("продукты")).toBeNull();
    expect(parseExpense("")).toBeNull();
    expect(parseExpense("0 продукты")).toBeNull();
    expect(parseExpense("-100 продукты")).toBeNull();
  });

  describe("invalid inputs", () => {
    test.each([
      ["продукты"],
      [""],
      ["0 продукты"],
      ["-100 продукты"],
      ["продукты -100"],
      ["купил -100 продукты"],
      ["-0 продукты"],
      ["- продукты"],
    ])("returns null for invalid input: %s", (input) => {
      expect(parseExpense(input)).toBeNull();
    });
  });

  describe("valid inputs", () => {
    test.each([
      ["100 продукты", { amount: 100, description: "продукты" }],
      ["продукты 100", { amount: 100, description: "продукты" }],
      ["купил 100 продукты", { amount: 100, description: "купил продукты" }],
      ["100", { amount: 100, description: "без описания" }],
    ])("correctly parses: %s", (input, expected) => {
      expect(parseExpense(input)).toEqual(expected);
    });
  });
});
