const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const DEFAULT_PORT = Number.parseInt(process.env.PORT || "4000", 10);
const PORT_FALLBACK_ATTEMPTS = Math.max(
  0,
  Number.parseInt(process.env.PORT_FALLBACK_ATTEMPTS || "10", 10),
);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const DB_PATH = path.join(__dirname, "db.json");
let currentPort = DEFAULT_PORT;

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
  }),
);
app.use(express.json());

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ pacientes: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const parsed = JSON.parse(raw || "{}");
  return {
    pacientes: Array.isArray(parsed.pacientes) ? parsed.pacientes : [],
  };
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizarPaciente(input) {
  return {
    id: input.id || gerarId(),
    nome: input.nome || "Paciente sem nome",
    idade: Number(input.idade) > 0 ? Number(input.idade) : 1,
    orientacaoSexual: input.orientacaoSexual || "Prefiro não informar",
    anamneses: Array.isArray(input.anamneses) ? input.anamneses : [],
    sessoes: Array.isArray(input.sessoes) ? input.sessoes : [],
    encerramentos: Array.isArray(input.encerramentos) ? input.encerramentos : [],
  };
}

function getPaciente(db, pacienteId) {
  return db.pacientes.find((p) => p.id === pacienteId);
}

function shouldOpenBrowser() {
  const value = String(process.env.OPEN_BROWSER || "").toLowerCase();
  return value === "1" || value === "true";
}

function openInDefaultBrowser(url) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return;
  }

  const command = process.platform === "darwin" ? "open" : "xdg-open";
  spawn(command, [url], {
    detached: true,
    stdio: "ignore",
  }).unref();
}

