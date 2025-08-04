# Estágio 1: Construir o Front-end (React)
FROM node:18 AS build-frontend
WORKDIR /app
COPY ["Sistema-de-gestao-de-estoque/package.json", "Sistema-de-gestao-de-estoque/package-lock.json", "./"]
RUN npm install
COPY Sistema-de-gestao-de-estoque/ ./
# ADICIONADO: Define a URL pública como relativa para o build do Docker
ENV PUBLIC_URL=.
RUN npm run build

# Estágio 2: Construir o Back-end (.NET)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-backend
WORKDIR /src
COPY ["backend/GestaoDeEstoque.Api/GestaoDeEstoque.Api.csproj", "GestaoDeEstoque.Api/"]
RUN dotnet restore "GestaoDeEstoque.Api/GestaoDeEstoque.Api.csproj"
COPY backend/ .
WORKDIR "/src/GestaoDeEstoque.Api"
RUN dotnet publish "GestaoDeEstoque.Api.csproj" -c Release -o /app/publish

# Estágio Final: Criar a imagem de produção
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-backend /app/publish .
COPY --from=build-frontend /app/build ./wwwroot 

EXPOSE 8080
ENTRYPOINT ["dotnet", "GestaoDeEstoque.Api.dll"]
