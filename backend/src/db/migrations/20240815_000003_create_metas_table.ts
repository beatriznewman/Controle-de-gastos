import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("metas", (table) => {
    table.increments("id").primary();
    table.decimal("valor", 10, 2).notNullable();
    table.timestamp("data_in").defaultTo(knex.fn.now());
    table.text("data_fim").notNullable();
    table.boolean("metaBatida").defaultTo(false);
    table.integer("id_gasto").unsigned();
    table.integer("categ_id").unsigned().notNullable();
    
    // Chave estrangeira para a tabela gastos
    table.foreign("id_gasto").references("id").inTable("gastos").onDelete("SET NULL");
    
    // Chave estrangeira para a tabela categorias
    table.foreign("categ_id").references("id").inTable("categorias").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("metas");
}
