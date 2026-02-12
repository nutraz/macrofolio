#!/bin/bash
cd /home/nutrazz/Projects/macrofolio

echo "=== Git Status ==="
git status

echo ""
echo "=== Git Add All ==="
git add -A

echo ""
echo "=== Git Commit ==="
git commit -m "Security audit fixes: wallet auth validation, deep link security, session handling"

echo ""
echo "=== Git Push ==="
git push origin main

echo ""
echo "=== Done ==="

