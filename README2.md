📘 README — Controle de Gastos
🧰 Tecnologias Utilizadas
Frontend

React + Vite

Axios

TypeScript

Backend

Node.js + Fastify

Knex.js (SQLite)

Migrations & Seeds automáticos via Docker

Banco de Dados

SQLite (persistente em volume Docker)

🚀 Como Rodar o Projeto

O projeto é dividido em duas partes:

✔ Frontend rodando localmente
✔ Backend rodando dentro do Docker

Isso garante desenvolvimento rápido com Vite e backend isolado.

📦 1. Subir o Backend (Docker)

No diretório raiz do projeto:

docker compose up --build -d


Isso irá:

Construir a imagem do backend

Criar o volume persistente para o SQLite

Rodar migrations automaticamente

Rodar seeds automaticamente

Iniciar o backend em http://localhost:3333

🔍 Ver logs do backend
docker logs -f backend

🛑 Parar o backend
docker compose down

💻 2. Rodar o Frontend (Local)

Vá para a pasta do frontend:

cd frontend
npm install
npm run dev


O Vite abrirá o frontend em:

👉 http://localhost:5173

📝 Arquivo .env.development

Certifique-se de que existe:

VITE_API_URL=http://localhost:3333


É isso que permite o frontend se comunicar com o backend Docker.

🔗 3. Comunicação Front → Backend

A URL usada pelo frontend é definida via variáveis Vite:

📄 src/services/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;


Assim, todas as requisições chamam:

http://localhost:3333/sua-rota

🗄 Estrutura do Projeto
/backend
  Dockerfile
  entrypoint.sh
  src/
  knexfile.ts
  ...

/frontend
  vite.config.ts
  src/
  .env.development
  .env.production
  ...

docker-compose.yml
README.md

🧪 Testando o Backend
Healthcheck
curl http://localhost:3333/health

Exemplo de endpoints
curl http://localhost:3333/gastos
curl http://localhost:3333/metas

🐛 Problemas Comuns
❌ Frontend não consegue acessar o backend

Verifique:

Backend está rodando?

Porta 3333 está exposta?

.env.development tem:

VITE_API_URL=http://localhost:3333


Recomeçou o Vite após alterar .env?

🧹 Resetar o banco de dados

Se quiser limpar tudo:

docker compose down -v
docker compose up --build -d


Isso recria o SQLite e roda as seeds novamente.