import { useState, useEffect } from 'react';
import api from '../services/api';

// Interface para os dados de Categoria (necessário para o dropdown)
interface Categoria {
  id: number;
  titulo: string;
}

// Interface para os dados de Meta que a API retorna
// A interface MetaStatus é removida, pois não será mais usada para renderização
interface Meta {
    id: number;
    valor: number;
    data_in: string;
    data_fim: string;
    categ_id: number;
    categoria_nome: string;
}

function MetaManager() {
  // O estado agora usa a interface Meta mais simples
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
      // A requisição ainda é a mesma, mas a resposta será usada de forma diferente
      const response = await api.get('/metas');
      // Mapeamos a resposta para extrair apenas a parte 'meta' de cada objeto
      setMetas(response.data.map((item: any) => item.meta));
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    }
  }

  // Função para buscar as categorias (necessário para o dropdown do formulário)
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

      setNovaMeta({ valor: '', data_in: '', data_fim: '', categ_id: 1 });
      fetchMetas(); // Recarrega a lista
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
        fetchMetas(); // Recarrega a lista
      } catch (error) {
        console.error("Erro ao deletar meta:", error);
        alert("Não foi possível deletar a meta.");
      }
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gerenciar Metas</h2>

      {/* Formulário de Criação de Meta */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>Adicionar Meta</h3>
        <input
          type="number"
          step="0.01"
          placeholder="Valor da Meta"
          value={novaMeta.valor}
          onChange={e => setNovaMeta({ ...novaMeta, valor: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Data de Início"
          value={novaMeta.data_in}
          onChange={e => setNovaMeta({ ...novaMeta, data_in: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Data de Fim"
          value={novaMeta.data_fim}
          onChange={e => setNovaMeta({ ...novaMeta, data_fim: e.target.value })}
          required
        />
        <select
          value={novaMeta.categ_id}
          onChange={e => setNovaMeta({ ...novaMeta, categ_id: parseInt(e.target.value) })}
          required
        >
          <option value="">Selecione a Categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.titulo}</option>
          ))}
        </select>
        <button type="submit">Salvar Meta</button>
      </form>

      {/* Lista de Metas */}
      <h3>Lista de Metas</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {metas.length > 0 ? (
          metas.map(meta => {
            const dataInicio = new Date(meta.data_in).toLocaleDateString();
            const dataFim = new Date(meta.data_fim).toLocaleDateString();

            return (
              <li key={meta.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                <div>
                  <strong>Categoria:</strong> {meta.categoria_nome}
                </div>
                <div>
                  <strong>Período:</strong> {dataInicio} até {dataFim}
                </div>
                <div>
                  <strong>Valor da Meta:</strong> R$ {meta.valor.toFixed(2)}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button onClick={() => handleDelete(meta.id)}>
                    Excluir
                  </button>
                  {/* Você também pode adicionar um botão de 'Editar' aqui */}
                </div>
              </li>
            );
          })
        ) : (
          <p>Nenhuma meta encontrada.</p>
        )}
      </ul>
    </div>
  );
}

export default MetaManager;
