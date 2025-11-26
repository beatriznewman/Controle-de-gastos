import { expect, test } from '@playwright/test'
import { clearDatabase } from './db-utils'

test('cria um gasto e verifica se aparece na listagem', async ({ request }) => {
  await clearDatabase(request)

  const categoriaResponse = await request.post('/categorias', {
    data: {
      titulo: 'Categoria E2E',
    },
  })

  expect(categoriaResponse.ok()).toBeTruthy()
  const categoriaBody = await categoriaResponse.json()
  const categoriaId = categoriaBody.categoria.id as number

  const createGastoResponse = await request.post('/gastos', {
    data: {
      valor: 123.45,
      descricao: 'Gasto E2E',
      categoria_id: categoriaId,
    },
  })

  expect(createGastoResponse.ok()).toBeTruthy()

  const listResponse = await request.get('/gastos')
  expect(listResponse.ok()).toBeTruthy()

  const gastos = (await listResponse.json()) as Array<{
    id: number
    descricao: string
    valor: number
    categ_id: number
  }>

  const gastoCriado = gastos.find((gasto) => gasto.descricao === 'Gasto E2E')
  expect(gastoCriado).toBeDefined()
  expect(gastoCriado?.valor).toBe(123.45)
  expect(gastoCriado?.categ_id).toBe(categoriaId)
})


