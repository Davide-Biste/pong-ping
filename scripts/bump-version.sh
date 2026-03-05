#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

# ── Versione ────────────────────────────────────────────────────────────────
if [ -n "$1" ]; then
  VERSION="$1"
else
  read -rp "Versione da rilasciare (es. 0.3.0): " VERSION
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Formato versione non valido: '$VERSION'. Usa X.Y.Z"
  exit 1
fi

echo "→ Bump versione a $VERSION"

# ── tauri.conf.json ──────────────────────────────────────────────────────────
TAURI_CONF="$ROOT/src-tauri/tauri.conf.json"
sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$TAURI_CONF"
rm "$TAURI_CONF.bak"
echo "  ✓ src-tauri/tauri.conf.json"

# ── src-tauri/Cargo.toml ─────────────────────────────────────────────────────
CARGO_TOML="$ROOT/src-tauri/Cargo.toml"
sed -i.bak "s/^version = \"[^\"]*\"/version = \"$VERSION\"/" "$CARGO_TOML"
rm "$CARGO_TOML.bak"
echo "  ✓ src-tauri/Cargo.toml"

# ── package.json ─────────────────────────────────────────────────────────────
PACKAGE_JSON="$ROOT/package.json"
sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$PACKAGE_JSON"
rm "$PACKAGE_JSON.bak"
echo "  ✓ package.json"

# ── Commit ───────────────────────────────────────────────────────────────────
cd "$ROOT"
git add src-tauri/tauri.conf.json src-tauri/Cargo.toml package.json
git commit -m "🔖 bump version to $VERSION"

echo ""
echo "Fatto! Ora chiudi la release gitflow:"
echo ""
echo "  git flow release finish v$VERSION"
echo "  git push origin master develop --tags"
echo ""
