namespace GestaoDeEstoque.Api.Models;

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal Preco { get; set; }
    
    // ADICIONE ESTAS DUAS PROPRIEDADES QUE FALTAVAM
    public int CategoriaId { get; set; }
    public int FornecedorId { get; set; }
}
