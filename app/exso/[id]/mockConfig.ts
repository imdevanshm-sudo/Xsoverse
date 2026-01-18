export const mockExsoConfig = {
  background: {
    color: '#0E0F10',
    imageUrl: '',
  },
  video: {
    src: '/environment/quiet/video.mp4',
  },
  audio: {
    src: '/environment/quiet/audio_1.mp3',
    volume: 0.3,
  },
  textSequence: [
    { text: 'A quiet presence.', startMs: 500, durationMs: 2400 },
    { text: 'A soft light.', startMs: 3200, durationMs: 2400 },
    { text: 'An anchor.', startMs: 6000, durationMs: 2400 },
  ],
};

export type ExsoConfig = typeof mockExsoConfig;
