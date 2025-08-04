import React, { useState } from 'react';
import { Fornecedor } from '../models/fornecedor';

interface FornecedorPageProps {
    fornecedores: Fornecedor[];
    setFornecedores: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
}

const FornecedorPage: React.FC<FornecedorPageProps> = ({ fornecedores, setFornecedores }) => {
  const [formState, setFormState] = useState<Partial<Fornecedor>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nome || !formState.contato) return;

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/fornecedores/${formState.id}` : `/fornecedores`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) throw new Error('Falha na requisição');

      if (isEditing) {
        setFornecedores(fornecedores.map(f => f.id === formState.id ? formState as Fornecedor : f));
      } else {
        const novoFornecedor = await response.json();
        setFornecedores([...fornecedores, novoFornecedor]);
      }

      setFormState({});
      setIsEditing(false);
    } catch (error) {
      console.error(`Erro ao salvar fornecedor:`, error);
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setIsEditing(true);
    setFormState(fornecedor);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/fornecedores/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar');
      
      setFornecedores(fornecedores.filter(f => f.id !== id));
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
    }
  };

  return (
    <div className="page-container">
      <h1>Gestão de Fornecedores</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          name="nome"
          value={formState.nome || ''}
          onChange={handleInputChange}
          placeholder="Nome do fornecedor"
          required
        />
        <input
          type="text"
          name="contato"
          value={formState.contato || ''}
          onChange={handleInputChange}
          placeholder="Contato (email ou telefone)"
          required
        />
        <button type="submit">{isEditing ? 'Atualizar' : 'Adicionar'}</button>
      </form>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Contato</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor) => (
            <tr key={fornecedor.id}>
              <td>{fornecedor.id}</td>
              <td>{fornecedor.nome}</td>
              <td>{fornecedor.contato}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => handleEdit(fornecedor)}>Editar</button>
                <button className="delete-btn" onClick={() => handleDelete(fornecedor.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FornecedorPage;
