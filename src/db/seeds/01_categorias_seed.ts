import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deleta todos os registros existentes
  await knex("categorias").del();

  // Insere categorias padrão
  await knex("categorias").insert([
    { titulo: "Alimentação" },
    { titulo: "Transporte" },
    { titulo: "Entretenimento" },
    { titulo: "Saúde" },
    { titulo: "Educação" },
    { titulo: "Moradia" },
    { titulo: "Lazer" },
    { titulo: "Outros" }
  ]);
}
