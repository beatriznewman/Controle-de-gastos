import fastify from 'fastify'
import { db } from './database'
import { CreateGastoBody } from './types'

const app = fastify()

// Rota raiz
app.get('/', async () => {
    const tables = await db('sqlite_schema').select('*')
    return tables
})

// Rota para listar gastos
app.get('/gastos', async () => {
    const gastos = await db('gastos')
        .select('gastos.*', 'categorias.titulo as categoria_nome')
        .join('categorias', 'gastos.categ_id', 'categorias.id')
        .orderBy('gastos.dataDoGasto', 'desc')

    return gastos
})

// Rota para listar categorias
app.get('/categorias', async () => {
    const categorias = await db('categorias').select('*')
    return categorias
})

// Rota para listar metas
app.get('/metas', async () => {
    const metas = await db('metas')
        .select('metas.*', 'categorias.titulo as categoria_nome')
        .join('categorias', 'metas.categ_id', 'categorias.id')
        .orderBy('metas.data_in', 'desc')

    return metas
})

// Rota para criar gasto
app.post('/gasto', async (req, res) => {
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

export { app }
