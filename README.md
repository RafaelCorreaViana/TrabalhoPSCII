# SportHub

Plataforma web de gestão integrada de eventos esportivos amadores (focado em **futsal**), conectando **Organizadores**, **Jogadores** e **Administradores de Locais**.

## Tecnologias Principais

- **Frontend**: React 19, Vite, TypeScript, Zustand, TanStack Query, Zod.
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.IO.
- **Autenticação**: Session-based (`express-session` + `connect-pg-simple`).

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16
- Docker (Opcional, para rodar o banco de dados)

## Como rodar o projeto

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco de dados:
   - Crie um banco de dados PostgreSQL com o nome `sporthub_db`.
   - Se preferir, use o Docker Compose: `docker compose up -d`.

3. Configure as variáveis de ambiente:
   - Duplique o arquivo `.env.example` na pasta `server/` e renomeie para `.env`.
   - Ajuste a `DATABASE_URL` se necessário (já vem configurada para o ambiente local).

4. Rode as migrações do Prisma e o seed de dados:
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   cd ..
   ```

5. Inicie o servidor de desenvolvimento (Frontend e Backend simultaneamente):
   ```bash
   npm run dev
   ```

Acesse o frontend em `http://localhost:5173` e o backend estará rodando em `http://localhost:3000`.

## Estrutura do Projeto (Monorepo)

- `/client` - Aplicação React + Vite (Frontend)
- `/server` - API Node.js + Express (Backend)
- `package.json` - Scripts para orquestrar ambos os projetos simultaneamente.
