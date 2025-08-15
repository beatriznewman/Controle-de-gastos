import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deleta todos os registros existentes
  await knex("metas").del();

  // Busca as categorias e gastos existentes
  const categorias = await knex("categorias").select("id", "titulo");
  const gastos = await knex("gastos").select("id", "categ_id");

  if (categorias.length === 0) {
    console.log("Nenhuma categoria encontrada. Execute primeiro o seed de categorias.");
    return;
  }

  // Encontra os IDs das categorias
  const alimentacaoId = categorias.find(c => c.titulo === "Alimentação")?.id;
  const transporteId = categorias.find(c => c.titulo === "Transporte")?.id;
  const entretenimentoId = categorias.find(c => c.titulo === "Entretenimento")?.id;

  // Encontra um gasto de alimentação para associar à meta
  const gastoAlimentacao = gastos.find(g => g.categ_id === alimentacaoId);

  // Insere metas de exemplo
  await knex("metas").insert([
    {
      valor: 500.00,
      data_in: "2024-08-01 00:00:00",
      data_fim: "2024-08-31",
      metaBatida: false,
      id_gasto: gastoAlimentacao?.id || null,
      categ_id: alimentacaoId
    },
    {
      valor: 300.00,
      data_in: "2024-08-01 00:00:00",
      data_fim: "2024-08-31",
      metaBatida: false,
      id_gasto: null,
      categ_id: transporteId
    },
    {
      valor: 200.00,
      data_in: "2024-08-01 00:00:00",
      data_fim: "2024-08-31",
      metaBatida: false,
      id_gasto: null,
      categ_id: entretenimentoId
    }
  ]);
}
