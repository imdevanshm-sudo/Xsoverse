import { ENVIRONMENT } from "./environment";
import type { ExsoDraft } from "./exsoFlow";
import type { Exso } from "./types";
import { loadExsoText } from "./loadExsoText";

export function createExso(draft: ExsoDraft): Exso {
  const registry = loadExsoText(draft.type!);
  const text = registry.variants[draft.weight!][draft.identity!];
  const env = ENVIRONMENT[draft.weight!];
  const audio = env.audio[Math.floor(Math.random() * env.audio.length)];
  const id = crypto.randomUUID();

  return {
    id,
    type: draft.type!,
    weight: draft.weight!,
    identity: draft.identity!,
    senderName: draft.senderName,
    receiverName: draft.receiverName,
    letterText: draft.context,
    showLetterOnEnd: Boolean(draft.showLetterOnEnd),
    replyToExsoId: draft.replyToExsoId,
    text,
    video: env.video,
    audio,
    createdAt: Date.now(),
    openedAt: undefined,
    refundedAt: undefined,
  };
}
