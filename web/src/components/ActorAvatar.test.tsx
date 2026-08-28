import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActorAvatar, resolveAvatarUrlForHost } from "./ActorAvatar";
import type { ActorIdentity } from "../types";

const agent = (id: string, name: string, avatarUrl: string | null): ActorIdentity => ({
  type: "agent",
  id,
  name,
  avatarUrl,
});

function imageSrcOf(container: HTMLElement) {
  return container.querySelector("img")?.getAttribute("src") ?? null;
}

describe("resolveAvatarUrlForHost", () => {
  it("replaces a loopback host with the page host so LAN devices can load avatars", () => {
    expect(resolveAvatarUrlForHost("http://127.0.0.1:47823/avatar.png", "192.168.1.5"))
      .toBe("http://192.168.1.5:47823/avatar.png");
    expect(resolveAvatarUrlForHost("http://localhost:47823/avatar.png", "192.168.1.5"))
      .toBe("http://192.168.1.5:47823/avatar.png");
  });

  it("leaves non-loopback hosts untouched", () => {
    expect(resolveAvatarUrlForHost("http://10.0.0.2:9000/a.png", "192.168.1.5"))
      .toBe("http://10.0.0.2:9000/a.png");
  });

  it("leaves loopback host untouched when the page itself is loopback", () => {
    expect(resolveAvatarUrlForHost("http://127.0.0.1:9000/a.png", "127.0.0.1"))
      .toBe("http://127.0.0.1:9000/a.png");
  });
});

describe("ActorAvatar", () => {
  it("renders a custom avatar URL for agents", () => {
    const { container } = render(
      <ActorAvatar actor={agent("zcode-agent", "ZCode Agent", "https://example.com/a.png")} />,
    );
    expect(imageSrcOf(container)).toBe("https://example.com/a.png");
  });

  it("keeps the Codex logo as fallback for the Codex Agent", () => {
    const { container } = render(<ActorAvatar actor={agent("codex-agent", "Codex Agent", null)} />);
    expect(imageSrcOf(container)).toBe("codex-agent-logo.png");
  });

  it("shows the ZCode logo for the ZCode Agent without an avatar URL", () => {
    const { container } = render(<ActorAvatar actor={agent("zcode-agent", "ZCode Agent", null)} />);
    expect(imageSrcOf(container)).toBe("zcode-logo.png");
  });

  it("shows an initial instead of the Codex logo for other agents", () => {
    const { container } = render(<ActorAvatar actor={agent("claude-code", "Claude Code", null)} />);
    expect(imageSrcOf(container)).toBeNull();
    expect(container.textContent).toBe("C");
  });

  it("uses the page host when the avatar URL points at loopback", () => {
    vi.stubGlobal("window", { location: { hostname: "192.168.1.5" } });
    const { container } = render(
      <ActorAvatar actor={agent("zcode-agent", "ZCode Agent", "http://127.0.0.1:47823/a.png")} />,
    );
    expect(imageSrcOf(container)).toBe("http://192.168.1.5:47823/a.png");
    vi.unstubAllGlobals();
  });
});
