import { useState, useEffect } from 'react';

// Simulando a API para demonstração
const mockApi = {
  get: async (endpoint) => {
    if (endpoint === '/metas') {
      return {
        data: [
          {
            meta: {
              id: 1,
              valor: 2500.00,
              data_in: '2024-01-01',
              data_fim: '2024-03-31',
              categ_id: 1,
              categoria_nome: 'Economia Doméstica'
            }
          },
          {
            meta: {
              id: 2,
              valor: 5000.00,
              data_in: '2024-02-01',
              data_fim: '2024-06-30',
              categ_id: 2,
              categoria_nome: 'Viagem'
            }
          }
        ]
      };
    }
    if (endpoint === '/categorias') {
      return {
        data: [
          { id: 1, titulo: 'Economia Doméstica' },
          { id: 2, titulo: 'Viagem' },
          { id: 3, titulo: 'Investimentos' },
          { id: 4, titulo: 'Educação' }
        ]
      };
    }
  },
  post: async () => ({ data: { success: true } }),
  delete: async () => ({ data: { success: true } })
};

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
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [novaMeta, setNovaMeta] = useState({
    valor: '',
    data_in: '',
    data_fim: '',
    categ_id: '',
  });

  async function fetchMetas() {
    try {
      setLoading(true);
      const response = await mockApi.get('/metas');
      setMetas(response.data.map((item: any) => item.meta));
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategorias() {
    try {
      const response = await mockApi.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  useEffect(() => {
    fetchMetas();
    fetchCategorias();
  }, []);

  async function handleSubmit() {
    if (!novaMeta.valor || !novaMeta.data_in || !novaMeta.data_fim || !novaMeta.categ_id) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await mockApi.post('/metas');
      
      setNovaMeta({ valor: '', data_in: '', data_fim: '', categ_id: '' });
      setShowForm(false);
      fetchMetas();
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      alert("Erro ao criar meta. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar esta meta?")) {
      try {
        setLoading(true);
        await mockApi.delete(`/metas/${id}`);
        fetchMetas();
      } catch (error) {
        console.error("Erro ao deletar meta:", error);
        alert("Não foi possível deletar a meta.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
              <p className="text-gray-600 mt-1">Organize seus objetivos e acompanhe seu progresso</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Nova Meta
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Criar Nova Meta</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Meta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={novaMeta.valor}
                  onChange={e => setNovaMeta({ ...novaMeta, valor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={novaMeta.categ_id}
                  onChange={e => setNovaMeta({ ...novaMeta, categ_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.titulo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={novaMeta.data_in}
                  onChange={e => setNovaMeta({ ...novaMeta, data_in: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={novaMeta.data_fim}
                  onChange={e => setNovaMeta({ ...novaMeta, data_fim: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Meta'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Metas */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Suas Metas</h2>
          
          {loading && metas.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : metas.length > 0 ? (
            <div className="space-y-4">
              {metas.map(meta => {
                const dataInicio = new Date(meta.data_in).toLocaleDateString('pt-BR');
                const dataFim = new Date(meta.data_fim).toLocaleDateString('pt-BR');
                
                return (
                  <div key={meta.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {meta.categoria_nome}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Valor da Meta</p>
                            <p className="text-2xl font-bold text-green-600">
                              R$ {meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Data de Início</p>
                            <p className="font-medium text-gray-900">{dataInicio}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Data Final</p>
                            <p className="font-medium text-gray-900">{dataFim}</p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(meta.id)}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma meta encontrada</h3>
              <p className="text-gray-600 mb-6">Comece criando sua primeira meta financeira!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeira Meta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MetaManager;