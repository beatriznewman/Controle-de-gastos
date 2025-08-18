import { useState, useEffect } from 'react';
import api from '../services/api';

// Tipagem básica para os dados que vêm da sua API
interface Gasto {
  id: number;
  valor: number;
  dataDoGasto: string;
  descricao: string;
  categoria_nome: string;
}

function GastoManager() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [novoGasto, setNovoGasto] = useState({
    valor: '',
    descricao: '',
    categoria_id: 1, // Exemplo: ID da categoria "Alimentação"
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

  // Hook que executa a função de busca quando o componente é montado
  useEffect(() => {
    fetchGastos();
  }, []); // O array vazio garante que o efeito só roda uma vez

  // Função para lidar com a criação de um novo gasto
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // Evita o recarregamento da página

    try {
      // Envia os dados para a API usando o endpoint POST /gastos
      await api.post('/gastos', {
        valor: parseFloat(novoGasto.valor), // Converte para número
        descricao: novoGasto.descricao,
        categoria_id: novoGasto.categoria_id
      });
      
      setNovoGasto({ valor: '', descricao: '', categoria_id: 1 }); // Limpa o formulário
      fetchGastos(); // Recarrega a lista de gastos para mostrar o novo
      
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
        fetchGastos(); // Recarrega a lista
      } catch (error) {
        console.error("Erro ao deletar gasto:", error);
      }
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gerenciador de Gastos</h1>

      {/* Formulário de Criação de Gasto */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h2>Adicionar Gasto</h2>
        <input
          type="number"
          placeholder="Valor"
          value={novoGasto.valor}
          onChange={e => setNovoGasto({ ...novoGasto, valor: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Descrição"
          value={novoGasto.descricao}
          onChange={e => setNovoGasto({ ...novoGasto, descricao: e.target.value })}
          required
        />
        <select
          value={novoGasto.categoria_id}
          onChange={e => setNovoGasto({ ...novoGasto, categoria_id: parseInt(e.target.value) })}
          required
        >
          {/* Por simplicidade, as categorias são estáticas.
             No futuro, você pode buscar as categorias da API. */}
          <option value={1}>Alimentação</option>
          <option value={2}>Transporte</option>
          <option value={3}>Entretenimento</option>
        </select>
        <button type="submit">Salvar Gasto</button>
      </form>

      {/* Lista de Gastos */}
      <h2>Lista de Gastos</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {gastos.length > 0 ? (
          gastos.map(gasto => (
            <li key={gasto.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <div>
                <strong>Valor:</strong> R$ {gasto.valor.toFixed(2)}
              </div>
              <div>
                <strong>Descrição:</strong> {gasto.descricao}
              </div>
              <div>
                <strong>Categoria:</strong> {gasto.categoria_nome}
              </div>
              <div>
                <strong>Data:</strong> {new Date(gasto.dataDoGasto).toLocaleDateString()}
              </div>
              <button onClick={() => handleDelete(gasto.id)} style={{ marginTop: '10px' }}>
                Deletar
              </button>
            </li>
          ))
        ) : (
          <p>Nenhum gasto encontrado. Adicione um!</p>
        )}
      </ul>
    </div>
  );
}

export default GastoManager;