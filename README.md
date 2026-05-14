# ⚽ SportHub

Plataforma web de gestão integrada de eventos esportivos amadores (focado em **futsal**), conectando **Organizadores**, **Jogadores** e **Administradores de Locais**.

O SportHub resolve o problema de comunicação dispersa em ligas amadoras, centralizando inscrições, criação de equipes, notificações em tempo real e agora, a gestão e reserva de locais (quadras e ginásios).

---

## 📋 Arquitetura e Tecnologias

Este projeto foi construído usando uma arquitetura **Monorepo** separando o Cliente (Frontend) do Servidor (Backend), com um banco de dados PostgreSQL rodando via Docker.

### Frontend (`/client`)
- **React 19** + **Vite** + **TypeScript**
- **React Router v7** para roteamento
- **Zustand** para gerenciamento de estado global (auth, preferências)
- **TanStack Query (React Query)** para data fetching, caching e sincronização
- **Socket.IO Client** para receber notificações em tempo real
- **CSS Vanilla (Dark Mode nativo)** focado em glassmorphism e cores modernas

### Backend (`/server`)
- **Node.js** + **Express** + **TypeScript**
- **Autenticação via Session** (`express-session` + `connect-pg-simple`), abandonando JWT para maior segurança em ambiente de browser (`httpOnly` cookies).
- **Prisma ORM** para manipulação segura e tipada do banco de dados
- **Socket.IO Server** rodando na mesma instância para emissão de eventos em tempo real
- **Zod** para validação de dados de entrada (body, params)

### Infraestrutura
- **PostgreSQL 16** (Via Docker Compose)

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para rodar a aplicação localmente:

### 1. Pré-requisitos
Certifique-se de ter instalado na sua máquina:
- **Node.js** (v18 ou superior)
- **Docker** e **Docker Compose**
- **Git**

### 2. Configurando o Banco de Dados
Na raiz do projeto, suba o container do PostgreSQL:

```bash
docker compose up -d
```
*Isso iniciará o banco na porta `5432` com usuário `sporthub`.*

### 3. Instalando as Dependências
Na raiz do projeto, instale as dependências de todo o monorepo de uma vez:

```bash
npm install
```

### 4. Configurando Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` na raiz do projeto (se necessário):
```bash
DATABASE_URL="postgresql://sporthub:sporthub_dev@localhost:5432/sporthub_db?schema=public"
SESSION_SECRET="sua-chave-secreta-muito-segura-aqui"
PORT=3000
CLIENT_URL="http://localhost:5173"
```

### 5. Configurando o Prisma (Migrações e Seed)
Com o banco rodando, entre na pasta do servidor para aplicar as migrações e popular dados de teste:

```bash
cd server
npx prisma migrate dev
npx prisma db seed
cd ..
```
*O Seed criará 3 usuários: um organizador (`organizer@test.com`), um jogador (`player@test.com`) e um admin de local (`admin@test.com`), todos com a senha `123456`.*

### 6. Iniciando a Aplicação
Volte para a raiz do projeto e inicie os servidores (Frontend e Backend simultaneamente):

```bash
npm run dev
```

- **Frontend:** Acesse `http://localhost:5173`
- **Backend (API):** Rodando em `http://localhost:3000`

---

## ✨ Funcionalidades Entregues

Abaixo estão os módulos implementados (Fases 1 a 5):

### Módulo do Organizador (Fase 3)
- Criação e edição de Eventos e Partidas (Futsal).
- Definição do status de publicação (Rascunho vs Ativo).
- Painel para aprovar ou rejeitar solicitações de inscrição.
- Montagem de equipes (drag and drop conceitual / alocação direta).

### Módulo do Jogador (Fase 4)
- Aba **Descobrir Eventos** (listagem de eventos públicos).
- Inscrição em eventos desejados com 1 clique.
- Notificações em tempo real (Socket.IO) sempre que o Organizador responde à sua solicitação, ou sempre que uma partida é agendada/atualizada.
- Visualização das equipes nas quais joga e partidas que disputará.

### Módulo de Locais e Reservas (Fase 5)
- Perfis `VENUE_ADMIN` conseguem criar e detalhar **Locais** (Quadras, Ginásios).
- Jogadores e organizadores podem **Solicitar Reserva** de horários em quadras cadastradas.
- Calendário Visual detalhado na página do local exibindo reservas confirmadas e pendentes.
- Sistema Anti-conflito (o backend previne a confirmação de duas reservas no mesmo horário para o mesmo local).

---

## 🔒 Escolha Arquitetural: Sessions ao invés de JWT
Optamos por utilizar **Sessions** persistidas no Postgres (via `connect-pg-simple`) em vez de JWT. 
Isso nos deu os seguintes benefícios:
1. Revogação de acesso imediata e fácil (basta deletar do banco ou destruir a sessão no server).
2. Maior segurança em SPAs contra ataques XSS, já que usamos cookies `httpOnly`.
3. Menos complexidade no frontend (sem necessidade de gerenciar Refresh Tokens).
4. Integração fácil com o **Socket.IO** (basta compartilhar o middleware do cookie de sessão).

---

Desenvolvido como projeto para PSC II.