app.get("/", (_req, res) => {
  res.send(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MindSpace Backend</title>
        <style>
          :root { color-scheme: dark; }
          body {
            margin: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
            background: radial-gradient(circle at top, #20263a, #0b1020 60%);
            color: #f3f6ff;
          }
          .wrap {
            max-width: 720px;
            margin: 10vh auto;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
          }
          h1 { margin: 0 0 8px; font-size: 28px; }
          p { margin: 0 0 16px; opacity: 0.9; }
          ul { margin: 0; padding-left: 18px; }
          li { margin: 8px 0; }
          a { color: #9fd0ff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .muted { font-size: 13px; opacity: 0.75; margin-top: 16px; }
        </style>
      </head>
      <body>
        <main class="wrap">
          <h1>MindSpace Backend</h1>
          <p>Servidor online na porta ${currentPort}.</p>
          <ul>
            <li><a href="/health">/health</a></li>
            <li><a href="/api/pacientes">/api/pacientes</a></li>
          </ul>
          <p class="muted">API JSON de suporte ao fluxo clinico do MindSpace.</p>
        </main>
      </body>
    </html>
  `);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mindspace-backend" });
});

app.get("/api/pacientes", (_req, res) => {
  const db = readDb();
  res.json(db.pacientes);
});

app.get("/api/pacientes/:id", (req, res) => {
  const db = readDb();
  const paciente = getPaciente(db, req.params.id);
  if (!paciente) return res.status(404).json({ message: "Paciente não encontrado" });
  res.json(paciente);
});

app.post("/api/pacientes", (req, res) => {
  const { nome, idade, orientacaoSexual } = req.body || {};

  if (!nome || !Number.isFinite(Number(idade)) || Number(idade) <= 0) {
    return res.status(400).json({ message: "Dados inválidos para criação de paciente" });
  }

  const db = readDb();
  const novoPaciente = normalizarPaciente({
    id: gerarId(),
    nome: String(nome).trim(),
    idade: Number(idade),
    orientacaoSexual,
    anamneses: [],
    sessoes: [],
    encerramentos: [],
  });

  db.pacientes.unshift(novoPaciente);
  writeDb(db);
  res.status(201).json(novoPaciente);
});

app.put("/api/pacientes/:id", (req, res) => {
  const db = readDb();
  const index = db.pacientes.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Paciente não encontrado" });

  const atual = db.pacientes[index];
  const atualizado = normalizarPaciente({
    ...atual,
    ...req.body,
    id: atual.id,
  });

  db.pacientes[index] = atualizado;
  writeDb(db);
  res.json(atualizado);
});

app.delete("/api/pacientes/:id", (req, res) => {
  const db = readDb();
  const before = db.pacientes.length;
  db.pacientes = db.pacientes.filter((p) => p.id !== req.params.id);

  if (db.pacientes.length === before) {
    return res.status(404).json({ message: "Paciente não encontrado" });
  }

  writeDb(db);
  res.status(204).send();
});

app.post("/api/pacientes/:id/anamneses", (req, res) => {
  const db = readDb();
  const paciente = getPaciente(db, req.params.id);
  if (!paciente) return res.status(404).json({ message: "Paciente não encontrado" });

  const registro = {
    id: gerarId(),
    data: req.body?.data || new Date().toISOString().slice(0, 10),
    anotacoesSessao: String(req.body?.anotacoesSessao || "").trim(),
  };

  if (!registro.anotacoesSessao) {
    return res.status(400).json({ message: "Anotações da anamnese são obrigatórias" });
  }

  paciente.anamneses = [registro, ...(paciente.anamneses || [])];
  writeDb(db);
  res.status(201).json(registro);
});

app.post("/api/pacientes/:id/sessoes", (req, res) => {
  const db = readDb();
  const paciente = getPaciente(db, req.params.id);
  if (!paciente) return res.status(404).json({ message: "Paciente não encontrado" });

  const registro = {
    id: gerarId(),
    dataInicio: req.body?.dataInicio || new Date().toISOString(),
    status: req.body?.status === "encerrada" ? "encerrada" : "aberta",
    dataFim: req.body?.dataFim,
    observacoes: req.body?.observacoes,
  };

  paciente.sessoes = [registro, ...(paciente.sessoes || [])];
  writeDb(db);
  res.status(201).json(registro);
});

app.put("/api/pacientes/:id/sessoes/:sessaoId", (req, res) => {
  const db = readDb();
  const paciente = getPaciente(db, req.params.id);
  if (!paciente) return res.status(404).json({ message: "Paciente não encontrado" });

  const index = (paciente.sessoes || []).findIndex((s) => s.id === req.params.sessaoId);
  if (index === -1) return res.status(404).json({ message: "Sessão não encontrada" });

  paciente.sessoes[index] = {
    ...paciente.sessoes[index],
    ...req.body,
    id: paciente.sessoes[index].id,
  };

  writeDb(db);
  res.json(paciente.sessoes[index]);
});

app.post("/api/pacientes/:id/encerramentos", (req, res) => {
  const db = readDb();
  const paciente = getPaciente(db, req.params.id);
  if (!paciente) return res.status(404).json({ message: "Paciente não encontrado" });

  const registro = {
    id: gerarId(),
    data: req.body?.data || new Date().toISOString().slice(0, 10),
    ansiedadeAntes: Number(req.body?.ansiedadeAntes || 0),
    ansiedadeDepois: Number(req.body?.ansiedadeDepois || 0),
    avaliacao: Number(req.body?.avaliacao || 0),
    comentario: String(req.body?.comentario || "Sem comentários."),
  };

  paciente.encerramentos = [registro, ...(paciente.encerramentos || [])];
  writeDb(db);
  res.status(201).json(registro);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno no servidor" });
});

function startServer(port, attemptsLeft) {
  const server = app.listen(port, () => {
    currentPort = port;
    console.log(`MindSpace backend rodando em http://localhost:${port}/`);
    if (shouldOpenBrowser()) {
      openInDefaultBrowser(`http://localhost:${port}/`);
    }
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.warn(
        `Porta ${port} ocupada. Tentando ${nextPort} (${attemptsLeft} tentativas restantes)...`,
      );
      startServer(nextPort, attemptsLeft - 1);
      return;
    }

    console.error(
      `Falha ao iniciar o backend na porta ${port}.`,
      err?.code || err?.message || err,
    );
    process.exit(1);
  });
}

startServer(DEFAULT_PORT, PORT_FALLBACK_ATTEMPTS);
