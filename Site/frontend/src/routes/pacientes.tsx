import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Pencil, Plus, Save, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATIENTS_STORAGE_KEY, SESSION_CONTEXT_STORAGE_KEY } from "@/lib/patient-session";
import { FlowBreadcrumb } from "@/components/FlowBreadcrumb";
import { StateNotice } from "@/components/StateNotice";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { FLOW_BREADCRUMB_ITEMS } from "@/lib/flow-breadcrumb";
import { backendApi } from "@/lib/backend-api";

export const Route = createFileRoute("/pacientes")({
  head: () => ({ meta: [{ title: "Pacientes — MindSpace" }] }),
  component: Pacientes,
});

type AnamneseRegistro = {
  id: string;
  data: string;
  anotacoesSessao: string;
};

type SessaoRegistro = {
  id: string;
  dataInicio: string;
  dataFim?: string;
  status: "aberta" | "encerrada";
  observacoes?: string;
};

type EncerramentoRegistro = {
  id: string;
  data: string;
  ansiedadeAntes: number;
  ansiedadeDepois: number;
  avaliacao: number;
  comentario: string;
};

type Paciente = {
  id: string;
  nome: string;
  idade: number;
  orientacaoSexual: string;
  anamneses: AnamneseRegistro[];
  sessoes: SessaoRegistro[];
  encerramentos: EncerramentoRegistro[];
};

type PacienteForm = {
  nome: string;
  idade: string;
  orientacaoSexual: string;
};

type AnamneseForm = {
  data: string;
  anotacoesSessao: string;
};

type ProntuarioTab = "dados" | "anamnese" | "sessoes" | "timeline";

const ORIENTACOES = [
  "Heterossexual",
  "Homossexual",
  "Bissexual",
  "Pansexual",
  "Assexual",
  "Prefiro não informar",
  "Outra",
];

function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizarPaciente(input: Partial<Paciente> & { id?: string }): Paciente {
  return {
    id: input.id ?? gerarId(),
    nome: input.nome ?? "Paciente sem nome",
    idade: Number(input.idade) > 0 ? Number(input.idade) : 1,
    orientacaoSexual: input.orientacaoSexual ?? "Prefiro não informar",
    anamneses: Array.isArray(input.anamneses) ? input.anamneses : [],
    sessoes: Array.isArray(input.sessoes) ? input.sessoes : [],
    encerramentos: Array.isArray(input.encerramentos) ? input.encerramentos : [],
  };
}

function criarPacienteInicial(): Paciente {
  return {
    id: gerarId(),
    nome: "Maria Silva",
    idade: 28,
    orientacaoSexual: "Heterossexual",
    anamneses: [
      {
        id: gerarId(),
        data: new Date().toISOString().slice(0, 10),
        anotacoesSessao: "Paciente relatou melhora após técnica de respiração 4-7-8.",
      },
    ],
    sessoes: [],
    encerramentos: [],
  };
}

