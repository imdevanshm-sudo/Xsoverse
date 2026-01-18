import replyExso from "../content/exso/reply.json";
import thinkingOfYouExso from "../content/exso/thinking-of-you.json";

const EXSO_TEXT_REGISTRY = {
  thinking_of_you: thinkingOfYouExso,
  reply_exso: replyExso,
};

export function loadExsoText(exsoType: string) {
  const registryEntry =
    EXSO_TEXT_REGISTRY[exsoType as keyof typeof EXSO_TEXT_REGISTRY] ?? null;
  if (!registryEntry) {
    throw new Error(`Unknown exso type: ${exsoType}`);
  }
  return registryEntry;
}
