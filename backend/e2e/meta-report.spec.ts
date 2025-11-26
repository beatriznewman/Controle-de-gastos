import { expect, test } from '@playwright/test'
import { clearDatabase } from './db-utils'

test('cria meta para categoria e verifica relatório da categoria', async ({ request }) => {
  await clearDatabase(request)

  const categoriaResponse = await request.post('/categorias', {
    data: {
      titulo: 'Categoria Metas E2E',
    },
  })

  expect(categoriaResponse.ok()).toBeTruthy()
  const categoriaBody = await categoriaResponse.json()
  const categoriaId = categoriaBody.categoria.id as number

  const createGastoResponse = await request.post('/gastos', {
    data: {
      valor: 200,
      descricao: 'Gasto para meta E2E',
      categoria_id: categoriaId,
    },
  })

  expect(createGastoResponse.ok()).toBeTruthy()

  const hoje = new Date()
  const dataFim = new Date()
  dataFim.setDate(hoje.getDate() + 7)

  const metaResponse = await request.post('/metas', {
    data: {
      valor: 150,
      data_in: hoje.toISOString(),
      data_fim: dataFim.toISOString(),
      categoria_id: categoriaId,
    },
  })

  expect(metaResponse.ok()).toBeTruthy()

  const relatorioResponse = await request.get(`/metas/categoria/${categoriaId}`)
  expect(relatorioResponse.ok()).toBeTruthy()

  const relatorio = await relatorioResponse.json()

  expect(relatorio.categoria.id).toBe(categoriaId)
  expect(Array.isArray(relatorio.metas)).toBe(true)
  expect(relatorio.estatisticas.totalMetas).toBeGreaterThan(0)
})

