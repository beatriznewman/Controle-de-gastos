import { useState, useEffect } from 'react';
import api from '../services/api';

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
    <div className="component-container">
      <h2 className="component-title">Gerenciar Categorias</h2>

      {/* Formulário de criação */}
      <div className="form-container">
        <h3 className="form-title">Adicionar Nova Categoria</h3>
        <form onSubmit={handleCreate} className="form-grid">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={novoTitulo}
            onChange={e => setNovoTitulo(e.target.value)}
            required
            className="form-input"
          />
          <button type="submit" className="form-button">Adicionar</button>
        </form>
      </div>

      {/* Lista de categorias */}
      <div className="list-container">
        {categorias.length > 0 ? (
          categorias.map(categoria => (
            <div key={categoria.id} className="list-item">
              <div className="item-content">
                <div className="item-title">{categoria.titulo}</div>
              </div>
              <div className="item-actions">
                <button 
                  onClick={() => handleUpdate(categoria.id, categoria.titulo)} 
                  className="action-button edit-button"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(categoria.id)} 
                  className="action-button delete-button"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Nenhuma categoria cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriaManager;