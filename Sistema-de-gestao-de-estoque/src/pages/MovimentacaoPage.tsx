import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Movimentacao } from '../models/movimentacao';
import { Produto } from '../models/produto';

interface MovimentacaoPageProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  movimentacoes: Movimentacao[];
  setMovimentacoes: React.Dispatch<React.SetStateAction<Movimentacao[]>>;
}

const MovimentacaoPage: React.FC<MovimentacaoPageProps> = ({ produtos, setProdutos, movimentacoes, setMovimentacoes }) => {
  const initialState: Partial<Movimentacao> = {
    produtoId: undefined,
    tipo: 'Entrada',
    quantidade: 1,
  };
  const [formState, setFormState] = useState(initialState);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;
    if (name === 'quantidade') {
      finalValue = value === '' ? undefined : parseInt(value, 10);
    } else if (name === 'produtoId') {
      finalValue = parseInt(value, 10);
    }
    setFormState({ ...formState, [name]: finalValue });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { produtoId, tipo, quantidade } = formState;

    if (!produtoId || !tipo || !quantidade || quantidade <= 0) {
      alert("Por favor, selecione um produto e insira uma quantidade válida.");
      return;
    }
    
    const movimentacaoParaSalvar = {
        produtoId,
        tipo,
        quantidade,
    };

    try {
        const response = await fetch(`/movimentacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimentacaoParaSalvar),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Falha ao registrar movimentação');
        }

        const novaMovimentacao = await response.json();
        
        setMovimentacoes([...movimentacoes, novaMovimentacao]);

        setProdutos(produtos.map(p => {
            if (p.id === produtoId) {
                const novaQuantidade = tipo === 'Entrada' 
                    ? p.quantidade + quantidade 
                    : p.quantidade - quantidade;
                return { ...p, quantidade: novaQuantidade };
            }
            return p;
        }));

        setFormState(initialState);

    } catch (error) {
        console.error('Erro ao registrar movimentação:', error);
        alert(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const getNomeProduto = (id: number) => {
    return produtos.find(p => p.id === id)?.nome || 'Produto não encontrado';
  }

  return (
    <div className="page-container">
      <h1>Movimentação de Estoque</h1>

      <form onSubmit={handleSubmit} className="form-container movement-form-flex">
        <select name="produtoId" value={formState.produtoId || ''} onChange={handleInputChange} required>
          <option value="">Selecione um Produto</option>
          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidade})</option>)}
        </select>
        <select name="tipo" value={formState.tipo || 'Entrada'} onChange={handleInputChange}>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>
        <input name="quantidade" type="number" value={formState.quantidade ?? ''} onChange={handleInputChange} min="1" placeholder="Quantidade"/>
        <button type="submit">Registrar Movimentação</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {movimentacoes.map((mov) => (
            <tr key={mov.id}>
              <td>{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
              <td>{getNomeProduto(mov.produtoId)}</td>
              <td className={mov.tipo === 'Saída' ? 'tipo-saida' : 'tipo-entrada'}>{mov.tipo}</td>
              <td>{mov.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovimentacaoPage;
