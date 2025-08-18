import { useState } from 'react';
import GastoManager from './components/GastoManager';
import CategoriaManager from './components/CategoriaManager';
import MetaManager from './components/MetaManager';

function App() {
  const [view, setView] = useState('gastos');

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setView('gastos')} style={{ marginRight: '1rem' }}>
          Gerenciar Gastos
        </button>
        <button onClick={() => setView('categorias')} style={{ marginRight: '1rem' }}>
          Gerenciar Categorias
        </button>
        <button onClick={() => setView('metas')}>
          Gerenciar Metas
        </button>
      </nav>

      {view === 'gastos' && <GastoManager />}
      {view === 'categorias' && <CategoriaManager />}
      {view === 'metas' && <MetaManager />}
    </div>
  );
}

export default App;