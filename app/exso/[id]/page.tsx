"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getExso } from '../../../lib/exsoStore';
import { isVerifiedPaid } from '../../../lib/paymentGate';
import { consumeShareToken, getShareTokenRecord } from '../../../lib/shareLink';

const END_LETTER_STORAGE_KEY = "xso:end-letter";

export default function ExsoPlayer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const exsoId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const shareToken = searchParams.get("k");
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
  const accessCheckRef = useRef<string | null>(null);
  const restoreKeyRef = useRef<string | null>(null);
  const lastSavedElapsedRef = useRef(0);
  const hasFinishedOnceRef = useRef(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [exso, setExso] = useState<ReturnType<typeof getExso> | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinalLine, setIsFinalLine] = useState(false);
  const [hasFinishedOnce, setHasFinishedOnce] = useState(false);
  const [canReply, setCanReply] = useState(false);
  const [needsAudioTap, setNeedsAudioTap] = useState(false);
  const [isExitPromptOpen, setIsExitPromptOpen] = useState(false);
  const [remainingOpens, setRemainingOpens] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!exsoId) return;
    const accessKey = `${exsoId}:${shareToken ?? "paid"}`;
    if (accessCheckRef.current === accessKey) return;
    accessCheckRef.current = accessKey;

    if (shareToken) {
      const consumed = consumeShareToken(shareToken, exsoId);
      if (!consumed.ok) {
        setHasAccess(false);
        setAccessError(
          consumed.reason === "exhausted"
            ? "This private link has already been opened twice."
            : "This private link is not valid."
        );
        return;
      }
      setHasAccess(true);
      setAccessError(null);
      return;
    }

    if (!isVerifiedPaid()) {
      setHasAccess(false);
      setAccessError(null);
      router.replace("/pricing");
      return;
    }
    setHasAccess(true);
    setAccessError(null);
  }, [router, exsoId, searchParams, shareToken]);

  useEffect(() => {
    if (!shareToken) {
      setRemainingOpens(null);
      return;
    }
    const refreshRemaining = () => {
      const next = getShareTokenRecord(shareToken)?.usesRemaining ?? 0;
      setRemainingOpens(next);
    };
    refreshRemaining();
    const intervalId = window.setInterval(refreshRemaining, 1000);
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "xso:share-links") return;
      refreshRemaining();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshRemaining();
      }
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [shareToken]);

  useEffect(() => {
    if (!hasAccess) return;
    if (!exsoId) return;
    let cancelled = false;

    const stored = getExso(exsoId);
    if (stored) {
      setExso(stored);
      return;
    }

    const loadRemoteExso = async () => {
      try {
        const response = await fetch(`/api/exso/${encodeURIComponent(exsoId)}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const parsed = await response.json();
        if (!cancelled) {
          setExso(parsed);
        }
      } catch {
      }
    };

    const payload = searchParams.get('d');
    if (!payload) {
      void loadRemoteExso();
      return () => {
        cancelled = true;
      };
    }
    try {
      const decoded = decodeURIComponent(payload);
      const parsed = JSON.parse(decodeURIComponent(escape(atob(decoded))));
      setExso(parsed);
    } catch {
      void loadRemoteExso();
    }
    return () => {
      cancelled = true;
    };
  }, [exsoId, hasAccess, searchParams]);

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
    if (!audioEl || !exso?.audio) return;
    audioEl.muted = true;
    audioEl.volume = 1;
    audioEl.play().then(() => {
      audioEl.muted = false;
      audioEl.volume = 1;
      setNeedsAudioTap(false);
    }).catch(() => {
      setNeedsAudioTap(true);
    });
  }, [hasStarted, exso, hasAccess]);

  const ensureAudioUnlocked = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.muted = false;
    audioEl.volume = 1;
    audioEl.play().then(() => {
      setNeedsAudioTap(false);
    }).catch(() => {
      setNeedsAudioTap(true);
    });
  };

  const pauseAudio = () => {
    const audioEl = audioRef.current;
    if (audioEl && !audioEl.paused) {
      audioEl.pause();
    }
  };

  const resumeAudio = () => {
    const audioEl = audioRef.current;
    if (audioEl && audioEl.paused) {
      audioEl.muted = false;
      audioEl.volume = 1;
      audioEl.play().then(() => {
        setNeedsAudioTap(false);
      }).catch(() => {
        setNeedsAudioTap(true);
      });
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
    const fallbackHref = `/xso/quiet?replyTo=${encodeURIComponent(exso.id)}`;
    if (!exso.showLetterOnEnd) {
      router.push(fallbackHref);
      return;
    }
    const closingLine = (exso.letterText ?? '').trim() || exso.text[exso.text.length - 1] || '';
    const letterData = {
      to: exso.receiverName?.trim() || 'You',
      from: exso.identity === 'named' && exso.senderName ? exso.senderName : 'Someone',
      closingLine,
      dedication: '',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(END_LETTER_STORAGE_KEY, JSON.stringify(letterData));
    }
    router.push(`/xso/end?mode=reply&replyTo=${encodeURIComponent(exso.id)}`);
  };

  const handleExitIntent = () => {
    if (!exso?.showLetterOnEnd) {
      router.push('/');
      return;
    }
    const closingLine = (exso.letterText ?? '').trim() || exso.text[exso.text.length - 1] || '';
    const letterData = {
      to: exso.receiverName?.trim() || 'You',
      from: exso.identity === 'named' && exso.senderName ? exso.senderName : 'Someone',
      closingLine,
      dedication: '',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(END_LETTER_STORAGE_KEY, JSON.stringify(letterData));
    }
    router.push('/xso/end?mode=exit');
  };

  const startHold = () => {
    if (isExitPromptOpen) return;
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
    if (isExitPromptOpen) return;
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
    if (isExitPromptOpen) return;
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

  const openExitPrompt = () => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    isHoldActiveRef.current = false;
    setIsPaused(true);
    pauseAudio();
    pauseVideo();
    setIsExitPromptOpen(true);
  };

  const closeExitPrompt = () => {
    setIsExitPromptOpen(false);
    if (isFinalLineRef.current) {
      resumeAudio();
      return;
    }
    setIsPaused(false);
    resumeAudio();
    resumeVideo();
    startTimeRef.current = performance.now() - elapsedRef.current;
  };

  if (hasAccess === false) {
    if (accessError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E0F10] px-6 text-center text-white">
          <div className="space-y-5">
            <p className="text-sm opacity-70">{accessError}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-md border border-white/30 px-4 py-2 text-xs tracking-wide opacity-80 transition-opacity hover:opacity-100"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0F10] text-white">
        <p className="text-sm opacity-70">Preparing...</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden text-white"
      onMouseDown={(event) => {
        if (isExitPromptOpen) return;
        if (isTouchingRef.current) return;
        ensureAudioUnlocked();
        event.preventDefault();
        scheduleHold();
      }}
      onMouseUp={() => {
        if (isExitPromptOpen) return;
        if (isTouchingRef.current) return;
        endHold();
      }}
      onMouseLeave={() => {
        if (isExitPromptOpen) return;
        if (isTouchingRef.current) return;
        endHold();
      }}
      onTouchStart={(event) => {
        if (isExitPromptOpen) return;
        isTouchingRef.current = true;
        ensureAudioUnlocked();
        event.preventDefault();
        scheduleHold();
      }}
      onTouchEnd={() => {
        if (isExitPromptOpen) return;
        endHold();
        window.setTimeout(() => {
          isTouchingRef.current = false;
        }, 0);
      }}
      onTouchCancel={() => {
        if (isExitPromptOpen) return;
        endHold();
        window.setTimeout(() => {
          isTouchingRef.current = false;
        }, 0);
      }}
    >
      <div className={`relative h-full w-full ${isExitPromptOpen ? "pointer-events-none blur-sm transition-all duration-300" : ""}`}>
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
          <div className="flex w-full max-w-2xl flex-col items-stretch gap-4">
            {exso?.identity === "named" && exso.senderName ? (
              <p className="w-full px-2 text-center text-xs font-light opacity-50">
                From {exso.senderName}
              </p>
            ) : null}
            {textSequence.map((entry, index) => {
              const style = lineStyles[index];
              if (!style || style.opacity <= 0.01) return null;
              return (
                <p
                  key={`${entry.text}-${index}`}
                  className="w-full px-2 sm:px-6 md:px-10 text-center text-xl font-light leading-[1.75] transition-opacity duration-[1400ms]"
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
        {needsAudioTap && (
          <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                ensureAudioUnlocked();
              }}
              className="rounded-md border border-white/30 bg-black/30 px-3 py-2 text-[11px] tracking-wide text-white/90 backdrop-blur-sm transition-opacity hover:opacity-100"
            >
              Tap to enable sound
            </button>
          </div>
        )}
        {hasFinishedOnce && (
          <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openExitPrompt();
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
              }}
              className="text-xs rounded-md border border-white/20 px-3 py-1.5 opacity-70 transition-opacity hover:opacity-100 pointer-events-auto"
            >
              Exit XSO
            </button>
            {canReply && (
              <>
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
                className="text-xs opacity-55 transition-opacity hover:opacity-90 pointer-events-auto"
                >
                  Reply with an XSO
                </button>
                <span className="text-[10px] opacity-35">
                  Replies are created as their own XSO.
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {isExitPromptOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#1f1b16]/35 px-6 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onTouchStart={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#d8d0c4] bg-[#f6f2ea]/95 p-6 text-left text-[#4b4a46] shadow-[0_24px_60px_rgba(34,28,21,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a8173]">Exit XSO</p>
            <h2 className="mt-3 text-xl font-medium text-[#3f3a33]">Playback paused</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5d5951]">
              Remaining real-time playback opens for this XSO link:{" "}
              <span className="font-medium text-[#3f3a33]">
                {remainingOpens === null ? "unlimited in this session" : remainingOpens}
              </span>
              .
            </p>
            <p className="mt-2 text-xs text-[#7d7568]">
              This count updates in real time while this XSO is active.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeExitPrompt}
                className="btn-secondary"
              >
                Continue XSO
              </button>
              <button
                type="button"
                onClick={handleExitIntent}
                className="btn-danger-soft"
              >
                Exit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
