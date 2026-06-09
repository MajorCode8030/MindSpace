import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Star, FileCheck2, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PATIENTS_STORAGE_KEY, SESSION_CONTEXT_STORAGE_KEY } from "@/lib/patient-session";
import { FlowBreadcrumb } from "@/components/FlowBreadcrumb";
import { StateNotice } from "@/components/StateNotice";
import { FLOW_BREADCRUMB_ITEMS } from "@/lib/flow-breadcrumb";

export const Route = createFileRoute("/encerramento")({
  head: () => ({ meta: [{ title: "Encerramento da Sessao — MindSpace" }] }),
  component: Encerramento,
});

function Encerramento() {
  const navigate = useNavigate();
  const [ansiedadeAntes] = useState(7);
  const [ansiedadeDepois, setAnsiedadeDepois] = useState(3);
  const [avaliacao, setAvaliacao] = useState(4);
  const [comentario, setComentario] = useState("Paciente relatou alivio da tensao ao final da sessao.");
  const [pacienteNome, setPacienteNome] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_CONTEXT_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { nome?: string };
      if (parsed.nome) {
        setPacienteNome(parsed.nome);
      }
    } catch {
      setPacienteNome(null);
    }
  }, []);

  const reducao = useMemo(() => {
    const delta = ansiedadeAntes - ansiedadeDepois;
    return delta > 0 ? delta : 0;
  }, [ansiedadeAntes, ansiedadeDepois]);

  const salvarEncerramentoNoProntuario = () => {
    setMensagemErro(null);

    const rawSessao = window.localStorage.getItem(SESSION_CONTEXT_STORAGE_KEY);
    if (!rawSessao) {
      setMensagemErro("Não foi possível identificar a sessão ativa. Volte ao prontuário para iniciar uma nova sessão.");
      return;
    }

    let contexto: { id?: string; sessaoId?: string } | null = null;
    try {
      contexto = JSON.parse(rawSessao) as { id?: string; sessaoId?: string };
    } catch {
      contexto = null;
    }

    if (!contexto?.id) {
      setMensagemErro("Contexto da sessão inválido. Reabra a sessão pelo prontuário.");
      return;
    }

    const rawPacientes = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!rawPacientes) {
      setMensagemErro("Base de pacientes não encontrada no momento.");
      return;
    }

    try {
      const pacientes = JSON.parse(rawPacientes) as Array<{
        id: string;
        sessoes?: Array<{ id: string; status: "aberta" | "encerrada"; dataFim?: string; observacoes?: string }>;
        encerramentos?: Array<{
          id: string;
          data: string;
          ansiedadeAntes: number;
          ansiedadeDepois: number;
          avaliacao: number;
          comentario: string;
        }>;
      }>;

      const atualizados = pacientes.map((paciente) => {
        if (paciente.id !== contexto?.id) return paciente;

        const agoraIso = new Date().toISOString();
        const encerramentoRegistro = {
          id: Math.random().toString(36).slice(2, 10),
          data: agoraIso.slice(0, 10),
          ansiedadeAntes,
          ansiedadeDepois,
          avaliacao,
          comentario: comentario.trim() || "Sem comentários.",
        };

        const sessoes = Array.isArray(paciente.sessoes) ? paciente.sessoes : [];
        const sessoesAtualizadas = sessoes.map((sessao) => {
          if (contexto?.sessaoId && sessao.id !== contexto.sessaoId) return sessao;
          if (!contexto?.sessaoId && sessao.status !== "aberta") return sessao;

          return {
            ...sessao,
            status: "encerrada" as const,
            dataFim: agoraIso,
            observacoes: comentario.trim() || sessao.observacoes,
          };
        });

        return {
          ...paciente,
          sessoes: sessoesAtualizadas,
          encerramentos: [encerramentoRegistro, ...(paciente.encerramentos ?? [])],
        };
      });

      window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(atualizados));
      window.localStorage.removeItem(SESSION_CONTEXT_STORAGE_KEY);
      setSalvo(true);
    } catch {
      setMensagemErro("Falha ao salvar o encerramento. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.03_270)] text-white p-6 lg:p-8">
      <main className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h1 className="text-2xl font-bold">Encerramento da sessao</h1>
          <p className="text-sm text-white/70 mt-1">
            Resultado e pos-sessao unificados para documentacao clinica e feedback rapido.
          </p>
          {pacienteNome && <p className="text-xs text-white/60 mt-2">Paciente da sessao: {pacienteNome}</p>}
        </div>

        <FlowBreadcrumb items={FLOW_BREADCRUMB_ITEMS} />

        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Resumo clinico da sessao</h2>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Ansiedade antes da sessao</div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-red-300/70" style={{ width: `${ansiedadeAntes * 10}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{ansiedadeAntes}/10</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Ansiedade depois da sessao</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={ansiedadeDepois}
                    onChange={(event) => setAnsiedadeDepois(Number(event.target.value))}
                    className="flex-1 accent-white"
                  />
                  <span className="text-sm font-semibold w-12 text-right">{ansiedadeDepois}/10</span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm">
                Reducao estimada nesta sessao: <strong>{reducao}/10</strong>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Avaliacao da experiencia</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((nivel) => (
                    <button key={nivel} type="button" onClick={() => setAvaliacao(nivel)} aria-label={`Definir avaliacao ${nivel}`}>
                      <Star className={`h-7 w-7 ${nivel <= avaliacao ? "fill-yellow-300 text-yellow-300" : "text-white/35"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Anotacoes finais da sessao</label>
                <textarea
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm resize-none"
                  placeholder="Descreva resposta do paciente e orientacoes de continuidade..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Proximos passos</h2>
            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 inline-flex w-full items-start gap-2">
                <FileCheck2 className="h-4 w-4 mt-0.5" />
                Registrar protocolo aplicado e resposta observada no prontuario.
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                Recomendacao: reforcar respiracao guiada e reduzir estimulos sonoros em picos de ansiedade.
              </div>
            </div>

            <div className="mt-6 grid gap-2">
              <Link
                to="/pacientes"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                Voltar ao prontuario
              </Link>
              <button
                type="button"
                onClick={salvarEncerramentoNoProntuario}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/30 border border-emerald-300/50 px-4 py-2 text-sm hover:bg-emerald-500/40 transition"
              >
                Salvar no prontuario <ArrowRight className="h-4 w-4" />
              </button>
              {salvo && (
                <StateNotice
                  variant="success"
                  title="Encerramento registrado com sucesso"
                  description={`Ansiedade antes: ${ansiedadeAntes}/10, depois: ${ansiedadeDepois}/10, avaliação: ${avaliacao}/5.`}
                />
              )}
              {mensagemErro && <StateNotice variant="error" title="Falha ao salvar encerramento" description={mensagemErro} />}
              {salvo && (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/painel" })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
                >
                  Ir para o painel
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
