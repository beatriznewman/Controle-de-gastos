# Sistema de Controle de Gastos e Metas - Backend

Sistema para controle de gastos pessoais com metas por categoria, desenvolvido em Node.js com Fastify e SQLite.

> **Nota**: Este é o backend da aplicação. O projeto completo está organizado com backend e frontend separados.

## Estrutura do Projeto

```
backend/
├── src/
│   ├── app.ts           # Aplicação principal com todas as rotas
│   ├── server.ts        # Servidor HTTP
│   ├── database.ts      # Configuração do banco de dados
│   ├── types/           # Definições de tipos TypeScript
│   └── db/
│       ├── migrations/  # Migrações do banco de dados
│       ├── seeds/       # Dados iniciais
│       └── app-data.db  # Banco SQLite (não versionado)
├── knexfile.ts          # Configuração do Knex.js
└── package.json         # Dependências do backend
```

## Funcionalidades

### Gastos
- ✅ Criar, listar, atualizar e deletar gastos
- ✅ Associar gastos a categorias
- ✅ Validação de dados

### Categorias
- ✅ Criar, listar, atualizar e deletar categorias
- ✅ Proteção contra exclusão de categorias com gastos ou metas

### Metas por Categoria
- ✅ Criar, listar, atualizar e deletar metas
- ✅ **NOVO**: Cálculo automático do status das metas baseado nos gastos
- ✅ **NOVO**: Verificação se a meta foi atingida (gastos ≤ valor da meta)
- ✅ **NOVO**: Cálculo de progresso e valor restante
- ✅ **NOVO**: Atualização automática do status ao criar/editar/deletar gastos
- ✅ **NOVO**: Estatísticas por categoria

## Estrutura do Banco de Dados

### Tabela `gastos`
- `id` (PK)
- `valor` (decimal)
- `dataDoGasto` (timestamp)
- `descricao` (text)
- `categ_id` (FK para categorias)

### Tabela `categorias`
- `id` (PK)
- `titulo` (text)

### Tabela `metas`
- `id` (PK)
- `valor` (decimal) - valor máximo permitido
- `data_in` (timestamp) - início do período
- `data_fim` (timestamp) - fim do período
- `metaBatida` (boolean) - calculado automaticamente
- `id_gasto` (FK para gastos, opcional)
- `categ_id` (FK para categorias)

## API Endpoints

### Gastos
- `GET /gastos` - Listar todos os gastos
- `GET /gastos/:id` - Buscar gasto por ID
- `POST /gastos` - Criar novo gasto
- `PUT /gastos/:id` - Atualizar gasto
- `DELETE /gastos/:id` - Deletar gasto

### Categorias
- `GET /categorias` - Listar todas as categorias
- `GET /categorias/:id` - Buscar categoria por ID
- `POST /categorias` - Criar nova categoria
- `PUT /categorias/:id` - Atualizar categoria
- `DELETE /categorias/:id` - Deletar categoria

### Metas
- `GET /metas` - Listar todas as metas com status calculado
- `GET /metas/:id` - Buscar meta por ID com status calculado
- `POST /metas` - Criar nova meta
- `PUT /metas/:id` - Atualizar meta
- `DELETE /metas/:id` - Deletar meta
- `GET /metas/categoria/:categoriaId` - **NOVO**: Ver metas e estatísticas por categoria

## Lógica de Cálculo das Metas

### Como funciona:
1. **Período da Meta**: Considera apenas gastos entre `data_in` e `data_fim`
2. **Categoria**: Soma apenas gastos da categoria específica da meta
3. **Status**: Meta é considerada "batida" se `totalGastos ≤ valorMeta`
4. **Progresso**: Calculado como `(totalGastos / valorMeta) * 100`
5. **Restante**: `valorMeta - totalGastos` (mínimo 0)

### Atualização Automática:
- Ao criar um gasto: recalcula todas as metas da categoria
- Ao atualizar um gasto: recalcula metas das categorias antiga e nova
- Ao deletar um gasto: recalcula todas as metas da categoria

## Exemplos de Uso

### Criar uma meta
```json
POST /metas
{
  "valor": 1000.00,
  "data_fim": "2024-12-31",
  "categoria_id": 1
}
```

### Ver status de uma meta
```json
GET /metas/1
```
Resposta:
```json
{
  "meta": { ... },
  "totalGastos": 750.00,
  "metaBatida": true,
  "progresso": 75.0,
  "restante": 250.00
}
```

### Ver metas por categoria
```json
GET /metas/categoria/1
```
Resposta:
```json
{
  "categoria": { ... },
  "metas": [ ... ],
  "estatisticas": {
    "totalGastosCategoria": 1500.00,
    "totalMetas": 3,
    "metasAtivas": 2,
    "metasBatidas": 1,
    "metasNaoBatidas": 0,
    "taxaSucesso": 33.33
  }
}
```

## Instalação e Execução

1. **Entre na pasta do backend**
   ```bash
   cd backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute as migrações**
   ```bash
   npm run migrate
   ```

4. **Execute os seeds (opcional)**
   ```bash
   npm run seed
   ```

5. **Inicie o servidor**
   ```bash
   npm run dev
   ```

A API estará disponível em: `http://localhost:3333`

## Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev          # Executa o servidor em modo de desenvolvimento com hot reload
```

### Banco de dados
```bash
npm run migrate:make -- nome_da_migracao    # Cria uma nova migração
npm run migrate                             # Executa todas as migrações pendentes
npm run migrate:rollback                    # Reverte a última migração
npm run seed:make -- nome_do_seed           # Cria um novo seed
npm run seed                                # Executa todos os seeds
```

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web
- **Knex.js** - Query builder
- **SQLite** - Banco de dados
- **TypeScript** - Tipagem estática

## Ambientes

O projeto suporta diferentes ambientes configurados no `knexfile.ts`:

- **Development**: `./src/db/app-data.db`
- **Test**: `./src/db/test.db`
- **Production**: `./src/db/production.db`

O ambiente é determinado pela variável `NODE_ENV`.

## Testes

- Testes unitários (Vitest) 😒
  - `npm test`: roda todos os testes unitários uma vez.
  - `npm run test:watch`: roda os testes unitários em modo watch.

- Testes E2E (Playwright) 😒
  - Requer que a API esteja rodando (por exemplo, via Docker ou `npm run dev`).
  - `npm run test:e2e`: executa a suíte E2E que valida fluxos principais da API.

### Rodando testes com Docker

- Backend já sobe pelo Docker Compose, então você pode:
  - Rodar testes unitários dentro do container:
    - `docker-compose run --rm backend npm test`
  - Rodar testes E2E (API deve estar acessível em \`http://localhost:3333\`):
    - `docker-compose run --rm backend npm run test:e2e`