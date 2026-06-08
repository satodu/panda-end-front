#!/usr/bin/env bash
# =============================================================================
#  setup-mobile-symlinks.sh
#  Cria/recria todos os symlinks do projeto mobile apontando para o principal.
#  Execute a partir da raiz do projeto (frontend/) ou de shscripts/
# =============================================================================

set -e

# Detecta a raiz do projeto independente de onde o script for chamado
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."          # frontend/
MOBILE="$ROOT/mobile"          # frontend/mobile/

# Cores
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

info()    { echo -e "${GREEN}✔${RESET} $1"; }
warn()    { echo -e "${YELLOW}⚠${RESET}  $1"; }
error()   { echo -e "${RED}✘${RESET} $1"; exit 1; }

echo ""
echo "🐼  Panda End — Setup de Symlinks Mobile"
echo "==========================================="
echo ""

# Verifica se a pasta mobile existe
[ -d "$MOBILE" ] || error "Pasta mobile/ não encontrada em $ROOT"

# Função que recria um symlink com segurança
make_link() {
    local TARGET="$1"   # onde o link vai apontar (relativo ao local do link)
    local LINK="$2"     # caminho completo do link a criar

    # Remove link antigo ou pasta (só se for symlink ou pasta vazia)
    if [ -L "$LINK" ]; then
        rm "$LINK"
    elif [ -d "$LINK" ] && [ -z "$(ls -A "$LINK")" ]; then
        rmdir "$LINK"
    elif [ -d "$LINK" ]; then
        warn "$(basename $LINK) já é uma pasta com conteúdo — pulando (delete manualmente se quiser substituir)"
        return
    fi

    ln -s "$TARGET" "$LINK"
    info "Symlink criado: $(basename $LINK) → $TARGET"
}

echo "📁  PHP / Laravel"
echo "------------------"
make_link "../app"      "$MOBILE/app"
make_link "../routes"   "$MOBILE/routes"

echo ""
echo "🎨  Frontend (React)"
echo "---------------------"
make_link "../resources" "$MOBILE/resources"
make_link "../tailwind.config.js" "$MOBILE/tailwind.config.js"
make_link "../postcss.config.js" "$MOBILE/postcss.config.js"

echo ""
echo "🖼   Assets públicos"
echo "---------------------"
# Garante que a pasta public/capas não existe como pasta real no mobile
make_link "../../public/capas"  "$MOBILE/public/capas"
make_link "../../public/emulatorjs" "$MOBILE/public/emulatorjs"

echo ""
echo "📦  node_modules (opcional — só se quiser compartilhar)"
echo "---------------------------------------------------------"
if [ ! -d "$MOBILE/node_modules" ] || [ -L "$MOBILE/node_modules" ]; then
    warn "node_modules NÃO compartilhado — mobile tem seu próprio. Se quiser compartilhar rode:"
    warn "  ln -s ../node_modules mobile/node_modules"
else
    info "mobile/node_modules já existe como pasta própria (OK)"
fi

echo ""
echo "✅  Symlinks configurados com sucesso!"
echo ""
echo "  Projeto desktop → frontend/"
echo "  Projeto mobile  → frontend/mobile/"
echo ""
echo "  Código compartilhado via symlink:"
echo "    app/  routes/  resources/  public/capas/"
echo ""
