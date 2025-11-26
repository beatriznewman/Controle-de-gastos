import { expect, test } from '@playwright/test'
import { clearDatabase } from './db-utils'

test('retorna 404 ao buscar meta inexistente por id', async ({ request }) => {
  await clearDatabase(request)

  const response = await request.get('/metas/999999')

  expect(response.status()).toBe(404)

  const body = (await response.json()) as {
    error: string
  }

  expect(body.error).toBe('Meta não encontrada')
})
