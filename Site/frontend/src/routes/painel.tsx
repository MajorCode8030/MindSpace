import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, FileText, Settings, LogOut, Maximize2, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SESSION_CONTEXT_STORAGE_KEY } from "@/lib/patient-session";
import { FlowBreadcrumb } from "@/components/FlowBreadcrumb";
import { FLOW_BREADCRUMB_ITEMS } from "@/lib/flow-breadcrumb";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel do Profissional — MindSpace" }] }),
  component: Painel,
});

const menu = [
  { icon: LayoutDashboard, label: "Painel", path: "/painel" },
  { icon: Users, label: "Prontuário", path: "/pacientes" },
  { icon: Sparkles, label: "Sessão ao vivo", path: "/ambiente" },
  { icon: FileText, label: "Encerramento", path: "/encerramento" },
  { icon: Settings, label: "Configurações" },
];

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm" role="group" aria-label={label}>
      <span className="w-24 text-muted-foreground flex items-center gap-2">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary relative">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-brand" style={{ width: `${value}%` }} />
        <div className="absolute -top-1.5 h-4 w-4 rounded-full bg-card border-2 border-primary shadow-card" style={{ left: `calc(${value}% - 8px)` }} />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </div>
      <span className="w-10 text-right text-xs text-muted-foreground">{value}%</span>
    </div>
  );
}

