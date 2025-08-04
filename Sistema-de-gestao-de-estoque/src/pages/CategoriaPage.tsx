import React, { useState } from 'react';
import { Categoria } from '../models/categoria';

interface CategoriaPageProps {
  categorias: Categoria[];
  setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
}

const CategoriaPage: React.FC<CategoriaPageProps> = ({ categorias, setCategorias }) => {
  const [formState, setFormState] = useState<Partial<Categoria>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nome) return;

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/categorias/${formState.id}` : `/categorias`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) throw new Error('Falha na requisição');

      if (isEditing) {
        setCategorias(categorias.map(c => c.id === formState.id ? formState as Categoria : c));
      } else {
        const novaCategoria = await response.json();
        setCategorias([...categorias, novaCategoria]);
      }

      setFormState({});
      setIsEditing(false);
    } catch (error) {
      console.error(`Erro ao salvar categoria:`, error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setIsEditing(true);
    setFormState(categoria);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/categorias/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar');
      
      setCategorias(categorias.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  return (
    <div className="page-container">
      <h1>Gestão de Categorias</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          name="nome"
          value={formState.nome || ''}
          onChange={handleInputChange}
          placeholder="Nome da categoria"
          required
        />
        <button type="submit">{isEditing ? 'Atualizar' : 'Adicionar'}</button>
      </form>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>{categoria.id}</td>
              <td>{categoria.nome}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => handleEdit(categoria)}>Editar</button>
                <button className="delete-btn" onClick={() => handleDelete(categoria.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriaPage;
