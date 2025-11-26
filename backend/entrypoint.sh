#!/bin/bash
set -e

echo "📦 Running migrations..."
npm run migrate || echo "⚠️ migration script failed"

echo "🌱 Running seed..."
npm run seed || echo "⚠️ seed script failed"

echo "🚀 Starting backend server..."
exec npm run dev
