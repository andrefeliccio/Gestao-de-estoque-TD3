using Microsoft.EntityFrameworkCore;
using GestaoDeEstoque.Api.Data;
using GestaoDeEstoque.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Configuração dos Serviços ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(opt => 
    opt.UseInMemoryDatabase("EstoqueDB"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- Configuração do Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// REMOVIDO: app.UseHttpsRedirection(); para evitar o aviso no Docker
app.UseCors("AllowReactApp");

// --- LINHAS PARA SERVIR O FRONT-END ---
app.UseDefaultFiles(); // Procura por index.html na pasta wwwroot
app.UseStaticFiles();  // Serve os arquivos estáticos (CSS, JS, etc.) da wwwroot

// --- ENDPOINTS DA API ---

// CRUD para Produtos
app.MapGet("/produtos", async (AppDbContext db) => await db.Produtos.ToListAsync());
app.MapGet("/produtos/{id}", async (int id, AppDbContext db) => await db.Produtos.FindAsync(id) is { } produto ? Results.Ok(produto) : Results.NotFound());
app.MapPost("/produtos", async (Produto produto, AppDbContext db) => { db.Produtos.Add(produto); await db.SaveChangesAsync(); return Results.Created($"/produtos/{produto.Id}", produto); });
app.MapPut("/produtos/{id}", async (int id, Produto produtoAtualizado, AppDbContext db) => { var produto = await db.Produtos.FindAsync(id); if (produto is null) return Results.NotFound(); produto.Nome = produtoAtualizado.Nome; produto.Descricao = produtoAtualizado.Descricao; produto.Quantidade = produtoAtualizado.Quantidade; produto.Preco = produtoAtualizado.Preco; produto.CategoriaId = produtoAtualizado.CategoriaId; produto.FornecedorId = produtoAtualizado.FornecedorId; await db.SaveChangesAsync(); return Results.NoContent(); });
app.MapDelete("/produtos/{id}", async (int id, AppDbContext db) => { var produto = await db.Produtos.FindAsync(id); if (produto is null) return Results.NotFound(); db.Produtos.Remove(produto); await db.SaveChangesAsync(); return Results.Ok(produto); });

// CRUD para Categorias
app.MapGet("/categorias", async (AppDbContext db) => await db.Categorias.ToListAsync());
app.MapPost("/categorias", async (Categoria categoria, AppDbContext db) => { db.Categorias.Add(categoria); await db.SaveChangesAsync(); return Results.Created($"/categorias/{categoria.Id}", categoria); });
app.MapPut("/categorias/{id}", async (int id, Categoria categoriaAtualizada, AppDbContext db) => { var categoria = await db.Categorias.FindAsync(id); if (categoria is null) return Results.NotFound(); categoria.Nome = categoriaAtualizada.Nome; await db.SaveChangesAsync(); return Results.NoContent(); });
app.MapDelete("/categorias/{id}", async (int id, AppDbContext db) => { var categoria = await db.Categorias.FindAsync(id); if (categoria is null) return Results.NotFound(); db.Categorias.Remove(categoria); await db.SaveChangesAsync(); return Results.Ok(categoria); });

// CRUD para Fornecedores
app.MapGet("/fornecedores", async (AppDbContext db) => await db.Fornecedores.ToListAsync());
app.MapPost("/fornecedores", async (Fornecedor fornecedor, AppDbContext db) => { db.Fornecedores.Add(fornecedor); await db.SaveChangesAsync(); return Results.Created($"/fornecedores/{fornecedor.Id}", fornecedor); });
app.MapPut("/fornecedores/{id}", async (int id, Fornecedor fornecedorAtualizado, AppDbContext db) => { var fornecedor = await db.Fornecedores.FindAsync(id); if (fornecedor is null) return Results.NotFound(); fornecedor.Nome = fornecedorAtualizado.Nome; fornecedor.Contato = fornecedorAtualizado.Contato; await db.SaveChangesAsync(); return Results.NoContent(); });
app.MapDelete("/fornecedores/{id}", async (int id, AppDbContext db) => { var fornecedor = await db.Fornecedores.FindAsync(id); if (fornecedor is null) return Results.NotFound(); db.Fornecedores.Remove(fornecedor); await db.SaveChangesAsync(); return Results.Ok(fornecedor); });

// Endpoints para Movimentações
app.MapGet("/movimentacoes", async (AppDbContext db) => await db.Movimentacoes.ToListAsync());
app.MapPost("/movimentacoes", async (Movimentacao movimentacao, AppDbContext db) => {
    var produto = await db.Produtos.FindAsync(movimentacao.ProdutoId);
    if (produto is null) return Results.NotFound("Produto não encontrado.");

    if (movimentacao.Tipo == "Entrada") {
        produto.Quantidade += movimentacao.Quantidade;
    } else if (movimentacao.Tipo == "Saída") {
        if (produto.Quantidade < movimentacao.Quantidade) return Results.BadRequest("Estoque insuficiente.");
        produto.Quantidade -= movimentacao.Quantidade;
    }
    
    db.Movimentacoes.Add(movimentacao);
    await db.SaveChangesAsync();
    return Results.Created($"/movimentacoes/{movimentacao.Id}", movimentacao);
});


// --- LINHA DE FALLBACK PARA O REACT ROUTER ---
// Se nenhuma rota da API for encontrada, envia o index.html para o React Router assumir
app.MapFallbackToFile("/index.html");

app.Run();
