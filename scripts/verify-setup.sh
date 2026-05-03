#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Innova Clients — Pre-Commit Verification"
echo "=============================================="

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT_DIR"

PASSED=0
FAILED=0

function check() {
  local name=$1
  local cmd=$2
  
  echo -n "Checking: $name ... "
  if eval "$cmd" > /dev/null 2>&1; then
    echo "✅"
    ((PASSED++))
  else
    echo "❌"
    ((FAILED++))
  fi
}

# Dependencies
check "pnpm installed" "which pnpm"
check "node installed" "which node"

# Monorepo structure
check "apps/practice exists" "test -d apps/practice"
check "apps/teacher exists" "test -d apps/teacher"
check "packages/api-client exists" "test -d packages/api-client"
check "SuperProfes-Design-System exists" "test -d SuperProfes-Design-System"

# Key files
check ".github/workflows/ci.yml exists" "test -f .github/workflows/ci.yml"
check ".github/workflows/deploy.yml exists" "test -f .github/workflows/deploy.yml"
check "vitest.config.ts exists" "test -f vitest.config.ts"
check ".eslintrc.cjs exists" "test -f .eslintrc.cjs"
check ".prettierrc exists" "test -f .prettierrc"

# Fonts
check "Inter-Regular.otf exists" "test -f SuperProfes-Design-System/fonts/Inter-Regular.otf"
check "Inter-Italic.otf exists" "test -f SuperProfes-Design-System/fonts/Inter-Italic.otf"

# Components
check "VisualErrorRenderer.tsx exists" "test -f apps/practice/components/VisualErrorRenderer.tsx"
check "PhotoUploadWorkbench.tsx exists" "test -f apps/practice/components/PhotoUploadWorkbench.tsx"
check "AttemptWorkbench.tsx exists" "test -f apps/practice/components/AttemptWorkbench.tsx"

# Documentation
check "IMPLEMENTATION_CHECKLIST.md exists" "test -f IMPLEMENTATION_CHECKLIST.md"
check "OCR_PHOTO_UPLOAD_FLOW.md exists" "test -f docs/OCR_PHOTO_UPLOAD_FLOW.md"
check "GITHUB_SECRETS_SETUP.md exists" "test -f docs/GITHUB_SECRETS_SETUP.md"
check "prompt-claude-front.md exists" "test -f ../prompt-claude-front.md"

echo ""
echo "📊 Results: ✅ $PASSED / ❌ $FAILED"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo "🚀 All checks passed! Ready for commit."
  echo ""
  echo "📝 Next steps:"
  echo "  1. pnpm install"
  echo "  2. pnpm test:unit"
  echo "  3. pnpm build"
  echo "  4. Add GitHub secrets (see docs/GITHUB_SECRETS_SETUP.md)"
  echo "  5. git add . && git commit -m 'feat: innova-clients MVP'"
  exit 0
else
  echo ""
  echo "❌ Some checks failed. Please review."
  exit 1
fi
