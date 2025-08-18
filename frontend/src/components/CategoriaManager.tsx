import { useState, useEffect } from 'react';
import api from '../services/api';

// Interface para definir a estrutura da categoria
interface Categoria {
  id: number;
  titulo: string;
}

function CategoriaManager() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novoTitulo, setNovoTitulo] = useState('');

  // Função para buscar as categorias da API
  async function fetchCategorias() {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  // Busca as categorias ao carregar o componente
  useEffect(() => {
    fetchCategorias();
  }, []);

  // Criar categoria
  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!novoTitulo.trim()) return;

    try {
      await api.post('/categorias', { titulo: novoTitulo });
      setNovoTitulo('');
      fetchCategorias();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
    }
  }

  // Deletar categoria
  async function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar esta categoria?")) {
      try {
        await api.delete(`/categorias/${id}`);
        fetchCategorias();
      } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        alert("Não foi possível deletar a categoria. Verifique se ela está sendo usada em algum gasto ou meta.");
      }
    }
  }

  // Atualizar categoria
  async function handleUpdate(id: number, tituloAtual: string) {
    const novoTitulo = window.prompt("Digite o novo título da categoria:", tituloAtual);
    if (!novoTitulo || !novoTitulo.trim()) return;

    try {
      await api.put(`/categorias/${id}`, { titulo: novoTitulo });
      fetchCategorias();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gerenciar Categorias</h2>

      {/* Formulário de criação */}
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Nova categoria"
          value={novoTitulo}
          onChange={e => setNovoTitulo(e.target.value)}
          required
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <button type="submit">Adicionar</button>
      </form>

      {/* Lista de categorias */}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {categorias.length > 0 ? (
          categorias.map(categoria => (
            <li 
              key={categoria.id} 
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{categoria.titulo}</span>
              <div>
                <button 
                  onClick={() => handleUpdate(categoria.id, categoria.titulo)} 
                  style={{ marginRight: '0.5rem' }}
                >
                  Editar
                </button>
                <button onClick={() => handleDelete(categoria.id)}>Excluir</button>
              </div>
            </li>
          ))
        ) : (
          <p>Nenhuma categoria cadastrada.</p>
        )}
      </ul>
    </div>
  );
}

export default CategoriaManager;
