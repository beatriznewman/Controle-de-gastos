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

  // Função para calcular se a meta foi batida
  async function calcularMetaBatida(categoriaId: number, dataInicio: string, dataFim: string, valorMeta: number): Promise<boolean> {
    const totalGastos = await knex("gastos")
      .sum("valor as total")
      .where("categ_id", categoriaId)
      .whereBetween("dataDoGasto", [dataInicio, dataFim])
      .first();
    
    const valorTotalGastos = totalGastos?.total || 0;
    return valorTotalGastos <= valorMeta;
  }

  // Insere metas de exemplo com cálculo correto
  const dataInicio = "2024-08-01 00:00:00";
  const dataFim = "2024-08-31 23:59:59";

  const metaAlimentacao = {
    valor: 500.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(alimentacaoId!, dataInicio, dataFim, 500.00),
    id_gasto: gastoAlimentacao?.id || null,
    categ_id: alimentacaoId
  };

  const metaTransporte = {
    valor: 300.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(transporteId!, dataInicio, dataFim, 300.00),
    id_gasto: null,
    categ_id: transporteId
  };

  const metaEntretenimento = {
    valor: 200.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(entretenimentoId!, dataInicio, dataFim, 200.00),
    id_gasto: null,
    categ_id: entretenimentoId
  };

  await knex("metas").insert([metaAlimentacao, metaTransporte, metaEntretenimento]);

  console.log("Metas criadas com status calculado baseado nos gastos existentes!");
}
