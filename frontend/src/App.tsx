import { useState } from "react";
import GastoManager from "./components/GastoManager";
import CategoriaManager from "./components/CategoriaManager";
import MetaManager from "./components/MetaManager";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("gastos");

  return (
    <div className="finance-app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="app-icon"></span>
            Controle Financeiro
          </h1>
          <p className="app-subtitle">Gerencie seus gastos, categorias e metas financeiras</p>
        </div>
      </header>

      <main className="app-main">
        <nav className="app-navigation">
          <button 
            className={`nav-button ${activeTab === "gastos" ? "active" : ""}`}
            onClick={() => setActiveTab("gastos")}
          >
            <span className="nav-icon"></span>
            Gastos
          </button>
          <button 
            className={`nav-button ${activeTab === "categorias" ? "active" : ""}`}
            onClick={() => setActiveTab("categorias")}
          >
            <span className="nav-icon"></span>
            Categorias
          </button>
          <button 
            className={`nav-button ${activeTab === "metas" ? "active" : ""}`}
            onClick={() => setActiveTab("metas")}
          >
            <span className="nav-icon"></span>
            Metas
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === "gastos" && <GastoManager />}
          {activeTab === "categorias" && <CategoriaManager />}
          {activeTab === "metas" && <MetaManager />}
        </div>
      </main>
    </div>
  );
}

export default App;