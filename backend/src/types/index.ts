// ===== TIPOS PARA REQUISIÇÕES =====

// Gastos
export interface CreateGastoBody {
    valor: number
    dataDoGasto?: string
    descricao: string
    categoria_id: number
}

export interface UpdateGastoBody {
    valor?: number
    dataDoGasto?: string
    descricao?: string
    categoria_id?: number
}

// Categorias
export interface CreateCategoriaBody {
    titulo: string
}

export interface UpdateCategoriaBody {
    titulo: string
}

// Metas
export interface CreateMetaBody {
    valor: number
    data_in?: string
    data_fim: string
    metaBatida?: boolean
    id_gasto?: number
    categoria_id: number
}

export interface UpdateMetaBody {
    valor?: number
    data_in?: string
    data_fim?: string
    metaBatida?: boolean
    id_gasto?: number
    categoria_id?: number
}

// ===== TIPOS PARA RESPOSTAS =====

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

// ===== TIPOS PARA STATUS DAS METAS =====

export interface MetaStatusResponse {
    meta: MetaResponse
    totalGastos: number
    metaBatida: boolean
    progresso: number
    restante: number
}

export interface EstatisticasCategoria {
    totalGastosCategoria: number
    totalMetas: number
    metasAtivas: number
    metasBatidas: number
    metasNaoBatidas: number
    taxaSucesso: number
}

export interface MetasCategoriaResponse {
    categoria: CategoriaResponse
    metas: MetaStatusResponse[]
    estatisticas: EstatisticasCategoria
}



// ===== TIPOS PARA PARÂMETROS =====

export interface IdParam {
    id: string
}
