# 🧠 MindSpace — Presença XR

Repositorio do site 
https://github.com/Jones-Mendes/mind-space
Esse é o repositorio do site que utilizamos para criar a plataforma 

**Tecnologia como presença humana.**

Uma plataforma imersiva de saúde mental que leva o consultório terapêutico para onde o paciente está,  via headset Meta Quest , com controle clínico em tempo real pelo profissional de saúde, de qualquer lugar do Brasil.

---

## 📌 Índice

- [O Problema](#-o-problema)  
- [A Solução](#-a-solução)  
- [Demonstração](#-demonstração)  
- [Funcionalidades](#-funcionalidades)  
- [Arquitetura e Tecnologia](#-arquitetura-e-tecnologia)  
- [Fluxo da Aplicação](#-fluxo-da-aplicação)  
- [Motor de Adaptação Emocional](#-motor-de-adaptação-emocional)  
- [Instalação e Execução](#-instalação-e-execução)  
- [Estrutura do Projeto](#-estrutura-do-projeto)  
- [Privacidade e LGPD](#-privacidade-e-lgpd)  
- [Viabilidade e Impacto](#-viabilidade-e-impacto)  
- [Roadmap](#-roadmap)  
- [Equipe](#-equipe)  
- [Aviso Importante](#-aviso-importante)

---

## 🚨 O Problema

**540 mil brasileiros são afastados do trabalho por saúde mental todo ano.**

Esse número é maior do que toda a população de Florianópolis — e ele cresce.

O problema não é apenas a doença. É o **acesso**. Regiões remotas do Brasil contam com CAPS (Centros de Atenção Psicossocial) com poucos profissionais e longas distâncias a percorrer. Quando a sessão terapêutica exige deslocamento, ela simplesmente não acontece.

O custo humano e econômico é imenso. E a tecnologia disponível até hoje não foi projetada para resolver isso.

---

## 💡 A Solução

**MindSpace / Presença XR** é uma plataforma imersiva de saúde mental que combina:

- **Ambientes XR terapêuticos personalizados** configurados automaticamente com base no estado emocional do paciente  
- **Painel clínico remoto** que permite ao profissional de saúde controlar o ambiente do paciente em tempo real, de qualquer lugar  
- **Protocolo de respiração guiada** com feedback visual integrado ao HUD do headset  
- **Prontuário digital integrado** com registro de sessões, anamnese e evolução clínica

Não é mais um app de meditação. É o consultório terapêutico — adaptável, remoto e escalável.

---

## 🎥 Demonstração

O protótipo cobre **6 telas navegáveis** com interações reais:

| Tela | Descrição |
| :---- | :---- |
| **Menu** | Seleção de perfil — Paciente ou Profissional, login facilitado, sem fricção |
| **Anamnese : Step 1** | Estado emocional atual \+ intensidade de 1 a 10 |
| **Anamnese : Step 2** | Perfil sensorial (silêncio, natureza, movimento) |
| **Anamnese : Step 3** | Objetivo da sessão (Relaxar, Reduzir Ansiedade, Grounding, etc.) |
| **Sessão XR (HUD)** | Interface imersiva com respiração guiada 4-2-6, chips de ambiente e controle de áudio |
| **Painel Clínico** | Visão do profissional com dados do paciente em tempo real e controles de ambiente |

---

## ✨ Funcionalidades

### Para o Paciente

- **Anamnese em 3 etapas** \-  rápida, sem julgamento, sem cadastro obrigatório, quem faz o cadastro é o profissional  
- **Ambiente XR totalmente imersivo**  \- Estabiliza o estado emocional e ajustavel a preferências sensoriais  
- **Respiração guiada** \-  protocolo 4-2-6 (inspire 4s \- segure 2s \- expire 6s) com feedback visual por cor  
- **Controle de áudio** \- o paciente ajusta o som ambiente com um toque  
- **Botão de saída sempre visível** \- autonomia faz parte do cuidado

### Para o Profissional de Saúde

- **Painel clínico em tempo real** \- visualiza estado emocional, objetivo e intensidade do paciente  
- **Controle remoto do ambiente XR** \-  ajusta clima, luz e velocidade do ambiente durante a sessão  
- **Anotações clínicas** \-  registro direto durante a sessão  
- **Métricas da sessão** \-  tempo de sessão, ciclos de respiração concluídos e evolução na escala emocional  
- **Prontuário do paciente** \-  histórico de sessões, anamnese e evolução clínica  
- **Encerramento estruturado** \-  registro de ansiedade antes/depois, avaliação e notas finais

---

## 🏗️ Arquitetura e Tecnologia

### Stack do Protótipo Web (MVP atual)

| Tecnologia | Uso |
| :---- | :---- |
| **React 19** | Interface do usuário |
| **TypeScript** | Tipagem estática e segurança de código |
| **TanStack Start** | Framework full-stack |
| **TanStack Router** | Roteamento tipado |
| **TanStack Query** | Gerenciamento de estado e cache |
| **Vite** | Build e dev server |
| **Tailwind CSS v4** | Estilização utilitária |
| **Radix UI** | Base de componentes acessíveis |
| **Lucide Icons** | Ícones consistentes |
| **Cloudflare Wrangler** | Deploy em Cloudflare Worker |
| **ESLint \+ Prettier** | Qualidade e padronização de código |

### Stack para Implementação Real (próxima fase)

| Tecnologia | Uso |
| :---- | :---- |
| **Unity \+ Meta Quest SDK (OpenXR)** | Ambiente XR imersivo no headset |
| **WebSocket bidirecional** | Sincronização clínica com latência \< 100ms |
| **Motor de Adaptação Emocional (JSON)** | Regras condicionais para geração de ambiente |
| **WSS (WebSocket Secure)** | Tráfego criptografado de dados clínicos |

### Por que XR e não uma videochamada?

A imersão faz diferença clínica. Ambientes controlados em VR reduzem estímulos ansiogênicos externos. O terapeuta controla o **ambiente inteiro** do paciente — não apenas a câmera. Isso é qualitativamente diferente de uma videochamada.

---

## 

## 🔄 Fluxo da Aplicação

┌─────────────────────────────────────────────────┐

│                  HOME / MENU                    │

│         Paciente ──────── Profissional          │

└────────────┬────────────────────┬───────────────┘

             │                    │

             ▼                    ▼

   ┌──────────────────┐   ┌───────────────────────┐

   │    ANAMNESE      │   │    PAINEL CLÍNICO     │

   │  Step 1: Estado  │   │  Lista de pacientes   │

   │  Step 2: Sensory │   │  Prontuário           │

   │  Step 3: Objetivo│   │  Métricas de sessão   │

   └────────┬─────────┘   └──────────┬────────────┘

            │                        │

            ▼                        │

   ┌──────────────────┐              │

   │   SESSÃO XR      │◄─────────────┘

   │  HUD Imersivo    │  WebSocket bidirecional

   │  Respiração 4-2-6│  Controle remoto em tempo real

   │  Ambiente 3D     │

   └────────┬─────────┘

            │

            ▼

   ┌──────────────────┐

   │  ENCERRAMENTO    │

   │  Ansiedade B/A   │

   │  Avaliação       │

   │  Notas clínicas  │

   └──────────────────┘

---

## 🧩 Motor de Adaptação Emocional

O Motor de Adaptação Emocional gera automaticamente a configuração do ambiente XR com base nas respostas da anamnese. No MVP, funciona por regras condicionais em JSON — sem dependência de IA, leve e previsível.

**Exemplos de mapeamento:**

| Estado Emocional | Objetivo | Perfil Sensorial | Ambiente Gerado |
| :---- | :---- | :---- | :---- |
| Sobrecarregado | Relaxar | Natureza | Floresta · Chuva leve · Luz suave |
| Ansioso | Reduzir Ansiedade | Silêncio | Praia ao amanhecer · Ondas suaves · Brisa |
| Triste | Sentir Segurança | Neutro | Quarto aconchegante · Lareira · Silêncio |
| Irritado | Desacelerar Pensamentos | Natureza | Campo aberto · Vento leve · Luz difusa |
| Tranquilo | Grounding | Qualquer | Jardim · Pássaros · Luz natural |

Os parâmetros trocados via WebSocket são objetos JSON compactos (`< 1KB`), tornando a sincronização viável em **conexões 4G** com latência aceitável.

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- **Node.js** 20+ (recomendado)  
- **npm** 10+ (ou versão compatível)

### Passos

**1\. Clone o repositório**

git clone https://github.com/seu-usuario/mindspace-presenca-xr.git

cd mindspace-presenca-xr

**2\. Instale as dependências**

npm install

**3\. Inicie o ambiente de desenvolvimento**

npm run dev

A aplicação abrirá automaticamente em `http://localhost:5173`

### Comandos Disponíveis

| Comando | Descrição |
| :---- | :---- |
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção otimizado |
| `npm run build:dev` | Build em modo development |
| `npm run preview` | Preview local da build de produção |
| `npm run lint` | Executa o ESLint para verificação de qualidade |
| `npm run format` | Formata o código com Prettier |

### Deploy em Produção

O projeto está configurado com **Cloudflare Wrangler** para deploy em Cloudflare Worker. Após configurar sua conta e ambiente Cloudflare:

npx wrangler deploy

O acesso em produção será disponibilizado pela URL fornecida pela Cloudflare para o serviço configurado.

---

## 📁 Estrutura do Projeto

mindspace-presenca-xr/

├── src/

│   ├── routes/               \# Rotas gerenciadas pelo TanStack Router

│   │   ├── index.tsx         \# Home institucional

│   │   ├── paciente/         \# Fluxo do paciente

│   │   │   ├── menu.tsx

│   │   │   ├── anamnese/

│   │   │   │   ├── step-1.tsx

│   │   │   │   ├── step-2.tsx

│   │   │   │   └── step-3.tsx

│   │   │   └── sessao-xr.tsx

│   │   └── profissional/     \# Fluxo do profissional

│   │       ├── painel.tsx

│   │       ├── prontuario/

│   │       └── encerramento.tsx

│   ├── components/           \# Componentes reutilizáveis

│   ├── lib/                  \# Utilitários e configurações

│   └── styles/               \# Estilos globais e tokens

├── public/                   \# Assets estáticos

├── wrangler.toml             \# Configuração Cloudflare Worker

├── vite.config.ts

├── tailwind.config.ts

├── tsconfig.json

└── package.json

**Nota:** O arquivo de rotas é gerado automaticamente pelo TanStack Router e não deve ser editado manualmente. Arquivos de cache e framework não são versionados.

---

## 🔒 Privacidade e LGPD

### MVP atual

- **Nenhum dado é persistido em servidor** — toda sessão usa `localStorage` para contexto temporário  
- Dados são descartados ao encerrar o navegador

### Produto (próxima fase)

- Conformidade com a **LGPD** \-n  consentimento explícito do paciente antes de qualquer coleta  
- **WSS (WebSocket Secure)** para todo tráfego de dados clínicos  
- **Pseudonimização** de dados clínicos no backend  
- **Autenticação por CRP** para profissionais de saúde  
- Auditoria de alterações no prontuário

---

## 📈 Viabilidade e Impacto

### Custo de entrada acessível

Um **Meta Quest 2** custa menos de R$ 2.000. Para um CAPS que hoje não conta com psicólogos suficientes, esse é um custo justificável por ponto de atendimento.

### Modelo de negócio (B2B2C)

| Segmento | Modelo | Valor estimado |
| :---- | :---- | :---- |
| CAPS e clínicas parceiras | Assinatura por licença profissional | R$ 300–800/mês |
| Paciente | Gratuito via headset da instituição | — |
| Futuro | Marketplace de ambientes terapêuticos certificados | — |

### Timeline de desenvolvimento

| Fase | Duração | Entregável |
| :---- | :---- | :---- |
| Build Unity \+ WebSocket | 3 meses | Versão XR funcional em headset real |
| Piloto com CAPS parceiro | 6 meses | Validação clínica com pacientes reais |
| Escala | 12 meses+ | Expansão para rede de CAPS nacionais |

### Time mínimo para MVP real

- 1 dev Unity (ambiente XR)  
- 1 dev web/backend (painel clínico \+ WebSocket)  
- 1 psicólogo consultor (validação clínica dos protocolos)

---

## 🗺️ Roadmap

### Versão 1.0 — MVP Web (atual, Hackathon 2026\)

- [x] Protótipo React com 6 telas navegáveis  
- [x] Motor de Adaptação Emocional (regras JSON)  
- [x] Interface HUD de sessão XR  
- [x] Painel clínico com controles de ambiente  
- [x] Prontuário de pacientes com histórico clínico  
- [x] Fluxo de encerramento com registro antes/depois

### Versão 2.0 — Produto Real

- [ ] Build Unity com Meta Quest SDK (OpenXR)  
- [ ] Sincronização via WebSocket bidirecional (\< 100ms)  
- [ ] Integração com backend persistente (banco de dados)  
- [ ] Controle de autenticação e perfis (CRP para profissionais)  
- [ ] Ambientes 3D: floresta, praia, campo, quarto  
- [ ] Áudio 3D espacial local no headset

### Versão 3.0 — Escala

- [ ] Telemetria e indicadores clínicos agregados  
- [ ] Auditoria de alterações no prontuário  
- [ ] CI/CD com ambiente de homologação  
- [ ] Marketplace de ambientes terapêuticos certificados  
- [ ] Integração com prontuário eletrônico do SUS (e-SUS)

---


## ⚠️ Aviso Importante

**O MindSpace / Presença XR não substitui atendimento psicológico ou psiquiátrico profissional.**

A plataforma funciona como **tecnologia de apoio ao cuidado**, sempre sob supervisão de um profissional de saúde mental habilitado. Em caso de crise ou emergência, procure o CAPS da sua região, o CVV (188) ou o SAMU (192).

---

## 📄 Licença

Este projeto foi desenvolvido para o **Hackathon 2026**. Consulte o arquivo `LICENSE` para os termos de uso.

---

**Presença XR. Tecnologia como presença humana.**

*MindSpace — Hackathon 2026*  

## 👥 Equipe

| Papel | Responsável |
| :---- | :---- |
| **Tech Lead** | Mateus Joias |
| **Desenvolvimento** | Jones Mendes |
| **Design de Ambiente / Experiência** | Bernardo Brito |
| **QA / Produto** | Marcio Morais |
