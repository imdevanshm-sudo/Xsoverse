"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getExso } from '../../../lib/exsoStore';

export default function ExsoPlayer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const exsoId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);
  const lastRenderBucketRef = useRef(0);
  const elapsedRef = useRef(0);
  const isHoldActiveRef = useRef(false);
  const isTouchingRef = useRef(false);
  const isFinalLineRef = useRef(false);
  const restoreKeyRef = useRef<string | null>(null);
  const lastSavedElapsedRef = useRef(0);
  const hasFinishedOnceRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [exso, setExso] = useState<ReturnType<typeof getExso> | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinalLine, setIsFinalLine] = useState(false);
  const [hasFinishedOnce, setHasFinishedOnce] = useState(false);
  const [canReply, setCanReply] = useState(false);

  useEffect(() => {
    if (!exsoId) return;
    const stored = getExso(exsoId);
    if (stored) {
      setExso(stored);
      return;
    }
    const payload = searchParams.get('d');
    if (!payload) return;
    try {
      const decoded = decodeURIComponent(payload);
      const parsed = JSON.parse(decodeURIComponent(escape(atob(decoded))));
      setExso(parsed);
    } catch {
    }
  }, [exsoId]);

  // dissolve/crossfade effect removed per request

  const textSequence = useMemo(() => {
    const lines = exso?.text ?? [];
    if (!lines.length) return [];
    const startOffsetMs = 800;
    const fadeInMs = 1500;
    const holdMs = 9000;
    const fadeOutMs = 1200;
    const lineDurationMs = fadeInMs + holdMs + fadeOutMs;
    const overlapMs = 900;
    const pauseAfterSecondMs = 3000;
    const pauseBeforeFinalMs = 3000;

    let startMs = startOffsetMs;
    return lines.map((text, index) => {
      const fadeInEnd = startMs + fadeInMs;
      const holdEnd = fadeInEnd + holdMs;
      const fadeOutEnd = holdEnd + fadeOutMs;

      let gapMs = 0;
      if (index === 0) {
        gapMs = -overlapMs;
      } else if (index === 1) {
        gapMs = pauseAfterSecondMs;
      } else if (index === lines.length - 2) {
        gapMs = pauseBeforeFinalMs;
      }

      const entry = { text, startMs, fadeInEnd, holdEnd, fadeOutEnd };
      startMs = startMs + lineDurationMs + gapMs;
      return entry;
    });
  }, [exso]);

  const finalLineAt = useMemo(() => {
    const lastEntry = textSequence[textSequence.length - 1];
    return lastEntry ? lastEntry.fadeInEnd : 0;
  }, [textSequence]);

  const opacityCap = useMemo(() => {
    switch (exso?.weight) {
      case 'quiet':
        return 0.85;
      case 'present':
        return 0.92;
      case 'held':
        return 1;
      default:
        return 1;
    }
  }, [exso?.weight]);

  useEffect(() => {
    if (!exso || !exsoId) return;
    const progressKey = `exsoProgress:${exsoId}`;
    if (restoreKeyRef.current === progressKey) return;
    restoreKeyRef.current = progressKey;

    let restoredElapsed = 0;
    let restoredFinal = false;
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(progressKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { elapsedMs?: number; isFinalLine?: boolean };
          restoredElapsed = Math.max(0, parsed.elapsedMs ?? 0);
          restoredFinal = Boolean(parsed.isFinalLine);
        } catch {
        }
      }
    }

    const clampedElapsed = finalLineAt > 0 ? Math.min(restoredElapsed, finalLineAt) : restoredElapsed;
    const reachedFinal = restoredFinal || (finalLineAt > 0 && clampedElapsed >= finalLineAt);

    setHasStarted(true);
    setElapsedMs(clampedElapsed);
    elapsedRef.current = clampedElapsed;
    lastSavedElapsedRef.current = clampedElapsed;
    startTimeRef.current = performance.now() - clampedElapsed;
    setIsFinalLine(reachedFinal);
    isFinalLineRef.current = reachedFinal;
    setIsPaused(false);
  }, [exso, exsoId, finalLineAt]);

  const eased = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t: number) => Math.pow(t, 3);

  const lineStyles = useMemo(() => {
    if (!textSequence.length) return [];
    return textSequence.map((entry) => {
      const { startMs, fadeInEnd, holdEnd, fadeOutEnd } = entry;
      if (elapsedMs < startMs || elapsedMs > fadeOutEnd) {
        return { opacity: 0 };
      }
      if (elapsedMs <= fadeInEnd) {
        const t = (elapsedMs - startMs) / (fadeInEnd - startMs);
        const ease = eased(Math.max(0, Math.min(1, t)));
        return { opacity: ease * opacityCap };
      }
      if (elapsedMs <= holdEnd) {
        return { opacity: opacityCap };
      }
      const t = (elapsedMs - holdEnd) / (fadeOutEnd - holdEnd);
      const ease = easeIn(Math.max(0, Math.min(1, t)));
      return { opacity: opacityCap * (1 - ease) };
    });
  }, [elapsedMs, textSequence, opacityCap]);


  useEffect(() => {
    if (!hasStarted || isPaused || isFinalLine) {
      return;
    }

    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const nextElapsed = timestamp - startTimeRef.current;
      elapsedRef.current = nextElapsed;
      if (finalLineAt > 0 && nextElapsed >= finalLineAt) {
        setElapsedMs(finalLineAt);
        elapsedRef.current = finalLineAt;
        setIsFinalLine(true);
        return;
      }
      const bucket = Math.floor(nextElapsed / 50);
      if (bucket !== lastRenderBucketRef.current) {
        lastRenderBucketRef.current = bucket;
        setElapsedMs(nextElapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hasStarted, isPaused, isFinalLine, finalLineAt]);

  useEffect(() => {
    isFinalLineRef.current = isFinalLine;
  }, [isFinalLine]);

  useEffect(() => {
    if (!isFinalLine) {
      return;
    }
    if (hasFinishedOnceRef.current) return;
    hasFinishedOnceRef.current = true;
    setHasFinishedOnce(true);
  }, [isFinalLine]);

  useEffect(() => {
    if (!isFinalLine || !hasFinishedOnce) {
      setCanReply(false);
      return;
    }
    const t = window.setTimeout(() => {
      setCanReply(true);
    }, 6000);
    return () => {
      window.clearTimeout(t);
    };
  }, [isFinalLine, hasFinishedOnce]);

  useEffect(() => {
    if (!hasStarted || !exsoId || typeof window === 'undefined') return;
    const progressKey = `exsoProgress:${exsoId}`;
    const nextElapsed = Math.max(0, elapsedMs);
    if (isFinalLine) {
      window.localStorage.setItem(
        progressKey,
        JSON.stringify({ elapsedMs: finalLineAt || nextElapsed, isFinalLine: true })
      );
      lastSavedElapsedRef.current = nextElapsed;
      return;
    }
    if (nextElapsed - lastSavedElapsedRef.current < 1000) return;
    window.localStorage.setItem(
      progressKey,
      JSON.stringify({ elapsedMs: nextElapsed, isFinalLine: false })
    );
    lastSavedElapsedRef.current = nextElapsed;
  }, [elapsedMs, isFinalLine, hasStarted, exsoId, finalLineAt]);


  useEffect(() => {
    if (!hasStarted) return;
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.muted = true;
      audioEl.play().then(() => {
        audioEl.muted = false;
      }).catch(() => {});
    }
  }, [hasStarted, exso]);

  const pauseAudio = () => {
    const audioEl = audioRef.current;
    if (audioEl && !audioEl.paused) {
      audioEl.pause();
    }
  };

  const resumeAudio = () => {
    const audioEl = audioRef.current;
    if (audioEl && audioEl.paused) {
      audioEl.play().catch(() => {});
    }
  };

  const pauseVideo = () => {
    const videoEl = videoRef.current;
    if (videoEl && !videoEl.paused) {
      videoEl.pause();
    }
  };

  const resumeVideo = () => {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.paused) {
      videoEl.play().catch(() => {});
    }
  };

  const handleReplyIntent = () => {
    if (!exso) return;
    router.push(`/xso/quiet?replyTo=${exso.id}`);
  };

  const startHold = () => {
    if (isFinalLineRef.current) return;
    if (isHoldActiveRef.current) return;
    isHoldActiveRef.current = true;
    if (isFinalLineRef.current) {
      pauseAudio();
      return;
    }
    setIsPaused(true);
    pauseAudio();
    pauseVideo();
  };

  const endHold = () => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isFinalLineRef.current) return;
    if (!isHoldActiveRef.current) return;
    isHoldActiveRef.current = false;
    if (isFinalLineRef.current) {
      resumeAudio();
      return;
    }
    setIsPaused(false);
    resumeAudio();
    resumeVideo();
    startTimeRef.current = performance.now() - elapsedRef.current;
  };

  const scheduleHold = () => {
    if (isFinalLineRef.current) return;
    if (holdTimeoutRef.current || isHoldActiveRef.current) return;
    holdTimeoutRef.current = window.setTimeout(() => {
      holdTimeoutRef.current = null;
      startHold();
    }, 150);
  };

  const holdOpacityMultiplier =
    isPaused && !isFinalLine
      ? Math.max(0, (opacityCap - 0.05) / Math.max(opacityCap, 0.05))
      : 1;

  return (
    <div
      className="fixed inset-0 overflow-hidden text-white"
      onMouseDown={(event) => {
        if (isTouchingRef.current) return;
        event.preventDefault();
        scheduleHold();
      }}
      onMouseUp={() => {
        if (isTouchingRef.current) return;
        endHold();
      }}
      onMouseLeave={() => {
        if (isTouchingRef.current) return;
        endHold();
      }}
      onTouchStart={(event) => {
        isTouchingRef.current = true;
        event.preventDefault();
        scheduleHold();
      }}
      onTouchEnd={() => {
        endHold();
        window.setTimeout(() => {
          isTouchingRef.current = false;
        }, 0);
      }}
      onTouchCancel={() => {
        endHold();
        window.setTimeout(() => {
          isTouchingRef.current = false;
        }, 0);
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#0E0F10' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(0, 0, 0, 0) 62%, rgba(0, 0, 0, 0.05) 100%)',
        }}
      />
      {exso?.video ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={exso.video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      ) : null}

      <div
        className="relative z-10 flex h-full w-full items-center justify-center px-8 text-center"
        style={
          isPaused && !isFinalLine
            ? { opacity: holdOpacityMultiplier }
            : { opacity: 1 }
        }
      >
        <div className="flex w-full max-w-2xl flex-col items-center gap-4">
          {exso?.identity === "named" && exso.senderName ? (
            <p className="text-xs font-light opacity-50">
              From {exso.senderName}
            </p>
          ) : null}
          {textSequence.map((entry, index) => {
            const style = lineStyles[index];
            if (!style || style.opacity <= 0.01) return null;
            return (
              <p
                key={`${entry.text}-${index}`}
                className="text-xl font-light leading-[1.75] transition-opacity duration-[1400ms]"
                style={{
                  opacity: style.opacity,
                  textShadow: '0 12px 28px rgba(0, 0, 0, 0.28)',
                }}
              >
                {entry.text}
              </p>
            );
          })}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={exso?.audio || undefined}
        loop
        preload="metadata"
        style={{ display: 'none' }}
      />
      {canReply && (
        <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleReplyIntent();
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            onTouchStart={(event) => {
              event.stopPropagation();
            }}
            className="text-xs opacity-30 transition-opacity hover:opacity-60 pointer-events-auto"
          >
            Respond with an Exso
          </button>
          <span className="text-[10px] opacity-20">
            Replies are created as their own Exso.
          </span>
        </div>
      )}
    </div>
  );
}
