#!/bin/sh
set -e

# Extrai o caminho do arquivo SQLite da variável DATABASE_URL (ex: file:/app/data/teste.db -> /app/data/teste.db)
DB_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
if [ -z "$DB_PATH" ]; then
  DB_PATH="/app/data/prod.db"
fi

echo "=== Verificando banco de dados SQLite ($DB_PATH) ==="
if [ ! -f "$DB_PATH" ]; then
  echo "Banco $DB_PATH nao encontrado. Inicializando tabelas com prisma db push..."
  npx prisma db push --skip-generate --accept-data-loss
  echo "Populando dados iniciais..."
  node prisma/seed.js || echo "Aviso: seed falhou ou ja foi executado"
else
  echo "Banco $DB_PATH ja existe. Sincronizando possiveis alteracoes de schema..."
  npx prisma db push --skip-generate --accept-data-loss || true
fi

echo "=== Iniciando servidor Next.js ==="
exec "$@"