function Pacientes() {
  const navigate = useNavigate();
  const hasLoaded = useRef(false);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState<string | null>(null);
  const [buscaNome, setBuscaNome] = useState("");
  const [filtroOrientacao, setFiltroOrientacao] = useState("todas");
  const [activeTab, setActiveTab] = useState<ProntuarioTab>("dados");

  const [pacienteForm, setPacienteForm] = useState<PacienteForm>({
    nome: "",
    idade: "",
    orientacaoSexual: ORIENTACOES[0],
  });
  const [pacienteEditandoId, setPacienteEditandoId] = useState<string | null>(null);

  const [anamneseForm, setAnamneseForm] = useState<AnamneseForm>({
    data: new Date().toISOString().slice(0, 10),
    anotacoesSessao: "",
  });
  const [anamneseEditandoId, setAnamneseEditandoId] = useState<string | null>(null);
  const [confirmDeletePacienteId, setConfirmDeletePacienteId] = useState<string | null>(null);
  const [confirmDeleteAnamneseId, setConfirmDeleteAnamneseId] = useState<string | null>(null);

  const aplicarPacientes = useCallback((lista: Paciente[]) => {
    setPacientes(lista);

    setPacienteSelecionadoId((atual) => {
      if (atual && lista.some((paciente) => paciente.id === atual)) {
        return atual;
      }
      return lista[0]?.id ?? null;
    });
  }, []);

  const sincronizarPacientes = useCallback(async () => {
    const lista = (await backendApi.listPacientes<Paciente[]>()).map(normalizarPaciente);
    aplicarPacientes(lista);
    setErroApi(null);
    return lista;
  }, [aplicarPacientes]);

  useEffect(() => {
    const carregar = async () => {
      setIsLoading(true);

      try {
        let lista = await sincronizarPacientes();

        if (!lista.length) {
          const inicial = criarPacienteInicial();
          const pacienteCriado = await backendApi.createPaciente<Paciente>({
            nome: inicial.nome,
            idade: inicial.idade,
            orientacaoSexual: inicial.orientacaoSexual,
          });
          await backendApi.createAnamnese(pacienteCriado.id, {
            data: inicial.anamneses[0].data,
            anotacoesSessao: inicial.anamneses[0].anotacoesSessao,
          });
          lista = await sincronizarPacientes();
        }
      } catch {
        setErroApi("Nao foi possivel conectar ao backend. Exibindo dados locais.");

        const raw = window.localStorage.getItem(PATIENTS_STORAGE_KEY);

        if (!raw) {
          const inicial = criarPacienteInicial();
          aplicarPacientes([inicial]);
        } else {
          try {
            const parsed = JSON.parse(raw) as Paciente[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              aplicarPacientes(parsed.map(normalizarPaciente));
            } else {
              aplicarPacientes([criarPacienteInicial()]);
            }
          } catch {
            aplicarPacientes([criarPacienteInicial()]);
          }
        }
      } finally {
        hasLoaded.current = true;
        setIsLoading(false);
      }
    };

    carregar();
  }, [aplicarPacientes, sincronizarPacientes]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(pacientes));
  }, [pacientes]);

  const pacienteSelecionado = useMemo(
    () => pacientes.find((p) => p.id === pacienteSelecionadoId) ?? null,
    [pacientes, pacienteSelecionadoId],
  );

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente) => {
      const combinaNome = paciente.nome.toLowerCase().includes(buscaNome.trim().toLowerCase());
      const combinaOrientacao = filtroOrientacao === "todas" || paciente.orientacaoSexual === filtroOrientacao;
      return combinaNome && combinaOrientacao;
    });
  }, [pacientes, buscaNome, filtroOrientacao]);

  const timelineProntuario = useMemo(() => {
    if (!pacienteSelecionado) return [];

    const eventosAnamnese = pacienteSelecionado.anamneses.map((registro) => ({
      id: registro.id,
      tipo: "anamnese" as const,
      data: `${registro.data}T00:00:00.000Z`,
      titulo: `Anamnese registrada em ${registro.data}`,
      descricao: registro.anotacoesSessao,
    }));

    const eventosSessao = pacienteSelecionado.sessoes.map((registro) => ({
      id: registro.id,
      tipo: "sessao" as const,
      data: registro.dataInicio,
      titulo: `Sessão ${registro.status === "encerrada" ? "encerrada" : "iniciada"}`,
      descricao: registro.observacoes ?? `Início: ${new Date(registro.dataInicio).toLocaleString("pt-BR")}`,
    }));

    const eventosEncerramento = pacienteSelecionado.encerramentos.map((registro) => ({
      id: registro.id,
      tipo: "encerramento" as const,
      data: `${registro.data}T00:00:00.000Z`,
      titulo: `Encerramento da sessão em ${registro.data}`,
      descricao: `Antes ${registro.ansiedadeAntes}/10 • Depois ${registro.ansiedadeDepois}/10 • Avaliação ${registro.avaliacao}/5`,
    }));

    return [...eventosAnamnese, ...eventosSessao, ...eventosEncerramento].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [pacienteSelecionado]);

  const iniciarNovoPaciente = () => {
    setPacienteEditandoId(null);
    setPacienteForm({ nome: "", idade: "", orientacaoSexual: ORIENTACOES[0] });
  };

  const iniciarEdicaoPaciente = (paciente: Paciente) => {
    setPacienteEditandoId(paciente.id);
    setPacienteForm({
      nome: paciente.nome,
      idade: String(paciente.idade),
      orientacaoSexual: paciente.orientacaoSexual,
    });
  };

  const salvarPaciente = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nome = pacienteForm.nome.trim();
    const idadeNumero = Number(pacienteForm.idade);

    if (!nome || !Number.isFinite(idadeNumero) || idadeNumero <= 0) return;

    try {
      if (pacienteEditandoId) {
        await backendApi.updatePaciente<Paciente>(pacienteEditandoId, {
          nome,
          idade: idadeNumero,
          orientacaoSexual: pacienteForm.orientacaoSexual,
        });
        setPacienteEditandoId(null);
      } else {
        const novoPaciente = await backendApi.createPaciente<Paciente>({
          nome,
          idade: idadeNumero,
          orientacaoSexual: pacienteForm.orientacaoSexual,
        });
        setPacienteSelecionadoId(novoPaciente.id);
      }

      await sincronizarPacientes();
      setPacienteForm({ nome: "", idade: "", orientacaoSexual: ORIENTACOES[0] });
    } catch {
      setErroApi("Falha ao salvar paciente no backend.");
    }
  };

  const excluirPaciente = async (pacienteId: string) => {
    try {
      await backendApi.deletePaciente(pacienteId);
      await sincronizarPacientes();

      if (pacienteEditandoId === pacienteId) {
        iniciarNovoPaciente();
      }
    } catch {
      setErroApi("Falha ao excluir paciente no backend.");
    }
  };

  const iniciarNovaAnamnese = () => {
    setAnamneseEditandoId(null);
    setAnamneseForm({
      data: new Date().toISOString().slice(0, 10),
      anotacoesSessao: "",
    });
  };

  const iniciarEdicaoAnamnese = (registro: AnamneseRegistro) => {
    setAnamneseEditandoId(registro.id);
    setAnamneseForm({
      data: registro.data,
      anotacoesSessao: registro.anotacoesSessao,
    });
  };

  const salvarAnamnese = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pacienteSelecionadoId) return;

    const anotacoes = anamneseForm.anotacoesSessao.trim();
    if (!anamneseForm.data || !anotacoes) return;

    try {
      const pacienteAlvo = pacientes.find((paciente) => paciente.id === pacienteSelecionadoId);
      if (!pacienteAlvo) return;

      if (anamneseEditandoId) {
        const anamnesesAtualizadas = pacienteAlvo.anamneses.map((registro) =>
          registro.id === anamneseEditandoId ? { ...registro, data: anamneseForm.data, anotacoesSessao: anotacoes } : registro,
        );

        await backendApi.updatePaciente<Paciente>(pacienteSelecionadoId, {
          ...pacienteAlvo,
          anamneses: anamnesesAtualizadas,
        });
        setAnamneseEditandoId(null);
      } else {
        await backendApi.createAnamnese(pacienteSelecionadoId, {
          data: anamneseForm.data,
          anotacoesSessao: anotacoes,
        });
      }

      await sincronizarPacientes();
      iniciarNovaAnamnese();
    } catch {
      setErroApi("Falha ao salvar anamnese no backend.");
    }
  };

  const excluirAnamnese = async (registroId: string) => {
    if (!pacienteSelecionadoId) return;

    try {
      const pacienteAlvo = pacientes.find((paciente) => paciente.id === pacienteSelecionadoId);
      if (!pacienteAlvo) return;

      await backendApi.updatePaciente<Paciente>(pacienteSelecionadoId, {
        ...pacienteAlvo,
        anamneses: pacienteAlvo.anamneses.filter((registro) => registro.id !== registroId),
      });

      await sincronizarPacientes();

      if (anamneseEditandoId === registroId) {
        iniciarNovaAnamnese();
      }
    } catch {
      setErroApi("Falha ao excluir anamnese no backend.");
    }
  };

  const iniciarSessaoComPaciente = async () => {
    if (!pacienteSelecionado) return;

    const dataInicio = new Date().toISOString();

    try {
      const sessao = await backendApi.createSessao<SessaoRegistro>(pacienteSelecionado.id, {
        dataInicio,
        status: "aberta",
      });

      await sincronizarPacientes();

      window.localStorage.setItem(
        SESSION_CONTEXT_STORAGE_KEY,
        JSON.stringify({
          id: pacienteSelecionado.id,
          nome: pacienteSelecionado.nome,
          idade: pacienteSelecionado.idade,
          sessaoId: sessao.id,
          dataInicio,
        }),
      );

      navigate({ to: "/ambiente" });
    } catch {
      setErroApi("Falha ao iniciar sessao no backend.");
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.03_270)] text-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pacientes</h1>
            <p className="text-sm text-white/70">Histórico de anamneses e anotações de sessão.</p>
          </div>
          <Link to="/painel" className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition">
            Voltar ao painel
          </Link>
        </div>

        <FlowBreadcrumb items={FLOW_BREADCRUMB_ITEMS} />

        {isLoading && <StateNotice title="Carregando pacientes" description="Buscando dados do backend..." />}
        {erroApi && <StateNotice variant="error" title="Conexao com backend" description={erroApi} />}

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Lista de pacientes</h2>
              <button
                type="button"
                onClick={iniciarNovoPaciente}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Novo
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <input
                value={buscaNome}
                onChange={(event) => setBuscaNome(event.target.value)}
                placeholder="Buscar por nome"
                className="w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm"
              />
              <select
                value={filtroOrientacao}
                onChange={(event) => setFiltroOrientacao(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm"
              >
                <option value="todas" className="text-black">Todas orientações</option>
                {ORIENTACOES.map((orientacao) => (
                  <option key={orientacao} value={orientacao} className="text-black">
                    {orientacao}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">{pacientesFiltrados.length} resultado(s)</span>
                <button
                  type="button"
                  onClick={() => {
                    setBuscaNome("");
                    setFiltroOrientacao("todas");
                  }}
                  className="text-xs text-white/70 hover:text-white underline underline-offset-2"
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {pacientesFiltrados.length === 0 && (
                <StateNotice
                  title="Nenhum paciente encontrado"
                  description="Ajuste os filtros ou cadastre um novo paciente."
                />
              )}
              {pacientesFiltrados.map((paciente) => (
                <button
                  key={paciente.id}
                  type="button"
                  onClick={() => {
                    setPacienteSelecionadoId(paciente.id);
                    setActiveTab("dados");
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    pacienteSelecionadoId === paciente.id
                      ? "border-emerald-300/60 bg-emerald-500/20"
                      : "border-white/10 bg-black/20 hover:bg-white/10"
                  }`}
                >
                  <div className="font-medium text-sm">{paciente.nome}</div>
                  <div className="text-xs text-white/60">{paciente.idade} anos</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-semibold mb-4">{pacienteEditandoId ? "Editar paciente" : "Cadastrar paciente"}</h2>
              <form onSubmit={salvarPaciente} className="grid gap-3 md:grid-cols-3">
                <label className="text-sm md:col-span-1">
                  Nome
                  <input
                    value={pacienteForm.nome}
                    onChange={(event) => setPacienteForm((f) => ({ ...f, nome: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm"
                    placeholder="Nome completo"
                    required
                  />
                </label>
                <label className="text-sm">
                  Idade
                  <input
                    type="number"
                    min={1}
                    value={pacienteForm.idade}
                    onChange={(event) => setPacienteForm((f) => ({ ...f, idade: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm"
                    placeholder="Ex: 28"
                    required
                  />
                </label>
                <label className="text-sm">
                  Orientação sexual
                  <select
                    value={pacienteForm.orientacaoSexual}
                    onChange={(event) => setPacienteForm((f) => ({ ...f, orientacaoSexual: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm"
                  >
                    {ORIENTACOES.map((orientacao) => (
                      <option key={orientacao} value={orientacao} className="text-black">
                        {orientacao}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="md:col-span-3 flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/30 border border-emerald-300/60 px-4 py-2 text-sm hover:bg-emerald-500/40 transition"
                  >
                    <Save className="h-4 w-4" /> {pacienteEditandoId ? "Atualizar paciente" : "Salvar paciente"}
                  </button>
                  {pacienteEditandoId && (
                    <button
                      type="button"
                      onClick={iniciarNovoPaciente}
                      className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              {!pacienteSelecionado ? (
                <StateNotice
                  title="Selecione um paciente"
                  description="Escolha um paciente na lista para acessar o prontuário completo."
                />
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-white/60">Paciente selecionado</div>
                      <h3 className="text-lg font-semibold inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4" /> {pacienteSelecionado.nome}
                      </h3>
                      <p className="text-sm text-white/70">
                        {pacienteSelecionado.idade} anos • {pacienteSelecionado.orientacaoSexual}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {pacienteSelecionado.anamneses.length} anamneses • {pacienteSelecionado.sessoes.length} sessões • {pacienteSelecionado.encerramentos.length} encerramentos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={iniciarSessaoComPaciente}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 px-3 py-2 text-xs text-emerald-100 hover:bg-emerald-500/15 transition"
                      >
                        Iniciar sessão ao vivo
                      </button>
                      <button
                        type="button"
                        onClick={() => iniciarEdicaoPaciente(pacienteSelecionado)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar paciente
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePacienteId(pacienteSelecionado.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-300/40 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir paciente
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {[
                      { key: "dados", label: "Dados" },
                      { key: "anamnese", label: "Anamnese" },
                      { key: "sessoes", label: "Sessões" },
                      { key: "timeline", label: "Linha do tempo" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key as ProntuarioTab)}
                        className={`rounded-lg px-3 py-1.5 text-xs transition border ${
                          activeTab === tab.key
                            ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                            : "border-white/20 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "dados" && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-white/60">Perfil</div>
                        <div className="mt-1 text-sm font-medium">{pacienteSelecionado.nome}</div>
                        <div className="text-sm text-white/75">{pacienteSelecionado.idade} anos</div>
                        <div className="text-sm text-white/75">{pacienteSelecionado.orientacaoSexual}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-white/60">Resumo clínico rápido</div>
                        <div className="mt-2 text-sm text-white/80">
                          Última anamnese: {pacienteSelecionado.anamneses[0]?.data ?? "sem registro"}
                        </div>
                        <div className="text-sm text-white/80">
                          Sessões totais: {pacienteSelecionado.sessoes.length}
                        </div>
                        <div className="text-sm text-white/80">
                          Encerramentos: {pacienteSelecionado.encerramentos.length}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "anamnese" && (
                    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
                      <form onSubmit={salvarAnamnese} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
                        <div className="text-sm font-medium">
                          {anamneseEditandoId ? "Editar anamnese" : "Nova anamnese"}
                        </div>
                        <label className="block text-sm">
                          Data
                          <input
                            type="date"
                            value={anamneseForm.data}
                            onChange={(event) => setAnamneseForm((f) => ({ ...f, data: event.target.value }))}
                            className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm"
                            required
                          />
                        </label>
                        <label className="block text-sm">
                          Anotações durante a sessão
                          <textarea
                            rows={5}
                            value={anamneseForm.anotacoesSessao}
                            onChange={(event) => setAnamneseForm((f) => ({ ...f, anotacoesSessao: event.target.value }))}
                            className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm resize-none"
                            placeholder="Registre observações clínicas da sessão..."
                            required
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/30 border border-emerald-300/60 px-3 py-2 text-sm hover:bg-emerald-500/40 transition"
                          >
                            <Save className="h-4 w-4" /> {anamneseEditandoId ? "Atualizar" : "Salvar"}
                          </button>
                          <button
                            type="button"
                            onClick={iniciarNovaAnamnese}
                            className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition"
                          >
                            Limpar
                          </button>
                        </div>
                      </form>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Histórico de anamneses anteriores</h4>
                        {pacienteSelecionado.anamneses.length === 0 ? (
                          <StateNotice
                            title="Sem anamneses registradas"
                            description="Crie a primeira anamnese para iniciar o histórico clínico."
                          />
                        ) : (
                          pacienteSelecionado.anamneses.map((registro) => (
                            <article key={registro.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="text-sm font-medium">Data: {registro.data}</div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicaoAnamnese(registro)}
                                    className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/10 transition"
                                  >
                                    <Pencil className="h-3 w-3" /> Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteAnamneseId(registro.id)}
                                    className="inline-flex items-center gap-1 rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10 transition"
                                  >
                                    <Trash2 className="h-3 w-3" /> Excluir
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-white/80 whitespace-pre-wrap">{registro.anotacoesSessao}</p>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "sessoes" && (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <h4 className="text-sm font-medium mb-3">Sessões</h4>
                        {pacienteSelecionado.sessoes.length === 0 ? (
                          <StateNotice title="Sem sessões registradas" description="Inicie uma sessão ao vivo para gerar registros." />
                        ) : (
                          <div className="space-y-2">
                            {pacienteSelecionado.sessoes.map((sessao) => (
                              <div key={sessao.id} className="rounded-lg border border-white/10 p-3">
                                <div className="text-xs text-white/60">Início: {new Date(sessao.dataInicio).toLocaleString("pt-BR")}</div>
                                <div className="text-sm mt-1">Status: {sessao.status}</div>
                                {sessao.dataFim && (
                                  <div className="text-xs text-white/60">Fim: {new Date(sessao.dataFim).toLocaleString("pt-BR")}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <h4 className="text-sm font-medium mb-3">Encerramentos</h4>
                        {pacienteSelecionado.encerramentos.length === 0 ? (
                          <StateNotice title="Sem encerramentos" description="Conclua uma sessão para registrar o encerramento." />
                        ) : (
                          <div className="space-y-2">
                            {pacienteSelecionado.encerramentos.map((encerramento) => (
                              <div key={encerramento.id} className="rounded-lg border border-white/10 p-3">
                                <div className="text-xs text-white/60">Data: {encerramento.data}</div>
                                <div className="text-sm mt-1">Antes {encerramento.ansiedadeAntes}/10 • Depois {encerramento.ansiedadeDepois}/10</div>
                                <div className="text-xs text-white/70 mt-1">Avaliação {encerramento.avaliacao}/5</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Linha do tempo do prontuário</h4>
                      {timelineProntuario.length === 0 ? (
                        <StateNotice title="Sem eventos no prontuário" description="Os eventos serão listados após anamneses e sessões." />
                      ) : (
                        <div className="space-y-2">
                          {timelineProntuario.map((evento) => (
                            <div key={`${evento.tipo}-${evento.id}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs uppercase tracking-wide text-white/55">{evento.tipo}</span>
                                <span className="text-xs text-white/55">{new Date(evento.data).toLocaleString("pt-BR")}</span>
                              </div>
                              <div className="text-sm font-medium mt-1">{evento.titulo}</div>
                              <p className="text-sm text-white/75 mt-1 whitespace-pre-wrap">{evento.descricao}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <ConfirmActionDialog
          open={Boolean(confirmDeletePacienteId)}
          onOpenChange={(open) => {
            if (!open) setConfirmDeletePacienteId(null);
          }}
          title="Excluir paciente"
          description="Essa ação remove os dados do paciente e todo o histórico associado."
          confirmLabel="Excluir"
          destructive
          onConfirm={() => {
            if (!confirmDeletePacienteId) return;
            excluirPaciente(confirmDeletePacienteId);
            setConfirmDeletePacienteId(null);
          }}
        />

        <ConfirmActionDialog
          open={Boolean(confirmDeleteAnamneseId)}
          onOpenChange={(open) => {
            if (!open) setConfirmDeleteAnamneseId(null);
          }}
          title="Excluir anamnese"
          description="Essa ação remove definitivamente o registro de anamnese selecionado."
          confirmLabel="Excluir"
          destructive
          onConfirm={() => {
            if (!confirmDeleteAnamneseId) return;
            excluirAnamnese(confirmDeleteAnamneseId);
            setConfirmDeleteAnamneseId(null);
          }}
        />
      </div>
    </div>
  );
}
