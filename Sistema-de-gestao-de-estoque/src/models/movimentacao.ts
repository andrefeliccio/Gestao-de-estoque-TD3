export interface Movimentacao {
    id: number;
    produtoId: number;
    tipo: 'Entrada' | 'Saída';
    quantidade: number;
    data: string; 


}