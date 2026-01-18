export type ExsoIdentity = "named" | "anonymous";
export type ExsoWeight = "quiet" | "present" | "held";
export type ExsoType = "thinking_of_you" | "reply_exso";

export interface ExsoDraft {
  type?: ExsoType;
  identity?: ExsoIdentity;
  weight?: ExsoWeight;
  context?: string;
  replyToExsoId?: string;
  senderName?: string;
}

export const exsoDraft: ExsoDraft = {};

export function resetExsoDraft() {
  delete exsoDraft.type;
  delete exsoDraft.identity;
  delete exsoDraft.weight;
  delete exsoDraft.context;
  delete exsoDraft.replyToExsoId;
}
