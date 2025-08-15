// Tipos para as requisições
export interface CreateGastoBody {
    valor: number
    dataDoGasto?: string
    descricao: string
    categoria_id: number
}

// Tipos para as respostas
export interface GastoResponse {
    id: number
    valor: number
    dataDoGasto: string
    descricao: string
    categ_id: number
    categoria_nome: string
}

export interface CategoriaResponse {
    id: number
    titulo: string
}

export interface MetaResponse {
    id: number
    valor: number
    data_in: string
    data_fim: string
    metaBatida: boolean
    id_gasto: number | null
    categ_id: number
    categoria_nome: string
}
