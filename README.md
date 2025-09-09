# CONTROLE DE GASTOS

## Integrantes 
- Beatriz Cupa Newman 
- Júlia Machado Duran  
- Luigi Bertoli Menezes 

## Objetivo da Aplicação e seu uso

Uma aplicação de controle de gastos é extremamente relevante uma vez que resolve um problema que atinge milhares de pessoas, que é não saber para onde está indo o dinheiro. 

Dessa maneira, a aplicação será útil para registrar os gastos e assim ter uma organização financeira melhor, permite definir limite para cada categoria (alimentação, viagem, roupas…), e criar um controle de metas, por exemplo.

## Estrutura do Projeto

O projeto está organizado com arquitetura de microsserviços executada via Vagrant:

```
Controle-de-gastos/
├── backend/                    # 🔧 API REST com Fastify + SQLite
│   ├── src/
│   │   ├── app.ts             # Aplicação principal com todas as rotas
│   │   ├── server.ts          # Servidor HTTP
│   │   ├── database.ts        # Configuração do banco de dados
│   │   ├── types/             # Definições de tipos TypeScript
│   │   └── db/
│   │       ├── migrations/    # Migrações do banco de dados
│   │       ├── seeds/         # Dados iniciais
│   │       └── app-data.db    # Banco SQLite (não versionado)
│   ├── knexfile.ts            # Configuração do Knex.js
│   ├── package.json           # Dependências do backend
│   └── README.md              # Documentação do backend
├── frontend/                   # 🎨 Interface React/Vite
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── CategoriaManager.tsx
│   │   │   ├── GastoManager.tsx
│   │   │   └── MetaManager.tsx
│   │   ├── services/
│   │   │   └── api.ts         # Cliente HTTP (Axios)
│   │   ├── App.tsx            # Componente principal
│   │   └── main.tsx           # Entry point
│   ├── vite.config.ts         # Configuração do Vite (proxy para backend)
│   ├── package.json           # Dependências do frontend
│   └── README.md              # Documentação do frontend
├── Vagrantfile                 # 🚀 Configuração das 3 VMs (Proxy + Frontend + Backend)
├── VAGRANT.md                  # 📖 Guia detalhado do Vagrant
└── README.md                   # 📋 Documentação principal
```

### 🏗️ **Arquitetura de Deployment:**

- **VM1 (Proxy)**: Nginx como proxy reverso e gateway único
- **VM2 (Frontend)**: Servidor Vite isolado da internet
- **VM3 (Backend)**: API Fastify + SQLite com isolamento máximo

## 🚀 Como executar o projeto

### Opção 1: Usando Vagrant (Recomendado)

#### Pré-requisitos
- [Vagrant](https://www.vagrantup.com/downloads) (versão 2.0 ou superior)
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) (versão 6.0 ou superior)
- **Mínimo 4GB RAM livres** (total 8GB RAM recomendados)

#### Execução
```bash
# Iniciar todo o projeto com um comando
vagrant up

# Ver status das VMs
vagrant status

# Ver logs em tempo real (opcional)
vagrant ssh frontend -c 'tail -f /var/log/frontend.log'
vagrant ssh backend -c 'tail -f /var/log/backend.log'
```

⏱️ **Tempo de primeira execução**: 15-20 minutos (download + instalação)

🎯 **Após a inicialização**: **http://localhost:8081** (único acesso)

#### Arquitetura Vagrant

O projeto implementa uma arquitetura de 3 camadas com isolamento de rede progressivo:

```
┌─────────────────────────────────────────────────────────────┐
│                    HOST (localhost:8081)                   │
│                     ↕ (proxy reverso)                      │
└─────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────┐
│  VM1: PROXY (192.168.56.10)                               │
│  • Conexão: Host + Internet + Frontend                     │
│  • Nginx como gateway único                                │
└─────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────┐
│  VM2: FRONTEND (192.168.56.11 + 192.168.57.10)           │
│  • Conexão: Proxy + Backend                               │
│  • Internet: Removida após provisionamento                 │
└─────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────┐
│  VM3: BACKEND (192.168.57.11)                             │
│  • Conexão: APENAS Frontend                               │
│  • Internet: Removida após provisionamento                 │
└─────────────────────────────────────────────────────────────┘
```

