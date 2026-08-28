import type { ActorIdentity } from "../types";

// 特定 agent 的专属 logo 兜底;未列出的 agent 无头像时显示名字首字母。
const AGENT_FALLBACK_LOGOS: Record<string, string> = {
  "codex-agent": "codex-agent-logo.png",
  "zcode-agent": "zcode-logo.png",
  "claude-code": "claude-code-logo.png",
};

// 头像 URL 指向回环地址时,Lan 设备(手机等)会请求自身导致加载失败;
// 替换为当前页面 host 即可通过局域网访问到同一服务。
export function resolveAvatarUrlForHost(url: string, pageHostname: string): string {
  const parsed = new URL(url);
  if (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") {
    parsed.hostname = pageHostname;
  }
  return parsed.href;
}

export function ActorAvatar({
  actor,
  className = "",
}: {
  actor: ActorIdentity;
  className?: string;
}) {
  const avatarUrl = actor.avatarUrl
    ? resolveAvatarUrlForHost(actor.avatarUrl, window.location.hostname)
    : null;
  return (
    <span
      className={`actor-avatar actor-avatar-${actor.type}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      title={actor.name}
    >
      {actor.type === "agent" ? (
        avatarUrl ? (
          <img
            className="actor-avatar-image"
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
          />
        ) : AGENT_FALLBACK_LOGOS[actor.id] ? (
          <img
            className="actor-avatar-image actor-avatar-agent-image"
            src={AGENT_FALLBACK_LOGOS[actor.id]}
            alt=""
          />
        ) : (
          actor.name.slice(0, 1)
        )
      ) : avatarUrl ? (
        <img
          className="actor-avatar-image"
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
        />
      ) : actor.name.slice(0, 1)}
    </span>
  );
}
