#!/bin/sh
set -e

echo "=== Verificando banco de dados SQLite ==="
if [ ! -f "/app/data/prod.db" ]; then
  echo "Banco /app/data/prod.db nao encontrado. Inicializando tabelas com prisma db push..."
  npx prisma db push --skip-generate --accept-data-loss
  echo "Populando dados iniciais..."
  node prisma/seed.js || echo "Aviso: seed falhou ou ja foi executado"
else
  echo "Banco /app/data/prod.db ja existe. Sincronizando possiveis alteracoes de schema..."
  npx prisma db push --skip-generate --accept-data-loss || true
fi

echo "=== Iniciando servidor Next.js ==="
exec "$@"
