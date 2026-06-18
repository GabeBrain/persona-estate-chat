# PLAENGE — Persona Sintética + Interface de Entrevista

POC de entrevista simulada com persona sintética construída a partir de entrevistas qualitativas com potenciais compradores do empreendimento PLAENGE em Governador Celso Ramos/SC.

---

## Estrutura do Projeto

```
plaenge-poc/
├── interviews/          ← Transcrições das entrevistas originais
├── persona/
│   └── persona.md       ← Persona sintética gerada (Renato Borges, 57 anos)
├── frontend/            ← React + Vite + Tailwind CSS
└── backend/             ← Node.js + Express + Anthropic SDK
```

---

## Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Chave de API da Anthropic

### 1. Backend

```bash
cd backend
npm install

# Crie o arquivo .env a partir do exemplo
cp .env.example .env
# Edite .env e adicione sua ANTHROPIC_API_KEY

npm run dev
# Backend rodando em http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend rodando em http://localhost:5173
```

Acesse `http://localhost:5173` no navegador.

---

## Funcionalidades

| Recurso | Detalhe |
|---|---|
| **Chat em streaming** | Respostas da persona chegam em tempo real |
| **Nível de interesse dinâmico** | Indicador ALTO / MÉDIO / BAIXO atualizado a cada resposta |
| **Ficha da persona** | Painel lateral com perfil, critérios e objeções |
| **Persona.md completo** | Modal com toda a ficha da persona |
| **Modo debug** | Exibe modelo, tokens de entrada e saída |
| **Exportar transcrição** | Salva o histórico em `.md` |
| **Encerrar entrevista** | Digite `/encerrar` ou clique no botão para gerar avaliação |
| **Painel de avaliação** | Resumo, interesse final, objeções, pontos positivos e próximos passos |
| **Responsivo** | Funciona em desktop e mobile |

---

## Persona Sintética — Renato Borges

Construída a partir da síntese de duas entrevistas qualitativas:

- **Dimitrios Apostolidis** (68 anos, arquiteto/empresário, SP) — interesse ALTO, teto R$ 5 mi, valoriza área verde e privacidade, pergunta sobre infraestrutura médica e acesso à praia
- **Fabiane** (49 anos, empresária multi-ramo, Chapecó/Floripa) — interesse MÉDIO, teto R$ 3 mi, preocupada com acesso no verão, prefere lote para construir

**Renato Borges** (57 anos, Curitiba) combina os dois perfis: empresário com trabalho remoto, renda ~R$ 100k/mês, teto de R$ 4–4,5 mi, prefere lote para construir, preocupado com acesso e infraestrutura médica.

---

## Modelo de IA

- **Modelo:** `claude-sonnet-4-6`
- **Max tokens:** 1000 por resposta
- **Streaming:** SSE (Server-Sent Events)
- **A chave de API fica apenas no backend** — nunca exposta no frontend

---

## Variáveis de Ambiente

```
ANTHROPIC_API_KEY=sk-ant-...   ← obrigatório
PORT=3001                       ← opcional (padrão: 3001)
```
