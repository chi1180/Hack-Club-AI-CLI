import { test, expect, describe } from "bun:test";
import { AI } from "../lib/ai/ai";

/**
 * AI class methods test
 */
describe("AI class methods test", () => {
  const _AI = new AI();

  test("Each methods should be function", () => {
    expect(_AI._getModels).toBeFunction();
    expect(_AI._getStats).toBeFunction();
  });

  test("getModels function's response data should be the form of specific schema", async () => {
    const response = await _AI._getModels();
    expect(response).toBe
  }
});