function Painel() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const videoRef = useRef<HTMLDivElement | null>(null);

  const [isConnected, setIsConnected] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [emotionScore, setEmotionScore] = useState(7);
  const [lighting, setLighting] = useState(60);
  const [sounds, setSounds] = useState(40);
  const [movement, setMovement] = useState(30);
  const [notes, setNotes] = useState("Paciente respondeu bem ao exercício de respiração. Reduzir estímulos sonoros ajudou na regulação.");
  const [isSaved, setIsSaved] = useState(true);
  const [evolutionPoints, setEvolutionPoints] = useState<number[]>([8, 7, 7, 6, 6, 5]);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(SESSION_CONTEXT_STORAGE_KEY);
    setHasActiveSession(Boolean(rawSession));
  }, []);

  useEffect(() => {
    const storedNotes = window.localStorage.getItem("mindspace-session-notes");
    if (storedNotes) {
      setNotes(storedNotes);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const interval = window.setInterval(() => {
      setEvolutionPoints((current) => {
        const last = current[current.length - 1] ?? 6;
        const next = Math.max(1, Math.min(10, last + (Math.random() > 0.5 ? 1 : -1)));
        const updated = [...current, next];
        return updated.slice(-8);
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isConnected]);

  const emotionLevel = useMemo(() => {
    if (emotionScore >= 8) return "Muito alta";
    if (emotionScore >= 6) return "Alta";
    if (emotionScore >= 4) return "Moderada";
    return "Baixa";
  }, [emotionScore]);

  const emotionToneClass = useMemo(() => {
    if (emotionScore >= 8) return "text-red-300";
    if (emotionScore >= 6) return "text-destructive";
    if (emotionScore >= 4) return "text-amber-300";
    return "text-emerald-300";
  }, [emotionScore]);

  const evolutionPath = useMemo(() => {
    if (!evolutionPoints.length) return "";
    const step = evolutionPoints.length > 1 ? 200 / (evolutionPoints.length - 1) : 0;
    return evolutionPoints
      .map((point, index) => {
        const x = index * step;
        const y = 55 - point * 4;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [evolutionPoints]);

  const handleMenuAction = (path?: string) => {
    if (path) {
      navigate({ to: path });
    }
  };

  const isMenuActive = (path?: string) => {
    if (!path) return false;
    return pathname === path;
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      await videoRef.current.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  const saveNotes = () => {
    window.localStorage.setItem("mindspace-session-notes", notes);
    setIsSaved(true);
  };

  const toggleConnection = () => {
    setIsConnected((state) => !state);
  };

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.03_270)] text-white">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="bg-[oklch(0.22_0.04_270)] border-r border-white/10 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand grid place-items-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display font-bold">MindSpace</span>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-calm" />
              <div>
                <div className="text-xs opacity-60">Paciente</div>
                <div className="text-sm font-semibold">Maria Silva</div>
              </div>
            </div>
            <div className="mt-3 text-xs opacity-60">Idade: 28 anos</div>
          </div>

          <nav className="space-y-1 flex-1">
            {menu.map(({ icon: Icon, label, path }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleMenuAction(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  isMenuActive(path) ? "bg-gradient-brand text-white shadow-glow" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 transition"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </aside>

        {/* Main */}
        <main className="p-8">
          <div className="mb-3">
            <FlowBreadcrumb items={FLOW_BREADCRUMB_ITEMS} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Sessão ao vivo</h1>
              <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-success animate-pulse" : "bg-red-400"}`} />
                {isConnected ? "Conectado" : "Desconectado"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleConnection}
              className="rounded-xl border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
            >
              {isConnected ? "Simular queda" : "Reconectar"}
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/55">Próxima ação recomendada</div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-white/90">
                {hasActiveSession
                  ? "Você possui uma sessão ativa. Continue para manter a jornada sem interrupções."
                  : "Selecione um paciente no prontuário para iniciar uma nova sessão ao vivo."}
              </div>
              <button
                type="button"
                onClick={() => navigate({ to: hasActiveSession ? "/ambiente" : "/pacientes" })}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/50 bg-emerald-500/20 px-3 py-2 text-xs text-emerald-100 hover:bg-emerald-500/30 transition"
              >
                {hasActiveSession ? "Continuar sessão" : "Abrir prontuário"} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/pacientes" })}
              className="rounded-xl border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
            >
              Abrir prontuario
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/encerramento" })}
              className="rounded-xl border border-white/20 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
            >
              Encerrar sessao
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div ref={videoRef} className="rounded-3xl overflow-hidden relative aspect-video border border-white/10">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label="Vídeo de rio como background do card"
              >
                <source src="/rio.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20" />
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Sair da tela cheia" : "Ativar tela cheia"}
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-black/40 backdrop-blur grid place-items-center hover:bg-black/60 transition"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-xs opacity-60">Estado emocional</div>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <div className="text-sm">Ansiedade</div>
                    <div className={`${emotionToneClass} font-semibold`}>{emotionLevel}</div>
                  </div>
                  <div className="relative h-16 w-16">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="url(#g1)" strokeWidth="3" strokeDasharray={`${emotionScore * 10} 100`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="g1" x1="0" x2="1">
                          <stop offset="0%" stopColor="oklch(0.7 0.2 290)" />
                          <stop offset="100%" stopColor="oklch(0.65 0.22 30)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-xs font-bold">{emotionScore}/10</div>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={emotionScore}
                  onChange={(event) => setEmotionScore(Number(event.target.value))}
                  className="mt-3 h-1 w-full accent-white"
                  aria-label="Ajustar nível emocional"
                />
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-xs opacity-60 mb-3">Evolução na sessão</div>
                <svg viewBox="0 0 200 60" className="w-full h-16">
                  <path d={evolutionPath} fill="none" stroke="url(#g2)" strokeWidth="2.5" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="g2" x1="0" x2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.2 290)" />
                      <stop offset="100%" stopColor="oklch(0.78 0.12 200)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-between text-[10px] opacity-50 mt-1">
                  <span>Início</span>
                  <span>Agora</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mt-5">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="text-sm font-semibold mb-4">Controles do ambiente</div>
              <div className="space-y-4">
                <Slider label="☀️ Iluminação" value={lighting} onChange={setLighting} />
                <Slider label="🎵 Sons" value={sounds} onChange={setSounds} />
                <Slider label="〰️ Movimentos" value={movement} onChange={setMovement} />
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-sm font-semibold">Anotações da sessão</div>
                <button
                  type="button"
                  onClick={saveNotes}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
                >
                  Salvar
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setIsSaved(false);
                }}
                rows={5}
                className="w-full rounded-xl bg-black/20 border border-white/15 p-3 text-sm text-white/90 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Escreva observações da sessão..."
              />
              <p className="mt-2 text-xs text-white/60">{isSaved ? "Alterações salvas" : "Há alterações não salvas"}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
