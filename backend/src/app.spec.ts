import { beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { db } from './database'
import { app } from './app'

let server: FastifyInstance

beforeAll(async () => {
  await db.migrate.latest()
  await db.seed.run()
  server = app
})

describe('Gastos - criação', () => {
  it('deve retornar 400 quando campos obrigatórios de gasto estiverem ausentes', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/gastos',
      payload: {
        descricao: 'Sem valor e categoria',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      error: 'Campos obrigatórios: valor, descricao e categoria_id',
    })
  })

  it('deve retornar 404 quando categoria do gasto não existir', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/gastos',
      payload: {
        valor: 100,
        descricao: 'Gasto com categoria inexistente',
        categoria_id: 999999,
      },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      error: 'Categoria não encontrada',
    })
  })
})

describe('Categorias - criação e validação', () => {
  it('deve retornar 400 quando titulo da categoria não for enviado', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/categorias',
      payload: {},
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      error: 'Campo obrigatório: titulo',
    })
  })

  it('deve criar categoria com sucesso quando titulo for válido', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/categorias',
      payload: {
        titulo: 'Categoria Teste',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.message).toBe('Categoria criada com sucesso')
    expect(body.categoria.titulo).toBe('Categoria Teste')
  })
})

describe('Metas - criação e erros comuns', () => {
  it('deve retornar 400 quando campos obrigatórios da meta estiverem ausentes', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/metas',
      payload: {
        valor: 500,
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      error: 'Campos obrigatórios: valor, data_fim e categoria_id',
    })
  })

  it('deve retornar 404 quando categoria da meta não existir', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/metas',
      payload: {
        valor: 500,
        data_fim: new Date().toISOString(),
        categoria_id: 999999,
      },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      error: 'Categoria não encontrada',
    })
  })
})

describe('Metas - consulta', () => {
  it('deve retornar 404 ao buscar meta inexistente por id', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/metas/999999',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      error: 'Meta não encontrada',
    })
  })

  it('deve retornar lista de metas com sucesso', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/metas',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(Array.isArray(body)).toBe(true)
  })
})


