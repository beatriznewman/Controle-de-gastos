import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deleta todos os registros existentes
  await knex("gastos").del();

  // Busca as categorias existentes
  const categorias = await knex("categorias").select("id", "titulo");

  if (categorias.length === 0) {
    console.log("Nenhuma categoria encontrada. Execute primeiro o seed de categorias.");
    return;
  }

  // Encontra os IDs das categorias
  const alimentacaoId = categorias.find(c => c.titulo === "Alimentação")?.id;
  const transporteId = categorias.find(c => c.titulo === "Transporte")?.id;
  const entretenimentoId = categorias.find(c => c.titulo === "Entretenimento")?.id;
  const saudeId = categorias.find(c => c.titulo === "Saúde")?.id;

  // Insere gastos de exemplo
  await knex("gastos").insert([
    {
      valor: 45.50,
      dataDoGasto: "2024-08-15 12:30:00",
      descricao: "Almoço no restaurante",
      categ_id: alimentacaoId
    },
    {
      valor: 120.00,
      dataDoGasto: "2024-08-14 15:45:00",
      descricao: "Combustível",
      categ_id: transporteId
    },
    {
      valor: 32.00,
      dataDoGasto: "2024-08-13 20:00:00",
      descricao: "Cinema",
      categ_id: entretenimentoId
    },
    {
      valor: 89.75,
      dataDoGasto: "2024-08-12 18:20:00",
      descricao: "Compras no supermercado",
      categ_id: alimentacaoId
    },
    {
      valor: 150.00,
      dataDoGasto: "2024-08-11 14:15:00",
      descricao: "Consulta médica",
      categ_id: saudeId
    }
  ]);
}
