export type Exso = {
  id: string;
  type: string;
  weight: "quiet" | "present" | "held";
  identity: "named" | "anonymous";
  senderName?: string;
  receiverName?: string;
  letterText?: string;
  showLetterOnEnd?: boolean;
  text: string[];
  video: string;
  audio: string;
  createdAt: number;
  replyToExsoId?: string;
  openedAt?: number;
  refundedAt?: number;
};