**Processo de Provisionamento (3 Fases):**

1. **Fase 1 - Instalação**: Todas as VMs com NAT para instalar dependências
   - 📦 Instala Node.js 22, dependências npm
   - 🗄️ Configura banco de dados (migrate + seed)
   - ⚙️ Cria serviços systemd

2. **Fase 2 - Preparação**: Cria scripts de isolamento (sem aplicar)
   - 🔒 VM2 (Frontend): Prepara script para remover NAT
   - 🔒 VM3 (Backend): Prepara script para remover NAT

3. **Fase 3 - Finalização**: Inicia serviços com rede ativa
   - 🚀 Sistema funcionando sem isolamento ainda

**Aplicar Isolamento Manual (após vagrant up):**
```bash
vagrant ssh frontend -c 'sudo /home/vagrant/apply_network_isolation.sh'
vagrant ssh backend -c 'sudo /home/vagrant/apply_network_isolation.sh'
```

**Matriz de Conectividade Final (Isolamento Completo):**
| De → Para | Host | Internet | Proxy | Frontend | Backend |
|-----------|------|----------|-------|----------|---------|
| Host | - | ✅ | ✅ (8081) | ❌ **BLOQUEADO** | ❌ **BLOQUEADO** |
| Proxy | ✅ | ✅ | - | ✅ | ❌ |
| Frontend | ❌ | ❌ **SEM NAT** | ✅ | - | ✅ |
| Backend | ❌ | ❌ **SEM NAT** | ❌ | ✅ | - |

⚠️ **Segurança**: Frontend e Backend são completamente isolados do host e internet.

#### Comandos úteis do Vagrant
```bash
# Gerenciamento básico
vagrant status          # Ver status das VMs
vagrant up              # Iniciar todas as VMs
vagrant halt            # Parar todas as VMs
vagrant destroy         # Destruir todas as VMs (limpa tudo)

# Acesso SSH às VMs
vagrant ssh proxy       # Conectar ao proxy
vagrant ssh frontend    # Conectar ao frontend  
vagrant ssh backend     # Conectar ao backend

# Provisionamento específico
vagrant provision       # Re-executar provisionamento
vagrant up --provision  # Iniciar com provisionamento forçado
```

#### Monitoramento e logs
```bash
# Logs em tempo real
vagrant ssh backend -c 'tail -f /var/log/backend.log'
vagrant ssh frontend -c 'tail -f /var/log/frontend.log'

# Status dos serviços
vagrant ssh backend -c 'systemctl status backend'
vagrant ssh frontend -c 'systemctl status frontend'

# Verificar isolamento de rede
vagrant ssh frontend -c 'ping -c 2 8.8.8.8'  # Deve falhar
vagrant ssh backend -c 'ping -c 2 8.8.8.8'   # Deve falhar
vagrant ssh proxy -c 'ping -c 2 8.8.8.8'     # Deve funcionar
```

### Opção 2: Desenvolvimento Local

#### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Backend

1. **Entre na pasta do backend**
```bash
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Executar as migrações para criar as tabelas
npm run migrate

# Opcional: Executar seeds para dados iniciais
npm run seed
```

4. **Execute a aplicação em modo de desenvolvimento**
```bash
npm run dev
```

A API estará disponível em: `http://localhost:3333`

### Frontend

O frontend está em desenvolvimento. Quando estiver pronto, as instruções serão adicionadas aqui.

## 📊 Funcionalidades da API

### Gastos
- `GET /gastos` - Listar todos os gastos
- `GET /gastos/:id` - Buscar gasto por ID
- `POST /gastos` - Criar novo gasto
- `PUT /gastos/:id` - Atualizar gasto
- `DELETE /gastos/:id` - Excluir gasto

### Categorias
- `GET /categorias` - Listar todas as categorias
- `GET /categorias/:id` - Buscar categoria por ID
- `POST /categorias` - Criar nova categoria
- `PUT /categorias/:id` - Atualizar categoria
- `DELETE /categorias/:id` - Excluir categoria

