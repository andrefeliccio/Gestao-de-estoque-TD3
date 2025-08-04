import React, { useState, useEffect } from 'react';
import { Produto } from '../models/produto';
import { Categoria } from '../models/categoria';
import { Fornecedor } from '../models/fornecedor';

interface ProdutoPageProps {
  categorias: Categoria[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
}

const ProdutoPage: React.FC<ProdutoPageProps> = ({ categorias, fornecedores, produtos, setProdutos }) => {
  const [formState, setFormState] = useState<Partial<Produto>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/produtos`)
      .then(response => response.json())
      .then(data => setProdutos(data))
      .catch(error => console.error('Erro ao buscar produtos:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['quantidade', 'preco', 'categoriaId', 'fornecedorId'].includes(name);

    if (isNumericField) {
      setFormState({ ...formState, [name]: value === '' ? undefined : parseFloat(value) });
    } else {
      setFormState({ ...formState, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nome || !formState.categoriaId || !formState.fornecedorId) return;

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/produtos/${formState.id}` : `/produtos`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          quantidade: formState.quantidade || 0,
          preco: formState.preco || 0,
        }),
      });

      if (!response.ok) throw new Error('Falha na requisição');

      if (isEditing) {
        setProdutos(produtos.map(p => p.id === formState.id ? { ...p, ...formState } as Produto : p));
      } else {
        const novoProduto = await response.json();
        setProdutos([...produtos, novoProduto]);
      }

      setFormState({});
      setIsEditing(false);
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'salvar' : 'criar'} produto:`, error);
    }
  };

  const handleEdit = (produto: Produto) => {
    setIsEditing(true);
    setFormState(produto);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/produtos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar');
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };
  
  const getNome = (id: number | undefined, lista: {id: number, nome: string}[]) => {
    if (id === undefined) return 'N/A';
    return lista.find(item => item.id === id)?.nome || 'Não encontrado';
  }

  return (
    <div className="page-container">
      <h1>Gestão de Produtos</h1>
      <form onSubmit={handleSubmit} className="product-form-grid">
        <input name="nome" value={formState.nome || ''} onChange={handleInputChange} placeholder="Nome do produto" required />
        <input name="descricao" value={formState.descricao || ''} onChange={handleInputChange} placeholder="Descrição" />
        <input
          name="quantidade"
          type="number"
          value={formState.quantidade ?? ''}
          onChange={handleInputChange}
          placeholder="Quantidade"
        />
        <input
          name="preco"
          type="number"
          step="0.01"
          value={formState.preco ?? ''}
          onChange={handleInputChange}
          placeholder="Preço"
        />
        <select name="categoriaId" value={formState.categoriaId || ''} onChange={handleInputChange} required>
          <option value="">Selecione a Categoria</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select name="fornecedorId" value={formState.fornecedorId || ''} onChange={handleInputChange} required>
          <option value="">Selecione o Fornecedor</option>
          {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        <button type="submit">{isEditing ? 'Atualizar' : 'Adicionar'}</button>
      </form>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Qtd.</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Fornecedor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>{produto.quantidade}</td>
              <td>R$ {produto.preco.toFixed(2)}</td>
              <td>{getNome(produto.categoriaId, categorias)}</td>
              <td>{getNome(produto.fornecedorId, fornecedores)}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => handleEdit(produto)}>Editar</button>
                <button className="delete-btn" onClick={() => handleDelete(produto.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProdutoPage;
