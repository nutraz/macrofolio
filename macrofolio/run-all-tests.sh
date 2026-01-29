#!/bin/bash

echo "🚀 Running Complete Macrofolio Test Suite"
echo "=========================================="

echo ""
echo "1. SMART CONTRACT TESTS (Hardhat)"
echo "=================================="
cd test
if npx hardhat test; then
    echo "✅ Smart contract tests PASSED"
    SC_RESULT=0
else
    echo "❌ Smart contract tests FAILED"
    SC_RESULT=1
fi
cd ..

echo ""
echo "2. FRONTEND SECURITY TESTS (Jest)"
echo "=================================="
cd src/macrofolio_assets
if npm run test:security 2>/dev/null || npx jest src/__tests__/security.test.ts src/__tests__/wallet.test.ts; then
    echo "✅ Frontend security tests PASSED"
    FE_RESULT=0
else
    echo "❌ Frontend security tests FAILED"
    FE_RESULT=1
fi
cd ../..

echo ""
echo "📊 TEST SUMMARY"
echo "==============="
if [ $SC_RESULT -eq 0 ] && [ $FE_RESULT -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    exit 0
else
    echo "⚠️ Some tests failed:"
    [ $SC_RESULT -ne 0 ] && echo "  - Smart contract tests"
    [ $FE_RESULT -ne 0 ] && echo "  - Frontend security tests"
    exit 1
fi
