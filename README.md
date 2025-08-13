# CONTROLE DE GASTOS
# Integrantes 
- Beatriz Cupa Newman 
- Júlia Machado Duran  
- Luigi Bertoli Menezes 
# Objetivo da Aplicação e seu uso
Uma aplicação de controle de gastos é extremamente relevante uma vez que resolve um problema que atinge milhares de pessoas, que é não saber para onde está indo o dinheiro. 
Dessa maneira, a aplicação será útil para registrar os gastos e assim ter uma organização financeira melhor, permite definir limite para cada categoria (alimentação, viagem, roupas…), e criar um controle de metas, por exemplo. 
# Componentes a serem utilizados 

## 🚀 Como executar o projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação e configuração

1. **Clone o repositório e entre na pasta do projeto**
```bash
cd cloud
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Executar as migrações para criar as tabelas
npx knex migrate:latest
```

4. **Execute a aplicação em modo de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:3333`

### Como o arquivo .db é gerado

O arquivo `app-data.db` (banco de dados SQLite) é criado automaticamente quando você executa as migrações. O processo funciona assim:

1. **Primeira execução**: Quando você roda `npx knex migrate:latest` pela primeira vez:
   - O Knex cria automaticamente o arquivo `src/db/app-data.db` (se não existir)
   - Executa todas as migrações pendentes
   - Cria as tabelas definidas nas migrações

2. **Estrutura do banco**: O arquivo `.db` contém:
   - Tabelas criadas pelas migrações
   - Dados inseridos pela aplicação
   - Metadados do SQLite

3. **Ambientes diferentes**: O `knexfile.ts` define bancos diferentes para cada ambiente:
   - **Development**: `src/db/app-data.db`
   - **Test**: `src/db/test.db`
   - **Production**: `src/db/production.db`

### O que são Migrations?

**Migrations** são como "receitas" que definem como criar e modificar a estrutura do banco de dados. Imagine que você está construindo uma casa:

- **Migration = Planta da casa**: Define onde ficam as paredes, portas, janelas
- **Banco de dados = Casa construída**: O resultado final baseado nas plantas

#### Como funcionam:

1. **Cada migration é um arquivo** que contém instruções para:
   - Criar tabelas
   - Adicionar colunas
   - Modificar estruturas
   - Inserir dados iniciais

2. **Ordem cronológica**: As migrations são executadas em ordem de data/hora
   - `20231201_001_criar_tabela_usuarios.js`
   - `20231201_002_criar_tabela_gastos.js`
   - `20231202_001_adicionar_categoria_gastos.js`

3. **Controle de versão**: O banco "lembra" quais migrations já foram executadas
   - Só executa as novas migrations
   - Evita executar a mesma migration duas vezes

#### Exemplo prático:
```javascript
// Migration: criar_tabela_usuarios.js
exports.up = function(knex) {
  return knex.schema.createTable('usuarios', table => {
    table.increments('id').primary()
    table.string('nome').notNullable()
    table.string('email').unique().notNullable()
    table.timestamps(true, true)
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('usuarios')
}
```

### Comandos úteis

**Desenvolvimento:**
```bash
npm run dev          # Executa o servidor em modo de desenvolvimento com hot reload
```

**Banco de dados:**
```bash
npx knex migrate:make nome_da_migracao    # Cria uma nova migração
npx knex migrate:latest                   # Executa todas as migrações pendentes
npx knex migrate:rollback                 # Reverte a última migração
npx knex migrate:status                   # Mostra o status das migrações
```

**Testes:**
```bash
npm test             # Executa os testes (quando implementados)
```

### Versionamento e Git

**O que deve ser versionado:**
- ✅ Arquivos de migração (`src/db/migrations/`)
- ✅ Código fonte (`src/`)
- ✅ Configurações (`package.json`, `knexfile.ts`)
- ✅ Documentação (`README.md`)

**O que NÃO deve ser versionado:**
- ❌ Banco de dados (`src/db/*.db`)
- ❌ Dependências (`node_modules/`)
- ❌ Variáveis de ambiente (`.env`)

### Estrutura do projeto
```
cloud/
├── src/
│   ├── db/
│   │   ├── app-data.db          # Banco de dados SQLite (não versionado)
│   │   └── migrations/          # Arquivos de migração (versionados)
│   ├── database.ts              # Configuração do banco de dados
│   └── server.ts                # Servidor Fastify
├── knexfile.ts                  # Configuração do Knex
├── package.json                 # Dependências e scripts
└── README.md                    # Documentação
```

### Tecnologias utilizadas
- **Fastify**: Framework web para Node.js
- **Knex.js**: Query builder para banco de dados
- **SQLite**: Banco de dados local
- **TypeScript**: Linguagem de programação
- **TSX**: Executor de TypeScript para desenvolvimento
