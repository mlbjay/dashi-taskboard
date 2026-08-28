import type { ActorIdentity, AssigneeTarget } from "./types";

export const CODEX_AGENT_ACTOR: ActorIdentity = {
  type: "agent",
  id: "codex-agent",
  name: "Codex Agent",
  avatarUrl: null,
};

export function actorKey(actor: ActorIdentity): string {
  return `${actor.type}:${actor.id}`;
}

export function actorForAssigneeTarget(
  target: AssigneeTarget,
  currentUser: ActorIdentity,
): ActorIdentity {
  if (target === "codex-agent") return CODEX_AGENT_ACTOR;
  if (typeof target === "object") return target;
  return currentUser;
}

export function assigneeTargetForActor(
  actor: ActorIdentity,
  currentUser: ActorIdentity,
): AssigneeTarget | undefined {
  if (actor.type === "agent") {
    return actor.id === "codex-agent"
      ? "codex-agent"
      : { type: "agent", id: actor.id, name: actor.name, avatarUrl: actor.avatarUrl };
  }
  return actor.id === currentUser.id ? "current-user" : undefined;
}
