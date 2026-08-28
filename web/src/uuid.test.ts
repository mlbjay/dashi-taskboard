import { describe, expect, it, vi, afterEach } from "vitest";
import { randomUuid } from "./uuid";

describe("randomUuid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns crypto.randomUUID in a secure context", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "secure-context-uuid" });
    expect(randomUuid()).toBe("secure-context-uuid");
  });

  it("falls back to a hand-rolled UUID v4 without crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (array: Uint8Array) => {
        for (let index = 0; index < array.length; index += 1) array[index] = index;
        return array;
      },
    });
    const value = randomUuid();
    expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("produces distinct values across calls in the fallback path", () => {
    let counter = 0;
    vi.stubGlobal("crypto", {
      getRandomValues: (array: Uint8Array) => {
        for (let index = 0; index < array.length; index += 1) array[index] = counter + index;
        counter += array.length;
        return array;
      },
    });
    expect(randomUuid()).not.toBe(randomUuid());
  });
});
