# Stage 1: build frontend
FROM node:22-alpine AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# frontend/.env is gitignored, so the API base must be set here
ENV VITE_API_BASE=/api
RUN npm run build

# Stage 2: build backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/backend.csproj .
RUN dotnet restore
COPY backend/ .
RUN dotnet publish -c Release -o /app

# Stage 3: runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
COPY --from=frontend /fe/dist ./wwwroot
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "backend.dll"]
