#!/bin/bash
set -e

cd /home/nutrazz/Projects/macrofolio

echo "Staging all changes..."
git add -A

echo "Committing..."
git commit -m "Security audit fixes: wallet auth validation, deep link security, session handling"

echo "Pushing to origin..."
if command -v gh &> /dev/null; then
    echo "Using GitHub CLI..."
    gh repo set-default 2>/dev/null || true
    git push origin main
else
    echo "Using regular git..."
    git push origin main
fi

echo "Done!"

