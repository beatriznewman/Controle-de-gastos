import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("gastos", (table) => {
    table.increments("id").primary();
    table.decimal("valor", 10, 2).notNullable();
    table.timestamp("dataDoGasto").defaultTo(knex.fn.now());
    table.text("descricao").notNullable();
    table.integer("categ_id").unsigned().notNullable();
    
    // Chave estrangeira para a tabela categorias
    table.foreign("categ_id").references("id").inTable("categorias").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("gastos");
}
