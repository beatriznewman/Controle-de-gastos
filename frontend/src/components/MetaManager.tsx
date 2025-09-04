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
  categ_id: number;
  categoria_nome: string;
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

  // Função para buscar as metas da API
  async function fetchMetas() {
    try {
      const response = await api.get('/metas');
      setMetas(response.data.map((item: any) => item.meta));
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

  return (
    <div className="component-container">
      <h2 className="component-title">Gerenciar Metas</h2>

      {/* Formulário de Criação de Meta */}
      <div className="form-container">
        <h3 className="form-title">Adicionar Nova Meta</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="number"
            step="0.01"
            placeholder="Valor da Meta"
            value={novaMeta.valor}
            onChange={e => setNovaMeta({ ...novaMeta, valor: e.target.value })}
            required
            className="form-input"
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
      <h3 className="component-title">Lista de Metas</h3>
      <div className="list-container">
        {metas.length > 0 ? (
          metas.map(meta => {
            const dataInicio = new Date(meta.data_in).toLocaleDateString();
            const dataFim = new Date(meta.data_fim).toLocaleDateString();

            return (
              <div key={meta.id} className="list-item">
                <div className="item-content">
                  <div className="item-title">Meta de {meta.categoria_nome}</div>
                  <div className="item-details">
                    <span className="item-detail">
                      <strong>Valor:</strong> R$ {meta.valor.toFixed(2)}
                    </span>
                    <span className="item-detail">
                      <strong>Início:</strong> {dataInicio}
                    </span>
                    <span className="item-detail">
                      <strong>Término:</strong> {dataFim}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(meta.id)} 
                  className="action-button delete-button"
                >
                  Excluir
                </button>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>Nenhuma meta encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetaManager;