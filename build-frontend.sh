#!/bin/bash
cd macrofolio/src/macrofolio_assets
# Clean install avoiding peer dependency conflicts
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --no-audit --no-fund
npm run build
