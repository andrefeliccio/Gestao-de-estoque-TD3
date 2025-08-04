import { Categoria } from './categoria';
import { Fornecedor } from './fornecedor';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  quantidade: number;
  preco: number;
  categoriaId: number; 
  fornecedorId: number;
}