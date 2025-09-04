import { useState, useEffect } from 'react';
import api from '../services/api';

interface Categoria {
  id: number;
  titulo: string;
}

interface Meta {
  id: number;
  valor: number;
  data_in: string;
  data_fim: string;
  metaBatida: boolean;
  categoria_nome: string;
  totalGastos: number;
  progresso: number;
  restante: number;
  gastos: Array<{
    id: number;
    valor: number;
    dataDoGasto: string;
    descricao: string;
  }>;
}

function MetaManager() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaMeta, setNovaMeta] = useState({
    valor: '',
    data_in: '',
    data_fim: '',
    categ_id: 1,
  });
  const [detalhesMeta, setDetalhesMeta] = useState<Meta | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  // Função para buscar as metas da API
  async function fetchMetas() {
    try {
      const response = await api.get('/metas');
      setMetas(response.data);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    }
  }

  // Função para buscar as categorias
  async function fetchCategorias() {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  // Buscar detalhes de uma meta específica
  async function fetchDetalhesMeta(id: number) {
    try {
      const response = await api.get(`/metas/${id}`);
      setDetalhesMeta(response.data);
      setMostrarDetalhes(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da meta:", error);
    }
  }

  // Busca metas e categorias ao carregar o componente
  useEffect(() => {
    fetchMetas();
    fetchCategorias();
  }, []);

  // Lidar com a criação de uma nova meta
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await api.post('/metas', {
        valor: parseFloat(novaMeta.valor),
        data_in: novaMeta.data_in,
        data_fim: novaMeta.data_fim,
        categoria_id: parseInt(novaMeta.categ_id.toString()),
      });

      setNovaMeta({ valor: '', data_in: '', data_fim: '', categ_id: categorias[0]?.id || 1 });
      fetchMetas();
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      alert("Erro ao criar meta. Verifique os campos e tente novamente.");
    }
  }

  // Lidar com a exclusão de uma meta
  async function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar esta meta?")) {
      try {
        await api.delete(`/metas/${id}`);
        fetchMetas();
      } catch (error) {
        console.error("Erro ao deletar meta:", error);
        alert("Não foi possível deletar a meta.");
      }
    }
  }

  // Função para formatar valor monetário
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para obter a cor do progresso baseado no status
  const getCorProgresso = (progresso: number, metaBatida: boolean) => {
    if (metaBatida) return '#dc3545'; // Vermelho para meta batida (gastou demais)
    if (progresso >= 80) return '#ffc107'; // Amarelo para perto de bater o limite
    return '#28a745'; // Verde para dentro do limite
  };

  // CORREÇÃO DA LÓGICA: Calcular valores corretos para meta de economia
  const calcularValoresMeta = (meta: Meta) => {
    const valorMeta = meta.valor;
    const totalGastos = meta.totalGastos;
    
    // Para meta de economia: quanto já foi economizado (valor da meta - gastos)
    const economizado = Math.max(valorMeta - totalGastos, 0);
    
    // Quanto ainda pode ser gasto sem bater a meta
    const podeGastar = Math.max(valorMeta - totalGastos, 0);
    
    // Porcentagem do valor economizado em relação à meta
    const progressoEconomia = valorMeta > 0 ? ((valorMeta - totalGastos) / valorMeta) * 100 : 0;
    const progressoPercentual = Math.max(0, Math.min(progressoEconomia, 100));
    
    // Meta batida quando gastos ultrapassam o valor da meta
    const metaBatida = totalGastos > valorMeta;
    
    // Quanto ultrapassou a meta (se meta batida)
    const ultrapassou = metaBatida ? totalGastos - valorMeta : 0;

    return {
      economizado,
      podeGastar,
      progressoPercentual,
      metaBatida,
      ultrapassou
    };
  };

  return (
    <div className="component-container">
      <h2 className="component-title">Gerenciar Metas de Economia</h2>

      {/* Formulário de Criação de Meta */}
      <div className="form-container">
        <h3 className="form-title">Adicionar Nova Meta de Economia</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="number"
            step="0.01"
            placeholder="Valor máximo a ser gasto"
            value={novaMeta.valor}
            onChange={e => setNovaMeta({ ...novaMeta, valor: e.target.value })}
            required
            className="form-input"
            min="0.01"
          />
          <input
            type="date"
            placeholder="Data de Início"
            value={novaMeta.data_in}
            onChange={e => setNovaMeta({ ...novaMeta, data_in: e.target.value })}
            required
            className="form-input"
          />
          <input
            type="date"
            placeholder="Data de Fim"
            value={novaMeta.data_fim}
            onChange={e => setNovaMeta({ ...novaMeta, data_fim: e.target.value })}
            required
            className="form-input"
          />
          <select
            value={novaMeta.categ_id}
            onChange={e => setNovaMeta({ ...novaMeta, categ_id: parseInt(e.target.value) })}
            required
            className="form-select"
          >
            <option value="">Selecione a Categoria</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.titulo}</option>
            ))}
          </select>
          <button type="submit" className="form-button">Salvar Meta</button>
        </form>
      </div>

      {/* Lista de Metas */}
      <h3 className="component-title">Metas de Economia</h3>
      <div className="list-container">
        {metas.length > 0 ? (
          metas.map(meta => {
            const dataInicio = new Date(meta.data_in).toLocaleDateString();
            const dataFim = new Date(meta.data_fim).toLocaleDateString();
            const hoje = new Date();
            const dataFimObj = new Date(meta.data_fim);
            const expirada = dataFimObj < hoje;

            // Usar a lógica corrigida
            const { economizado, podeGastar, progressoPercentual, metaBatida, ultrapassou } = calcularValoresMeta(meta);

            return (
              <div key={meta.id} className={`list-item ${metaBatida ? 'meta-batida' : ''} ${expirada ? 'meta-expirada' : ''}`}>
                <div className="item-content">
                  <div className="item-header">
                    <div className="item-title">Meta de {meta.categoria_nome}</div>
                    <div className={`meta-status ${metaBatida ? 'status-batida' : expirada ? 'status-expirada' : 'status-ativa'}`}>
                      {metaBatida ? ' Meta Ultrapassada' : expirada ? ' Expirada' : ' Em Andamento'}
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <span className="item-detail">
                      <strong>Limite de Gastos:</strong> {formatarValor(meta.valor)}
                    </span>
                    <span className="item-detail">
                      <strong>Total Gasto:</strong> {formatarValor(meta.totalGastos)}
                    </span>
                    <span className="item-detail">
                      <strong>Economizado:</strong> 
                      <span className={economizado > 0 ? 'text-success' : 'text-danger'}>
                        {formatarValor(economizado)}
                      </span>
                    </span>
                    {metaBatida ? (
                      <span className="item-detail text-danger">
                        <strong>Ultrapassou em:</strong> {formatarValor(ultrapassou)}
                      </span>
                    ) : (
                      <span className="item-detail text-success">
                        <strong>Pode gastar ainda:</strong> {formatarValor(podeGastar)}
                      </span>
                    )}
                    <span className="item-detail">
                      <strong>Início:</strong> {dataInicio}
                    </span>
                    <span className="item-detail">
                      <strong>Término:</strong> {dataFim}
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="progress-container">
                    <div className="progress-info">
                      <span>Meta de Economia: {progressoPercentual.toFixed(1)}%</span>
                      <span>{formatarValor(economizado)} / {formatarValor(meta.valor)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${progressoPercentual}%`,
                          backgroundColor: getCorProgresso(progressoPercentual, metaBatida)
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="item-actions">
                  <button 
                    onClick={() => fetchDetalhesMeta(meta.id)} 
                    className="action-button details-button"
                  >
                    Detalhes
                  </button>
                  <button 
                    onClick={() => handleDelete(meta.id)} 
                    className="action-button delete-button"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>Nenhuma meta de economia encontrada.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Meta */}
      {mostrarDetalhes && detalhesMeta && (
        <div className="modal-overlay" onClick={() => setMostrarDetalhes(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes da Meta - {detalhesMeta.categoria_nome}</h3>
              <button 
                className="modal-close"
                onClick={() => setMostrarDetalhes(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="meta-info">
                <div className="info-row">
                  <strong>Limite de Gastos:</strong> {formatarValor(detalhesMeta.valor)}
                </div>
                <div className="info-row">
                  <strong>Total Gasto:</strong> {formatarValor(detalhesMeta.totalGastos)}
                </div>
                <div className="info-row">
                  <strong>Economizado:</strong> 
                  <span className={detalhesMeta.totalGastos <= detalhesMeta.valor ? 'text-success' : 'text-danger'}>
                    {formatarValor(detalhesMeta.valor - detalhesMeta.totalGastos)}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${detalhesMeta.totalGastos > detalhesMeta.valor ? 'batida' : 'ativa'}`}>
                    {detalhesMeta.totalGastos > detalhesMeta.valor ? 'Meta Ultrapassada' : 'Dentro do Limite'}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Período:</strong> 
                  {new Date(detalhesMeta.data_in).toLocaleDateString()} até {new Date(detalhesMeta.data_fim).toLocaleDateString()}
                </div>
              </div>

              {detalhesMeta.gastos.length > 0 && (
                <div className="gastos-list">
                  <h4>Gastos Relacionados ({detalhesMeta.gastos.length})</h4>
                  <div className="gastos-container">
                    {detalhesMeta.gastos.map(gasto => (
                      <div key={gasto.id} className="gasto-item">
                        <div className="gasto-descricao">{gasto.descricao}</div>
                        <div className="gasto-info">
                          <span>{formatarValor(gasto.valor)}</span>
                          <span>{new Date(gasto.dataDoGasto).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MetaManager;