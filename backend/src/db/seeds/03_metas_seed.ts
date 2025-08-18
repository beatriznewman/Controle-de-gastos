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
  const saudeId = categorias.find(c => c.titulo === "Saúde")?.id;

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
    return valorTotalGastos > valorMeta;
  }

  // Insere metas de exemplo com cálculo correto
  const dataInicio = "2024-08-01 00:00:00";
  const dataFim = "2024-08-31 23:59:59";

  const metaAlimentacao = {
    valor: 200.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(alimentacaoId!, dataInicio, dataFim, 200.00),
    id_gasto: gastoAlimentacao?.id || null,
    categ_id: alimentacaoId
  };

  const metaTransporte = {
    valor: 250.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(transporteId!, dataInicio, dataFim, 250.00),
    id_gasto: null,
    categ_id: transporteId
  };

  const metaEntretenimento = {
    valor: 60.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(entretenimentoId!, dataInicio, dataFim, 60.00),
    id_gasto: null,
    categ_id: entretenimentoId
  };

  // Meta que será ultrapassada (para testar metaBatida = true)
  const metaSaude = {
    valor: 100.00,
    data_in: dataInicio,
    data_fim: dataFim,
    metaBatida: await calcularMetaBatida(saudeId!, dataInicio, dataFim, 100.00),
    id_gasto: null,
    categ_id: saudeId
  };

  await knex("metas").insert([metaAlimentacao, metaTransporte, metaEntretenimento, metaSaude]);

  console.log("Metas criadas com status calculado baseado nos gastos existentes!");
  console.log("Cenários de teste:");
  console.log("- Alimentação: R$ 160,25 gastos vs R$ 200,00 meta (metaBatida = false) ❌");
  console.log("- Transporte: R$ 200,00 gastos vs R$ 250,00 meta (metaBatida = false) ❌");
  console.log("- Entretenimento: R$ 47,00 gastos vs R$ 60,00 meta (metaBatida = false) ❌");
  console.log("- Saúde: R$ 150,00 gastos vs R$ 100,00 meta (metaBatida = true) ✅");
}
