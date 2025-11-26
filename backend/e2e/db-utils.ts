import type { APIRequestContext } from '@playwright/test'

export async function clearDatabase(request: APIRequestContext): Promise<void> {
  const response = await request.post('/test/clear')
  if (!response.ok()) {
    throw new Error(`Falha ao limpar banco de dados: ${response.status()} ${await response.text()}`)
  }
}


