import fastify from 'fastify'
import cors from '@fastify/cors'
import { db } from './database'
import { CreateGastoBody, CreateCategoriaBody, CreateMetaBody, UpdateGastoBody, UpdateCategoriaBody, UpdateMetaBody } from './types'

const app = fastify()

app.register(cors, {
    origin: '*', // Permite todas as origens. Em produção, use a URL exata do seu frontend: 'http://localhost:5173'
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
})

// ===== FUNÇÃO UTILITÁRIA PARA CALCULAR STATUS DAS METAS =====

async function calcularStatusMeta(metaId: number) {
    try {
        // Buscar a meta
        const meta = await db('metas')
            .select('metas.*', 'categorias.titulo as categoria_nome')
            .join('categorias', 'metas.categ_id', 'categorias.id')
            .where('metas.id', metaId)
            .first()

        if (!meta) {
            throw new Error('Meta não encontrada')
        }

        // Calcular total de gastos na categoria dentro do período da meta
        const totalGastos = await db('gastos')
            .sum('valor as total')
            .where('categ_id', meta.categ_id)
            .whereBetween('dataDoGasto', [meta.data_in, meta.data_fim])
            .first()

        const valorTotalGastos = totalGastos?.total || 0
        const metaBatida = valorTotalGastos <= meta.valor

        // Atualizar o status da meta se necessário
        if (meta.metaBatida !== metaBatida) {
            await db('metas')
                .where('id', metaId)
                .update({ metaBatida })
        }

        return {
            meta,
            totalGastos: valorTotalGastos,
            metaBatida,
            progresso: Math.min((valorTotalGastos / meta.valor) * 100, 100),
            restante: Math.max(meta.valor - valorTotalGastos, 0)
        }
    } catch (error) {
        console.error('Erro ao calcular status da meta:', error)
        throw error
    }
}

// ===== ROTAS DE GASTOS =====

// Listar todos os gastos
app.get('/gastos', async () => {
    try {
        const gastos = await db('gastos')
            .select('gastos.*', 'categorias.titulo as categoria_nome')
            .join('categorias', 'gastos.categ_id', 'categorias.id')
            .orderBy('gastos.dataDoGasto', 'desc')

        return gastos
    } catch (error) {
        console.error("Erro ao listar gastos:", error)
        throw new Error("Erro interno do servidor")
    }
})

