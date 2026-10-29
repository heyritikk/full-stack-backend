# ---------- Stage 1: build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Pehle sirf csproj copy karo taaki restore ki layer cache ho jaye
COPY InternalBudgetTracker.csproj ./
RUN dotnet restore InternalBudgetTracker.csproj

# Ab baaki source copy karke publish karo
COPY . .
RUN dotnet publish InternalBudgetTracker.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

# ---------- Stage 2: runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Non-root user (base image mein "app" user pehle se bana hota hai)
USER $APP_UID

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "InternalBudgetTracker.dll"]