### Metas
- `GET /metas` - Listar todas as metas
- `GET /metas/:id` - Buscar meta por ID
- `POST /metas` - Criar nova meta
- `PUT /metas/:id` - Atualizar meta
- `DELETE /metas/:id` - Excluir meta
- `GET /metas/:id/status` - Obter status detalhado da meta
- `GET /categorias/:id/metas` - Listar metas de uma categoria

## 🗄️ Estrutura do Banco de Dados

### Tabelas

1. **categorias**
   - `id` (Primary Key)
   - `titulo` (VARCHAR)

2. **gastos**
   - `id` (Primary Key)
   - `valor` (DECIMAL)
   - `dataDoGasto` (DATE)
   - `descricao` (TEXT)
   - `categ_id` (Foreign Key → categorias.id)

3. **metas**
   - `id` (Primary Key)
   - `valor` (DECIMAL)
   - `data_in` (DATE)
   - `data_fim` (DATE)
   - `metaBatida` (BOOLEAN)
   - `id_gasto` (Foreign Key → gastos.id, nullable)
   - `categ_id` (Foreign Key → categorias.id)

## 🛠️ Comandos úteis

### Desenvolvimento
```bash
cd backend
npm run dev          # Executa o servidor em modo de desenvolvimento com hot reload
```

### Banco de dados
```bash
cd backend
npm run migrate:make -- nome_da_migracao    # Cria uma nova migração
npm run migrate                             # Executa todas as migrações pendentes
npm run migrate:rollback                    # Reverte a última migração
npm run seed:make -- nome_do_seed           # Cria um novo seed
npm run seed                                # Executa todos os seeds
```

## 🧪 Tecnologias utilizadas

### Backend
- **Fastify**: Framework web para Node.js
- **Knex.js**: Query builder para banco de dados
- **SQLite**: Banco de dados local
- **TypeScript**: Linguagem de programação
- **TSX**: Executor de TypeScript para desenvolvimento

### Frontend
- Em desenvolvimento

## 📝 Versionamento e Git

**O que deve ser versionado:**
- ✅ Arquivos de migração (`backend/src/db/migrations/`)
- ✅ Seeds (`backend/src/db/seeds/`)
- ✅ Código fonte (`backend/src/`, `frontend/`)
- ✅ Configurações (`backend/package.json`, `backend/knexfile.ts`)
- ✅ Documentação (`README.md`, `backend/README.md`)

**O que NÃO deve ser versionado:**
- ❌ Banco de dados (`backend/src/db/*.db`)
- ❌ Dependências (`backend/node_modules/`)
- ❌ Variáveis de ambiente (`.env`)

## 🔧 Ambientes

O projeto suporta diferentes ambientes configurados no `backend/knexfile.ts`:

- **Development**: `backend/src/db/app-data.db`
- **Test**: `backend/src/db/test.db`
- **Production**: `backend/src/db/production.db`

O ambiente é determinado pela variável `NODE_ENV`.

## 📋 Como o arquivo .db é gerado

O arquivo `app-data.db` (banco de dados SQLite) é criado automaticamente quando você executa as migrações. O processo funciona assim:

1. **Primeira execução**: Quando você roda `npm run migrate` pela primeira vez (dentro da pasta `backend/`):
   - O Knex cria automaticamente o arquivo `backend/src/db/app-data.db` (se não existir)
   - Executa todas as migrações pendentes
   - Cria as tabelas definidas nas migrações

2. **Estrutura do banco**: O arquivo `.db` contém:
   - Tabelas criadas pelas migrações
   - Dados inseridos pela aplicação
   - Metadados do SQLite

## 🤖 Exemplo de uso da API

### Criar uma categoria
```bash
curl -X POST http://localhost:3333/categorias \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Alimentação"}'
```

### Criar um gasto
```bash
curl -X POST http://localhost:3333/gastos \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 25.50,
    "descricao": "Almoço no restaurante",
    "categoria_id": 1,
    "dataDoGasto": "2024-01-15"
  }'
```

### Criar uma meta
```bash
curl -X POST http://localhost:3333/metas \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 500.00,
    "data_in": "2024-01-01",
    "data_fim": "2024-01-31",
    "categoria_id": 1
  }'
```