// Buscar gasto por ID
app.get('/gastos/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }
        
        const gasto = await db('gastos')
            .select('gastos.*', 'categorias.titulo as categoria_nome')
            .join('categorias', 'gastos.categ_id', 'categorias.id')
            .where('gastos.id', id)
            .first()

        if (!gasto) {
            return res.status(404).send({
                error: "Gasto não encontrado"
            })
        }

        return gasto
    } catch (error) {
        console.error("Erro ao buscar gasto:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Criar gasto
app.post('/gastos', async (req, res) => {
    try {
        const { valor, dataDoGasto, descricao, categoria_id } = req.body as CreateGastoBody

        // Validação dos campos obrigatórios
        if (!valor || !descricao || !categoria_id) {
            return res.status(400).send({
                error: "Campos obrigatórios: valor, descricao e categoria_id"
            })
        }

        // Verificar se a categoria existe
        const categoria = await db("categorias").where("id", categoria_id).first()
        if (!categoria) {
            return res.status(404).send({
                error: "Categoria não encontrada"
            })
        }

        // Inserir o gasto
        const [gastoId] = await db("gastos").insert({
            valor: valor,
            dataDoGasto: dataDoGasto || new Date(),
            descricao: descricao,
            categ_id: categoria_id
        })

        // Buscar o gasto criado com a categoria
        const gastoCriado = await db("gastos")
            .select("gastos.*", "categorias.titulo as categoria_nome")
            .join("categorias", "gastos.categ_id", "categorias.id")
            .where("gastos.id", gastoId)
            .first()

        // Recalcular status das metas da categoria
        const metasDaCategoria = await db("metas").where("categ_id", categoria_id).select("id")
        for (const meta of metasDaCategoria) {
            try {
                await calcularStatusMeta(meta.id)
            } catch (error) {
                console.error(`Erro ao recalcular meta ${meta.id}:`, error)
            }
        }

        return res.status(201).send({
            message: "Gasto criado com sucesso",
            gasto: gastoCriado
        })

    } catch (error) {
        console.error("Erro ao criar gasto:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Atualizar gasto
app.put('/gastos/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }
        const { valor, dataDoGasto, descricao, categoria_id } = req.body as UpdateGastoBody

        // Verificar se o gasto existe
        const gastoExistente = await db("gastos").where("id", id).first()
        if (!gastoExistente) {
            return res.status(404).send({
                error: "Gasto não encontrado"
            })
        }

        // Verificar se a categoria existe (se fornecida)
        if (categoria_id) {
            const categoria = await db("categorias").where("id", categoria_id).first()
            if (!categoria) {
                return res.status(404).send({
                    error: "Categoria não encontrada"
                })
            }
        }

        // Atualizar o gasto
        await db("gastos")
            .where("id", id)
            .update({
                valor: valor || gastoExistente.valor,
                dataDoGasto: dataDoGasto || gastoExistente.dataDoGasto,
                descricao: descricao || gastoExistente.descricao,
                categ_id: categoria_id || gastoExistente.categ_id
            })

        // Buscar o gasto atualizado
        const gastoAtualizado = await db("gastos")
            .select("gastos.*", "categorias.titulo as categoria_nome")
            .join("categorias", "gastos.categ_id", "categorias.id")
            .where("gastos.id", id)
            .first()

        // Recalcular status das metas da categoria (tanto da categoria antiga quanto da nova)
        const categoriasParaRecalcular = new Set([gastoAtualizado.categ_id])
        if (categoria_id && categoria_id !== gastoExistente.categ_id) {
            categoriasParaRecalcular.add(categoria_id)
        }

        for (const categoriaId of categoriasParaRecalcular) {
            const metasDaCategoria = await db("metas").where("categ_id", categoriaId).select("id")
            for (const meta of metasDaCategoria) {
                try {
                    await calcularStatusMeta(meta.id)
                } catch (error) {
                    console.error(`Erro ao recalcular meta ${meta.id}:`, error)
                }
            }
        }

        return {
            message: "Gasto atualizado com sucesso",
            gasto: gastoAtualizado
        }

    } catch (error) {
        console.error("Erro ao atualizar gasto:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Deletar gasto
app.delete('/gastos/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }

        // Verificar se o gasto existe
        const gasto = await db("gastos").where("id", id).first()
        if (!gasto) {
            return res.status(404).send({
                error: "Gasto não encontrado"
            })
        }

        // Deletar o gasto
        await db("gastos").where("id", id).del()

        // Recalcular status das metas da categoria
        const metasDaCategoria = await db("metas").where("categ_id", gasto.categ_id).select("id")
        for (const meta of metasDaCategoria) {
            try {
                await calcularStatusMeta(meta.id)
            } catch (error) {
                console.error(`Erro ao recalcular meta ${meta.id}:`, error)
            }
        }

        return {
            message: "Gasto deletado com sucesso"
        }

    } catch (error) {
        console.error("Erro ao deletar gasto:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// ===== ROTAS DE CATEGORIAS =====

// Listar todas as categorias
app.get('/categorias', async () => {
    try {
        const categorias = await db('categorias').select('*').orderBy('titulo')
        return categorias
    } catch (error) {
        console.error("Erro ao listar categorias:", error)
        throw new Error("Erro interno do servidor")
    }
})

// Buscar categoria por ID
app.get('/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }
        
        const categoria = await db('categorias').where('id', id).first()

        if (!categoria) {
            return res.status(404).send({
                error: "Categoria não encontrada"
            })
        }

        return categoria
    } catch (error) {
        console.error("Erro ao buscar categoria:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Criar categoria
app.post('/categorias', async (req, res) => {
    try {
        const { titulo } = req.body as CreateCategoriaBody

        if (!titulo) {
            return res.status(400).send({
                error: "Campo obrigatório: titulo"
            })
        }

        const [categoriaId] = await db("categorias").insert({ titulo })

        const categoriaCriada = await db("categorias").where("id", categoriaId).first()

        return res.status(201).send({
            message: "Categoria criada com sucesso",
            categoria: categoriaCriada
        })

    } catch (error) {
        console.error("Erro ao criar categoria:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Atualizar categoria
app.put('/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }
        const { titulo } = req.body as UpdateCategoriaBody

        // Verificar se a categoria existe
        const categoriaExistente = await db("categorias").where("id", id).first()
        if (!categoriaExistente) {
            return res.status(404).send({
                error: "Categoria não encontrada"
            })
        }

        if (!titulo) {
            return res.status(400).send({
                error: "Campo obrigatório: titulo"
            })
        }

        // Atualizar a categoria
        await db("categorias").where("id", id).update({ titulo })

        const categoriaAtualizada = await db("categorias").where("id", id).first()

        return {
            message: "Categoria atualizada com sucesso",
            categoria: categoriaAtualizada
        }

    } catch (error) {
        console.error("Erro ao atualizar categoria:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Deletar categoria
app.delete('/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }

        // Verificar se a categoria existe
        const categoria = await db("categorias").where("id", id).first()
        if (!categoria) {
            return res.status(404).send({
                error: "Categoria não encontrada"
            })
        }

        // Verificar se há gastos ou metas usando esta categoria
        const gastosComCategoria = await db("gastos").where("categ_id", id).first()
        const metasComCategoria = await db("metas").where("categ_id", id).first()

        if (gastosComCategoria || metasComCategoria) {
            return res.status(400).send({
                error: "Não é possível deletar categoria que possui gastos ou metas associados"
            })
        }

        // Deletar a categoria
        await db("categorias").where("id", id).del()

        return {
            message: "Categoria deletada com sucesso"
        }

    } catch (error) {
        console.error("Erro ao deletar categoria:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// ===== ROTAS DE METAS =====

// Listar todas as metas com status calculado
app.get('/metas', async () => {
    try {
        const metas = await db('metas')
            .select('metas.*', 'categorias.titulo as categoria_nome')
            .join('categorias', 'metas.categ_id', 'categorias.id')
            .orderBy('metas.data_in', 'desc')

        // Calcular status para cada meta
        const metasComStatus = await Promise.all(
            metas.map(async (meta) => {
                try {
                    return await calcularStatusMeta(meta.id)
                } catch (error) {
                    console.error(`Erro ao calcular status da meta ${meta.id}:`, error)
                    return {
                        meta,
                        totalGastos: 0,
                        metaBatida: meta.metaBatida,
                        progresso: 0,
                        restante: meta.valor
                    }
                }
            })
        )

        return metasComStatus
    } catch (error) {
        console.error("Erro ao listar metas:", error)
        throw new Error("Erro interno do servidor")
    }
})

// Buscar meta por ID com status calculado
app.get('/metas/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }
        
        const statusMeta = await calcularStatusMeta(parseInt(id))

        return statusMeta
    } catch (error) {
        console.error("Erro ao buscar meta:", error)
        if (error instanceof Error && error.message === 'Meta não encontrada') {
            return res.status(404).send({
                error: "Meta não encontrada"
            })
        }
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Criar meta
app.post('/metas', async (req, res) => {
    try {
        const { valor, data_in, data_fim, metaBatida, id_gasto, categoria_id } = req.body as CreateMetaBody

        // Validação dos campos obrigatórios
        if (!valor || !data_fim || !categoria_id) {
            return res.status(400).send({
                error: "Campos obrigatórios: valor, data_fim e categoria_id"
            })
        }

        // Verificar se a categoria existe
        const categoria = await db("categorias").where("id", categoria_id).first()
        if (!categoria) {
            return res.status(404).send({
                error: "Categoria não encontrada"
            })
        }

        // Verificar se o gasto existe (se fornecido)
        if (id_gasto) {
            const gasto = await db("gastos").where("id", id_gasto).first()
            if (!gasto) {
                return res.status(404).send({
                    error: "Gasto não encontrado"
                })
            }
        }

        // Inserir a meta
        const [metaId] = await db("metas").insert({
            valor: valor,
            data_in: data_in || new Date(),
            data_fim: data_fim,
            metaBatida: metaBatida || false,
            id_gasto: id_gasto || null,
            categ_id: categoria_id
        })

        // Buscar a meta criada com a categoria
        const metaCriada = await db("metas")
            .select("metas.*", "categorias.titulo as categoria_nome")
            .join("categorias", "metas.categ_id", "categorias.id")
            .where("metas.id", metaId)
            .first()

        return res.status(201).send({
            message: "Meta criada com sucesso",
            meta: metaCriada
        })

    } catch (error) {
        console.error("Erro ao criar meta:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Atualizar meta
app.put('/metas/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }
        const { valor, data_in, data_fim, metaBatida, id_gasto, categoria_id } = req.body as UpdateMetaBody

        // Verificar se a meta existe
        const metaExistente = await db("metas").where("id", id).first()
        if (!metaExistente) {
            return res.status(404).send({
                error: "Meta não encontrada"
            })
        }

        // Verificar se a categoria existe (se fornecida)
        if (categoria_id) {
            const categoria = await db("categorias").where("id", categoria_id).first()
            if (!categoria) {
                return res.status(404).send({
                    error: "Categoria não encontrada"
                })
            }
        }

        // Verificar se o gasto existe (se fornecido)
        if (id_gasto) {
            const gasto = await db("gastos").where("id", id_gasto).first()
            if (!gasto) {
                return res.status(404).send({
                    error: "Gasto não encontrado"
                })
            }
        }

        // Atualizar a meta
        await db("metas")
            .where("id", id)
            .update({
                valor: valor || metaExistente.valor,
                data_in: data_in || metaExistente.data_in,
                data_fim: data_fim || metaExistente.data_fim,
                metaBatida: metaBatida !== undefined ? metaBatida : metaExistente.metaBatida,
                id_gasto: id_gasto !== undefined ? id_gasto : metaExistente.id_gasto,
                categ_id: categoria_id || metaExistente.categ_id
            })

        // Buscar a meta atualizada
        const metaAtualizada = await db("metas")
            .select("metas.*", "categorias.titulo as categoria_nome")
            .join("categorias", "metas.categ_id", "categorias.id")
            .where("metas.id", id)
            .first()

        return {
            message: "Meta atualizada com sucesso",
            meta: metaAtualizada
        }

    } catch (error) {
        console.error("Erro ao atualizar meta:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Deletar meta
app.delete('/metas/:id', async (req, res) => {
    try {
        const { id } = req.params as { id: string }

        // Verificar se a meta existe
        const meta = await db("metas").where("id", id).first()
        if (!meta) {
            return res.status(404).send({
                error: "Meta não encontrada"
            })
        }

        // Deletar a meta
        await db("metas").where("id", id).del()

        return {
            message: "Meta deletada com sucesso"
        }

    } catch (error) {
        console.error("Erro ao deletar meta:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})

// Verificar progresso das metas por categoria
app.get('/metas/categoria/:categoriaId', async (req, res) => {
    try {
        const { categoriaId } = req.params as { categoriaId: string }
        
        // Verificar se a categoria existe
        const categoria = await db("categorias").where("id", categoriaId).first()
        if (!categoria) {
            return res.status(404).send({
                error: "Categoria não encontrada"
            })
        }

        // Buscar todas as metas da categoria
        const metas = await db('metas')
            .select('metas.*', 'categorias.titulo as categoria_nome')
            .join('categorias', 'metas.categ_id', 'categorias.id')
            .where('metas.categ_id', categoriaId)
            .orderBy('metas.data_in', 'desc')

        // Calcular status para cada meta
        const metasComStatus = await Promise.all(
            metas.map(async (meta) => {
                try {
                    return await calcularStatusMeta(meta.id)
                } catch (error) {
                    console.error(`Erro ao calcular status da meta ${meta.id}:`, error)
                    return {
                        meta,
                        totalGastos: 0,
                        metaBatida: meta.metaBatida,
                        progresso: 0,
                        restante: meta.valor
                    }
                }
            })
        )

        // Calcular estatísticas gerais da categoria
        const totalGastosCategoria = await db('gastos')
            .sum('valor as total')
            .where('categ_id', categoriaId)
            .first()

        const valorTotalGastosCategoria = totalGastosCategoria?.total || 0
        const metasAtivas = metasComStatus.filter(m => new Date(m.meta.data_fim) >= new Date())
        const metasBatidas = metasComStatus.filter(m => m.metaBatida)
        const metasNaoBatidas = metasComStatus.filter(m => !m.metaBatida && new Date(m.meta.data_fim) < new Date())

        return {
            categoria,
            metas: metasComStatus,
            estatisticas: {
                totalGastosCategoria: valorTotalGastosCategoria,
                totalMetas: metasComStatus.length,
                metasAtivas: metasAtivas.length,
                metasBatidas: metasBatidas.length,
                metasNaoBatidas: metasNaoBatidas.length,
                taxaSucesso: metasComStatus.length > 0 ? (metasBatidas.length / metasComStatus.length) * 100 : 0
            }
        }

    } catch (error) {
        console.error("Erro ao buscar metas da categoria:", error)
        return res.status(500).send({
            error: "Erro interno do servidor"
        })
    }
})



// ===== ROTA RAIZ =====
app.get('/', async () => {
    const tables = await db('sqlite_schema').select('*')
    return tables
})

export { app }
