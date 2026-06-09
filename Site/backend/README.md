# MindSpace Backend (JSON)

API simples em Node.js + Express com persistencia em arquivo `db.json`.

## Arquivo de dados local

O arquivo `db.json` e local e nao deve ser versionado.

Antes de iniciar o backend pela primeira vez, gere o arquivo local a partir do exemplo:

```bash
cp db.example.json db.json
```

No Windows (Prompt de Comando):

```bat
copy db.example.json db.json
```

## Objetivo

Servir os pacientes cadastrados e os registros clinicos para o frontend do MindSpace.

## Rodar localmente

1. Instalar dependencias:

```bash
cd backend
npm install
```

2. Iniciar em desenvolvimento:

```bash
npm run dev
```

Para abrir no navegador padrao (fora do VS Code) e iniciar o backend em seguida:

```bash
npm run dev:open
```

Esse comando abre automaticamente a URL real onde a API subiu (inclusive quando houver fallback de porta).

3. Iniciar em producao:

```bash
npm start
```

API local padrao: `http://localhost:4000/`

Se a porta `4000` estiver ocupada, a API tenta automaticamente `4001`, `4002` e assim por diante ate o limite configurado.

## Variaveis de ambiente

Use um arquivo `.env` (opcional):

- `PORT` (padrao: `4000`)
- `PORT_FALLBACK_ATTEMPTS` (padrao: `10`)
- `CORS_ORIGIN` (padrao: `http://localhost:5173`)

Exemplo em `.env.example`.

## Endpoints principais

- `GET /health`
- `GET /api/pacientes`
- `GET /api/pacientes/:id`
- `POST /api/pacientes`
- `PUT /api/pacientes/:id`
- `DELETE /api/pacientes/:id`
- `POST /api/pacientes/:id/anamneses`
- `POST /api/pacientes/:id/sessoes`
- `PUT /api/pacientes/:id/sessoes/:sessaoId`
- `POST /api/pacientes/:id/encerramentos`

## Deploy no Render

1. Crie um novo **Web Service** apontando para este repositorio.
2. Configure a raiz do servico para `backend`.
3. Build Command:

```bash
npm install
```

4. Start Command:

```bash
npm start
```

5. Defina variaveis no Render (se necessario):
- `PORT` (Render injeta automaticamente)
- `CORS_ORIGIN` com a URL do frontend publicado

## Observacao importante

Este backend persiste em arquivo JSON local. Em ambiente de producao, para evitar perda de dados, use disco persistente do Render ou migre para banco de dados (ex.: Postgres).
