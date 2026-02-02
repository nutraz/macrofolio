#!/bin/bash
echo "=== Final Vercel Fix ==="

cd ~/Desktop/macrofolio

# 1. Create correct vercel.json
cat > vercel.json << 'EOF2'
{
  "buildCommand": "cd macrofolio/src/macrofolio_assets && npm run build",
  "outputDirectory": "macrofolio/src/macrofolio_assets/dist",
  "installCommand": "cd macrofolio/src/macrofolio_assets && npm install --legacy-peer-deps",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF2

echo "✅ Updated vercel.json:"
cat vercel.json

# 2. Test the build locally
echo -e "\n=== Testing build command ==="
cd macrofolio/src/macrofolio_assets
if npm run build 2>&1 | tail -5 | grep -q "✓"; then
    echo "✅ Local build successful!"
    echo "Build output in: $(pwd)/dist"
    ls -la dist/ 2>/dev/null | head -5
else
    echo "❌ Local build failed, checking errors..."
    npm run build 2>&1 | tail -20
fi

# 3. Commit and push
echo -e "\n=== Committing changes ==="
cd ~/Desktop/macrofolio
git add vercel.json
git commit -m "fix: correct vercel build paths for nested structure"
git push

echo "=== Done! Trigger Vercel deployment ==="
