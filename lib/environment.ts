import type { ExsoWeight } from "./exsoFlow";

export const ENVIRONMENT: Record<
  ExsoWeight,
  { video: string; audio: [string, string] }
> = {
  quiet: {
    video: "/environment/quiet/video.mp4",
    audio: ["/environment/quiet/audio_1.mp3", "/environment/quiet/audio_2.mp3"],
  },
  present: {
    video: "/environment/present/video.mp4",
    audio: ["/environment/present/audio_1.mp3", "/environment/present/audio_2.mp3"],
  },
  held: {
    video: "/environment/held/video.mp4",
    audio: ["/environment/held/audio_1.mp3", "/environment/held/audio_2.mp3"],
  },
};
