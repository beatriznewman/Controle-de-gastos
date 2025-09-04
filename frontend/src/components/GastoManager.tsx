import { useState, useEffect } from 'react';
import api from '../services/api';

interface Gasto {
  id: number;
  valor: number;
  dataDoGasto: string;
  descricao: string;
  categoria_nome: string;
}

interface Categoria {
  id: number;
  titulo: string;
}

function GastoManager() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novoGasto, setNovoGasto] = useState({
    valor: '',
    descricao: '',
    categoria_id: 1,
  });

  // Função para buscar os gastos da API
  async function fetchGastos() {
    try {
      const response = await api.get('/gastos');
      setGastos(response.data);
    } catch (error) {
      console.error("Erro ao buscar gastos:", error);
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

  // Hook que executa a função de busca quando o componente é montado
  useEffect(() => {
    fetchGastos();
    fetchCategorias();
  }, []);

  // Função para lidar com a criação de um novo gasto
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await api.post('/gastos', {
        valor: parseFloat(novoGasto.valor),
        descricao: novoGasto.descricao,
        categoria_id: novoGasto.categoria_id
      });
      
      setNovoGasto({ valor: '', descricao: '', categoria_id: categorias[0]?.id || 1 });
      fetchGastos();
      
    } catch (error) {
      console.error("Erro ao criar gasto:", error);
      alert("Erro ao criar gasto. Verifique os dados e a categoria.");
    }
  }

  // Função para lidar com a exclusão de um gasto
  async function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar este gasto?")) {
      try {
        await api.delete(`/gastos/${id}`);
        fetchGastos();
      } catch (error) {
        console.error("Erro ao deletar gasto:", error);
      }
    }
  }

  return (
    <div className="component-container">
      <h2 className="component-title">Gerenciador de Gastos</h2>

      {/* Formulário de Criação de Gasto */}
      <div className="form-container">
        <h3 className="form-title">Adicionar Novo Gasto</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={novoGasto.valor}
            onChange={e => setNovoGasto({ ...novoGasto, valor: e.target.value })}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={novoGasto.descricao}
            onChange={e => setNovoGasto({ ...novoGasto, descricao: e.target.value })}
            required
            className="form-input"
          />
          <select
            value={novoGasto.categoria_id}
            onChange={e => setNovoGasto({ ...novoGasto, categoria_id: parseInt(e.target.value) })}
            required
            className="form-select"
          >
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.titulo}</option>
            ))}
          </select>
          <button type="submit" className="form-button">Salvar Gasto</button>
        </form>
      </div>

      {/* Lista de Gastos */}
      <h3 className="component-title">Lista de Gastos</h3>
      <div className="list-container">
        {gastos.length > 0 ? (
          gastos.map(gasto => (
            <div key={gasto.id} className="list-item">
              <div className="item-content">
                <div className="item-title">{gasto.descricao}</div>
                <div className="item-details">
                  <span className="item-detail">
                    <strong>Valor:</strong> R$ {gasto.valor.toFixed(2)}
                  </span>
                  <span className="item-detail">
                    <strong>Categoria:</strong> {gasto.categoria_nome}
                  </span>
                  <span className="item-detail">
                    <strong>Data:</strong> {new Date(gasto.dataDoGasto).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(gasto.id)} 
                className="action-button delete-button"
              >
                Excluir
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Nenhum gasto encontrado. Adicione um!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GastoManager;