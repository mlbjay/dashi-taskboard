import { afterEach, describe, expect, it, vi } from "vitest";
import { getJiraConnection } from "./api";

function fetchResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function stubFetch(response: Response) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

describe("getJiraConnection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats LOCAL_ONLY on a local endpoint as not configured instead of interrupting init", async () => {
    stubFetch(fetchResponse(403, {
      error: { code: "LOCAL_ONLY", message: "This endpoint is only available on this device" },
    }));
    const connection = await getJiraConnection();
    expect(connection.configured).toBe(false);
    expect(connection.projectId).toBe("jira-my-tasks");
  });

  it("keeps treating 404 as not configured", async () => {
    stubFetch(fetchResponse(404, {
      error: { code: "NOT_FOUND", message: "not found" },
    }));
    const connection = await getJiraConnection();
    expect(connection.configured).toBe(false);
  });

  it("still throws for unrelated server errors", async () => {
    stubFetch(fetchResponse(500, {
      error: { code: "INTERNAL_ERROR", message: "boom" },
    }));
    await expect(getJiraConnection()).rejects.toMatchObject({ status: 500, code: "INTERNAL_ERROR" });
  });
});
