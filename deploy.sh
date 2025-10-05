#!/bin/bash

# Deploy script for Sintex.AI to GitHub Pages
echo "🚀 Deploying Sintex.AI to Production..."
echo "========================================"

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "✅ gh-pages branch exists"
else
    echo "📝 Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    git checkout main
fi

# Ensure we're on main branch
git checkout main

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Check if .nojekyll exists (needed for GitHub Pages)
if [ ! -f .nojekyll ]; then
    echo "📝 Creating .nojekyll file..."
    touch .nojekyll
    git add .nojekyll
    git commit -m "Add .nojekyll for GitHub Pages"
    git push origin main
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to gh-pages branch
echo "🌐 Deploying to gh-pages branch..."
git checkout gh-pages
git merge main --no-edit
git push origin gh-pages

# Return to main branch
git checkout main

echo ""
echo "✅ Deploy completed successfully!"
echo "========================================"
echo "🔗 Your site will be available at:"
echo "   https://standardbitcoin10.github.io/Sintex.Ai-Build-Phanton/"
echo ""
echo "⏰ Note: It may take a few minutes for changes to appear."
echo "========================================"