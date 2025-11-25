## 📘 README — Controle de Gastos (Reescrito)

Este é o guia de inicialização e estrutura do projeto de **Controle de Gastos**, que é composto por um **Frontend** em React/Vite e um **Backend** em Node.js/Fastify rodando em Docker.

-----

## 🧰 Tecnologias Utilizadas

### Frontend

  * **React + Vite:** Estrutura e *build* rápido.
  * **Axios:** Cliente HTTP para comunicação com a API.
  * **TypeScript:** Tipagem estática para maior segurança.

### Backend

  * **Node.js + Fastify:** Servidor web rápido e eficiente.
  * **Knex.js (SQLite):** Query builder e migrações.
  * **Docker:** Conteinerização para ambiente isolado e consistente.

### Banco de Dados

  * **SQLite:** Banco de dados simples, persistente através de um **volume Docker**.
  * **Inicialização Automática:** Migrations e Seeds são executados automaticamente ao iniciar o Docker.

-----

## 🚀 Como Rodar o Projeto

O projeto é configurado para ter o **Frontend rodando localmente** (Vite) e o **Backend rodando dentro do Docker**.

### 📦 1. Subir o Backend (Docker)

No diretório **raiz** do projeto, execute o comando:

```bash
docker compose up --build -d
```

**O que este comando faz:**

1.  Constroi a imagem Docker do backend.
2.  Cria o volume persistente para o banco de dados SQLite.
3.  Executa automaticamente as **Migrations** e **Seeds** para popular o DB.
4.  Inicia o backend em **`http://localhost:3333`**.

| Ação | Comando |
| :--- | :--- |
| **Ver logs** do backend | `docker logs -f backend` |
| **Parar e remover** o backend | `docker compose down` |

### 💻 2. Rodar o Frontend (Local)

1.  Acesse a pasta do frontend:
    ```bash
    cd frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

O **Vite** abrirá o frontend em: **`http://localhost:5173`**

-----

## 🔗 3. Comunicação Front → Backend

Para que o frontend acesse o backend em Docker, a configuração da URL da API é essencial.

### 📝 Variável de Ambiente (`.env.development`)

Certifique-se de que este arquivo na pasta `frontend/` contenha:

```bash
VITE_API_URL=http://localhost:3333
```

### 📄 Configuração do Axios

A variável `VITE_API_URL` é utilizada na configuração do cliente HTTP:

`src/services/api.ts`

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa a URL definida no .env
});

export default api;
```

Assim, todas as requisições do frontend são direcionadas para **`http://localhost:3333/sua-rota`**.

-----

## 🗄 Estrutura do Projeto

| Diretório/Arquivo | Conteúdo Principal |
| :--- | :--- |
| `/backend` | Código-fonte do servidor Node.js/Fastify. |
| `backend/Dockerfile` | Instruções para construir a imagem Docker do backend. |
| `backend/entrypoint.sh` | Script que executa migrações e *seeds* ao iniciar o container. |
| `/frontend` | Código-fonte da aplicação React/Vite. |
| `frontend/.env.development` | Variáveis de ambiente para desenvolvimento (ex: `VITE_API_URL`). |
| `docker-compose.yml` | Definição dos serviços Docker (backend e volume DB). |

-----

## 🧪 Testando o Backend

Você pode verificar a saúde da API e testar alguns *endpoints* via `curl`:

| Teste | Comando |
| :--- | :--- |
| **Healthcheck** | `curl http://localhost:3333/health` |
| **Exemplo: Gastos** | `curl http://localhost:3333/gastos` |
| **Exemplo: Metas** | `curl http://localhost:3333/metas` |

-----

## 🐛 Problemas Comuns

### ❌ Frontend não consegue acessar o backend

1.  **Backend está rodando?** Verifique os logs com `docker logs -f backend`.
2.  **Porta 3333 está acessível?** Tente o `curl http://localhost:3333/health`.
3.  **Variável de Ambiente correta?** Confirme que `frontend/.env.development` tem:
    ```bash
    VITE_API_URL=http://localhost:3333
    ```
4.  **Reiniciou o Vite?** Se você alterou o `.env.development`, você precisa rodar `npm run dev` novamente.

### 🧹 Resetar o Banco de Dados (SQLite)

Para limpar completamente o banco de dados e rodar as *migrations* e *seeds* novamente, use o comando `down` com a flag `-v` (para remover volumes):

```bash
docker compose down -v
docker compose up --build -d
```

Isso garante uma recriação limpa do volume persistente.
