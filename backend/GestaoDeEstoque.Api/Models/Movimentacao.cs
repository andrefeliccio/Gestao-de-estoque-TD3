using System;

namespace GestaoDeEstoque.Api.Models;

public class Movimentacao
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
}
