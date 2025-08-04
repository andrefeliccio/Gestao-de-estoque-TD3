using Microsoft.EntityFrameworkCore;
using GestaoDeEstoque.Api.Models;

namespace GestaoDeEstoque.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Garanta que todas as suas entidades estão listadas aqui
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Fornecedor> Fornecedores { get; set; }
    public DbSet<Movimentacao> Movimentacoes { get; set; }
}
