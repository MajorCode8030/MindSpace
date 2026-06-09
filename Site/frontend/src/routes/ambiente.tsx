import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, Volume2, VolumeX, Pause, Play, Home, RotateCcw, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SESSION_CONTEXT_STORAGE_KEY } from "@/lib/patient-session";
import { FlowBreadcrumb } from "@/components/FlowBreadcrumb";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { FLOW_BREADCRUMB_ITEMS } from "@/lib/flow-breadcrumb";

const SESSION_TARGET_SECONDS = 20 * 60;

export const Route = createFileRoute("/ambiente")({
  head: () => ({ meta: [{ title: "Ambiente Terapêutico — MindSpace" }] }),
  component: Ambiente,
});

function Ambiente() {
  const navigate = useNavigate();
  const [pacienteSessao, setPacienteSessao] = useState<{ nome: string; idade: number } | null>(null);
  const environmentOptions = useMemo(() => ["Sessão individual", "Anfiteatro", "Floresta"], []);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environmentOptions[0]);
  const [isEnvironmentDropdownOpen, setIsEnvironmentDropdownOpen] = useState(false);
  const phases = useMemo(
    () => [
      { key: "inspire", label: "Inspire", hint: "pelo nariz", seconds: 4 },
      { key: "hold", label: "Segure", hint: "a respiração", seconds: 7 },
      { key: "expire", label: "Expire", hint: "pela boca com som de sopro", seconds: 8 },
    ],
    [],
  );

  const totalSeconds = useMemo(() => phases.reduce((sum, phase) => sum + phase.seconds, 0), [phases]);
  const [cycleTime, setCycleTime] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousPhaseRef = useRef<string | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_CONTEXT_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { nome?: string; idade?: number };
      if (parsed.nome && typeof parsed.idade === "number") {
        setPacienteSessao({ nome: parsed.nome, idade: parsed.idade });
      }
    } catch {
      setPacienteSessao(null);
    }
  }, []);

  useEffect(() => {
    let rafId = 0;

    const tick = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = timestamp;

      if (isRunning) {
        setCycleTime((time) => (time + deltaSeconds) % totalSeconds);
      }

      if (isStopwatchRunning) {
        setSessionElapsed((time) => time + deltaSeconds);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      lastFrameTimeRef.current = null;
    };
  }, [isRunning, isStopwatchRunning, totalSeconds]);

  const playCue = useCallback((frequency: number) => {
    if (!audioEnabled || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  }, [audioEnabled]);

  const breathing = useMemo(() => {
    let offset = 0;

    for (const phase of phases) {
      const end = offset + phase.seconds;
      if (cycleTime < end) {
        const phaseElapsed = cycleTime - offset;
        const phaseProgress = phaseElapsed / phase.seconds;
        const easedProgress = phaseProgress * phaseProgress * (3 - 2 * phaseProgress);
        const remaining = Math.max(1, Math.ceil(phase.seconds - phaseElapsed));

        let scale = 1;
        let intensity = 0;
        if (phase.key === "inspire") {
          scale = 0.9 + 0.45 * easedProgress;
          intensity = easedProgress;
        } else if (phase.key === "hold") {
          scale = 1.35;
          intensity = 1;
        } else {
          scale = 1.35 - 0.45 * easedProgress;
          intensity = 1 - easedProgress;
        }

        return {
          phase,
          remaining,
          scale,
          intensity,
        };
      }
      offset = end;
    }

    return {
      phase: phases[0],
      remaining: phases[0].seconds,
      scale: 1,
      intensity: 0,
    };
  }, [cycleTime, phases]);

  const sessionDisplay = useMemo(() => {
    const total = Math.floor(sessionElapsed);
    const minutes = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (total % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [sessionElapsed]);

  const sessionProgress = useMemo(() => {
    return Math.min(100, (sessionElapsed / SESSION_TARGET_SECONDS) * 100);
  }, [sessionElapsed]);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    const currentPhase = breathing.phase.key;

    if (!previousPhase) {
      previousPhaseRef.current = currentPhase;
      return;
    }

    if (previousPhase !== currentPhase) {
      const phaseFrequency: Record<string, number> = {
        inspire: 528,
        hold: 440,
        expire: 392,
      };

      playCue(phaseFrequency[currentPhase] ?? 440);
      previousPhaseRef.current = currentPhase;
    }
  }, [breathing.phase.key, playCue]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  const toggleAudio = async () => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      audioContextRef.current = new window.AudioContext();
    }

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    setAudioEnabled((enabled) => !enabled);
  };

  const startExercise = () => {
    setIsRunning(true);
  };

  const pauseExercise = () => {
    setIsRunning(false);
  };

  const resetExercise = () => {
    setIsRunning(false);
    setCycleTime(0);
    previousPhaseRef.current = null;
    lastFrameTimeRef.current = null;
  };

  const startStopwatch = () => {
    setIsStopwatchRunning(true);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setSessionElapsed(0);
  };

  const pauseSafe = () => {
    setIsStopwatchRunning(false);
    setIsRunning(false);
  };

  const handleExitSession = () => {
    setIsExitDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="Vídeo de céu azul em background"
        >
          <source src="/ceu_azul.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60" />

        {/* Top bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-white">
            <Clock className="h-4 w-4" />
            <div>
              <div className="text-[10px] uppercase opacity-70">Sessão em andamento</div>
              <div className="font-mono font-bold text-lg">{sessionDisplay}</div>
              <div className="mt-1 h-1.5 w-44 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-300/80" style={{ width: `${sessionProgress}%` }} />
              </div>
              {pacienteSessao && (
                <div className="text-[11px] opacity-75">{pacienteSessao.nome} • {pacienteSessao.idade} anos</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleExitSession}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-5 py-2.5 text-white text-sm hover:bg-white/20 transition"
          >
            Sair da sessão
          </button>
        </div>

        <div className="absolute top-24 left-6 right-6">
          <FlowBreadcrumb items={FLOW_BREADCRUMB_ITEMS} />
        </div>

        {/* Exercise card */}
        <div className="absolute top-1/3 left-6 w-[24rem] min-h-120 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
          <div className="text-xs uppercase tracking-wider opacity-70">Exercício atual</div>
          <h2 className="text-2xl font-bold mt-1">Respiração Consciente</h2>
          <p className="text-sm opacity-80 mt-2">Técnica 4-7-8: {isRunning ? "siga o ritmo guiado" : "clique em Play para iniciar"}</p>
          <div className="mt-6 relative h-28 w-28 mx-auto">
            <div
              className="absolute inset-0 rounded-full bg-gradient-calm"
              style={{
                transform: `scale(${breathing.scale})`,
                transformOrigin: "center",
                opacity: 0.45 + breathing.intensity * 0.5,
                boxShadow: `0 0 ${14 + breathing.intensity * 26}px rgba(110, 231, 183, ${0.25 + breathing.intensity * 0.45})`,
              }}
            />
            <div
              className="absolute inset-2 rounded-full border-2"
              style={{
                borderColor: `rgba(255,255,255,${0.28 + breathing.intensity * 0.4})`,
              }}
            />
          </div>
          <div className="mt-5 rounded-xl border border-white/20 bg-black/20 px-3 py-2.5 min-h-29">
            <div className="text-[11px] uppercase tracking-wider opacity-70">Fase atual</div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div>
                <div className="text-base font-semibold">
                  {breathing.phase.label} <span className="opacity-80">{breathing.phase.hint}</span>
                </div>
                <div className="text-xs opacity-75">{breathing.phase.seconds}s nesta etapa</div>
              </div>
              <div className="font-mono text-2xl leading-none">{breathing.remaining}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={startExercise}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/30 border border-emerald-300/60 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500/40 transition"
            >
              <Play className="h-4 w-4" /> Iniciar
            </button>
            <button
              type="button"
              onClick={pauseExercise}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 border border-white/25 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 transition"
            >
              <Pause className="h-4 w-4" /> Pausar
            </button>
            <button
              type="button"
              onClick={resetExercise}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 border border-white/25 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 transition"
            >
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>
        </div>

        {/* Environment card */}
        <div className="absolute top-1/3 right-6 w-80 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 text-white">
          <div className="text-xs uppercase tracking-wider opacity-70">Ambiente terapêutico</div>
          <h3 className="mt-1 text-lg font-semibold">Escolha um cenário</h3>

          <div className="mt-4 relative">
            <button
              type="button"
              onClick={() => setIsEnvironmentDropdownOpen((open) => !open)}
              className="w-full inline-flex items-center justify-between rounded-xl bg-black/25 border border-white/25 px-3 py-2.5 text-sm font-medium text-white hover:bg-black/35 transition"
              aria-haspopup="listbox"
              aria-expanded={isEnvironmentDropdownOpen}
            >
              <span>{selectedEnvironment}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isEnvironmentDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isEnvironmentDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/25 bg-black/70 p-2 backdrop-blur-md space-y-2">
                {environmentOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedEnvironment(option);
                      setIsEnvironmentDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition border ${
                      selectedEnvironment === option
                        ? "bg-emerald-500/30 border-emerald-300/60"
                        : "bg-white/10 border-white/15 hover:bg-white/20"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-3 text-xs opacity-80">
            Ambiente selecionado: <span className="font-semibold">{selectedEnvironment}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleAudio}
              type="button"
              className={`backdrop-blur-md border rounded-full grid place-items-center text-white transition h-12 w-12 ${
                audioEnabled
                  ? "bg-emerald-500/30 border-emerald-300/60 hover:bg-emerald-500/40"
                  : "bg-white/15 border-white/25 hover:bg-white/25"
              }`}
              aria-pressed={audioEnabled}
              aria-label={audioEnabled ? "Desativar áudio de respiração" : "Ativar áudio de respiração"}
            >
              {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <span className="text-[10px] text-white/80">Áudio {audioEnabled ? "ON" : "OFF"}</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={startStopwatch}
              className="backdrop-blur-md bg-white/15 border border-white/25 rounded-full grid place-items-center text-white hover:bg-white/25 transition h-16 w-16"
            >
              <Play className="h-6 w-6" />
            </button>
            <span className="text-[10px] text-white/80">Iniciar sessão</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={pauseSafe}
              className="backdrop-blur-md bg-white/15 border border-white/25 rounded-full grid place-items-center text-white hover:bg-white/25 transition h-16 w-16"
            >
              <Pause className="h-6 w-6" />
            </button>
            <span className="text-[10px] text-white/80">Pausa segura</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={resetStopwatch}
              className="backdrop-blur-md bg-white/15 border border-white/25 rounded-full grid place-items-center text-white hover:bg-white/25 transition h-16 w-16"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
            <span className="text-[10px] text-white/80">Reiniciar sessão</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Link
              to="/"
              className="backdrop-blur-md bg-white/15 border border-white/25 rounded-full grid place-items-center text-white hover:bg-white/25 transition h-12 w-12"
              aria-label="Voltar para a tela inicial"
            >
              <Home className="h-5 w-5" />
            </Link>
            <span className="text-[10px] text-white/80">Home</span>
          </div>
        </div>

        <ConfirmActionDialog
          open={isExitDialogOpen}
          onOpenChange={setIsExitDialogOpen}
          title="Encerrar sessão"
          description="Deseja encerrar a sessão agora e seguir para a etapa de encerramento clínico?"
          confirmLabel="Ir para encerramento"
          onConfirm={() => {
            setIsExitDialogOpen(false);
            navigate({ to: "/encerramento" });
          }}
        />
      </div>
    </div>
  );
}
