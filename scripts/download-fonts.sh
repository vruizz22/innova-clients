#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
FONTS_DIR="$ROOT_DIR/SuperProfes-Design-System/fonts"
mkdir -p "$FONTS_DIR"

if [ -f "$FONTS_DIR/InterVariable.woff2" ]; then
  echo "InterVariable.woff2 already present"
  exit 0
fi

if [ -z "${INTER_VARIABLE_URL:-}" ]; then
  echo "No INTER_VARIABLE_URL set. To auto-download set the env var to a direct .woff2 URL."
  echo "Example: INTER_VARIABLE_URL=https://example.com/InterVariable.woff2 ./scripts/download-fonts.sh"
  exit 1
fi

echo "Downloading InterVariable.woff2 from $INTER_VARIABLE_URL"
curl -L "$INTER_VARIABLE_URL" -o "$FONTS_DIR/InterVariable.woff2"
echo "Saved to $FONTS_DIR/InterVariable.woff2"
