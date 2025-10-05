#!/bin/bash

# Deploy para Netlify
echo "🚀 Deploying Sintex.AI to Netlify..."
echo "====================================="

# Verifica se o Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy para Netlify
echo "📤 Enviando para Netlify..."
netlify deploy --prod --dir=. --site sintex-ai

echo ""
echo "✅ Deploy para Netlify concluído!"
echo "====================================="
echo "🔗 Site disponível em: https://sintex-ai.netlify.app"
echo "====================================="