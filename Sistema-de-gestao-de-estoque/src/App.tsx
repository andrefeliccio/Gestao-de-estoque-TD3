import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, NavLink } from 'react-router-dom';

import CategoriaPage from './pages/CategoriaPage';
import FornecedorPage from './pages/FornecedorPage';
import ProdutoPage from './pages/ProdutoPage';
import MovimentacaoPage from './pages/MovimentacaoPage';

import { Categoria } from './models/categoria';
import { Fornecedor } from './models/fornecedor';
import { Produto } from './models/produto';
import { Movimentacao } from './models/movimentacao';

import './App.css';

const API_URL = "http://localhost:5052";

function App() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carregamento

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usa Promise.all para esperar que todas as requisições terminem
        const [produtosRes, categoriasRes, fornecedoresRes, movimentacoesRes] = await Promise.all([
          fetch(`${API_URL}/produtos`),
          fetch(`${API_URL}/categorias`),
          fetch(`${API_URL}/fornecedores`),
          fetch(`${API_URL}/movimentacoes`) // Adiciona a busca por movimentações
        ]);

        if (!produtosRes.ok || !categoriasRes.ok || !fornecedoresRes.ok || !movimentacoesRes.ok) {
          throw new Error('Falha ao carregar dados iniciais');
        }

        const produtosData = await produtosRes.json();
        const categoriasData = await categoriasRes.json();
        const fornecedoresData = await fornecedoresRes.json();
        const movimentacoesData = await movimentacoesRes.json(); // Adiciona a conversão para JSON

        // Atualiza todos os estados de uma vez, evitando a "corrida"
        setProdutos(produtosData);
        setCategorias(categoriasData);
        setFornecedores(fornecedoresData);
        setMovimentacoes(movimentacoesData); // Adiciona a atualização do estado

      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // Mostra uma mensagem de "Carregando..." enquanto os dados não chegam
  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>A carregar dados...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <h2>Menu Principal</h2>
          <ul>
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>Produtos</NavLink></li>
            <li><NavLink to="/categorias" className={({isActive}) => isActive ? "active-link" : ""}>Categorias</NavLink></li>
            <li><NavLink to="/fornecedores" className={({isActive}) => isActive ? "active-link" : ""}>Fornecedores</NavLink></li>
            <li><NavLink to="/movimentacoes" className={({isActive}) => isActive ? "active-link" : ""}>Movimentações</NavLink></li>
          </ul>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={
                <ProdutoPage 
                    produtos={produtos} 
                    setProdutos={setProdutos} 
                    categorias={categorias} 
                    fornecedores={fornecedores} 
                />} 
            />
            <Route path="/categorias" element={
                <CategoriaPage 
                    categorias={categorias} 
                    setCategorias={setCategorias} 
                />} 
            />
            <Route path="/fornecedores" element={
                <FornecedorPage 
                    fornecedores={fornecedores} 
                    setFornecedores={setFornecedores}
                />}
            />
            <Route path="/movimentacoes" element={
                <MovimentacaoPage 
                    produtos={produtos} 
                    setProdutos={setProdutos} 
                    movimentacoes={movimentacoes}
                    setMovimentacoes={setMovimentacoes}
                />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
