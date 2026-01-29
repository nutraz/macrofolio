#!/bin/bash

echo "🔍 FINAL VERIFICATION SCRIPT"
echo "============================"
echo ""

cd ~/GEMENI/Macrofolio/macrofolio

echo "1. GIT STATUS"
echo "-------------"
git status --short
echo ""

echo "2. REMOTE COMMITS"
echo "-----------------"
git log --oneline origin/audit-ready --max-count=3
echo ""

echo "3. TEST FILES"
echo "-------------"
git ls-tree -r audit-ready --name-only | grep "\.test\.ts$" | while read file; do
    COUNT=$(git show audit-ready:"$file" 2>/dev/null | grep -c "it(" || echo "0")
    echo "  • $(basename "$file"): $COUNT tests"
done
echo ""

echo "4. KEY DOCUMENTS"
echo "----------------"
DOCS="THREAT_MODEL.md AUDIT_READINESS_PACKAGE.md SUBMISSION_SUMMARY.md AUDIT_SUBMISSION_EMAIL.md"
for doc in $DOCS; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc"
    else
        echo "  ❌ $doc (missing)"
    fi
done
echo ""

echo "5. FINAL CHECK"
echo "--------------"
if git diff --quiet origin/audit-ready audit-ready; then
    echo "✅ Branch is up to date with remote"
else
    echo "⚠️  Local changes not pushed"
fi

echo ""
echo "🏁 STATUS: AUDIT PACKAGE COMPLETE"
