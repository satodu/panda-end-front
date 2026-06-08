#!/usr/bin/env bash
# =============================================================================
#  build-android.sh
#  Faz o build completo do Panda End para Android (APK/AAB).
#  Execute a partir da raiz do projeto (frontend/) ou de shscripts/
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
MOBILE="$ROOT/mobile"

# Cores
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
BOLD="\033[1m"
RESET="\033[0m"

info()    { echo -e "${GREEN}✔${RESET} $1"; }
step()    { echo -e "\n${CYAN}${BOLD}▶ $1${RESET}"; }
warn()    { echo -e "${YELLOW}⚠${RESET}  $1"; }
error()   { echo -e "${RED}✘  ERRO: $1${RESET}"; exit 1; }

echo ""
echo -e "${BOLD}🐼  Panda End — Build Android${RESET}"
echo "=============================="
echo ""

# ── Verificações de ambiente ──────────────────────────────────────────────────

step "Verificando ambiente..."

[ -d "$MOBILE" ] || error "Pasta mobile/ não encontrada. Rode primeiro: shscripts/setup-mobile-symlinks.sh"

command -v php    >/dev/null 2>&1 || error "PHP não encontrado no PATH"
command -v npm    >/dev/null 2>&1 || error "npm não encontrado no PATH"
command -v java   >/dev/null 2>&1 || error "Java não encontrado. Instale o JDK (Android Studio inclui)"

# Verifica ANDROID_HOME — tenta detectar automaticamente se não estiver definido
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    # Locais comuns no Linux
    for CANDIDATE in "$HOME/Android/Sdk" "$HOME/android/sdk" "/opt/android-sdk" "/usr/lib/android-sdk"; do
        if [ -d "$CANDIDATE" ]; then
            export ANDROID_HOME="$CANDIDATE"
            warn "ANDROID_HOME não estava definido. Detectado automaticamente: $ANDROID_HOME"
            break
        fi
    done
    if [ -z "$ANDROID_HOME" ]; then
        warn "ANDROID_HOME não encontrado. Defina em ~/.bashrc:"
        warn "  export ANDROID_HOME=\$HOME/Android/Sdk"
        warn "  export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    fi
fi

# Adiciona platform-tools e build-tools mais recente ao PATH
if [ -n "$ANDROID_HOME" ]; then
    export PATH="$PATH:$ANDROID_HOME/platform-tools"
    # Pega a versão mais recente do build-tools
    BUILDTOOLS=$(ls -v "$ANDROID_HOME/build-tools" 2>/dev/null | tail -1)
    [ -n "$BUILDTOOLS" ] && export PATH="$PATH:$ANDROID_HOME/build-tools/$BUILDTOOLS"
    info "Android SDK: $ANDROID_HOME (build-tools: $BUILDTOOLS)"
fi

info "PHP:  $(php --version | head -1)"
info "npm:  $(npm --version)"
info "Java: $(java -version 2>&1 | head -1)"

# ── Verificar symlinks ────────────────────────────────────────────────────────

step "Verificando symlinks..."

MISSING_LINKS=0
for LINK in app routes resources public/capas public/emulatorjs; do
    if [ ! -L "$MOBILE/$LINK" ]; then
        warn "Symlink mobile/$LINK não encontrado"
        MISSING_LINKS=1
    else
        info "mobile/$LINK → OK"
    fi
done

if [ "$MISSING_LINKS" = "1" ]; then
    echo ""
    warn "Symlinks ausentes. Criando automaticamente..."
    bash "$SCRIPT_DIR/setup-mobile-symlinks.sh"
fi

# ── Build do frontend (Vite/React) ────────────────────────────────────────────

step "Build do frontend React (Vite)..."

cd "$MOBILE"
npm run build
info "Frontend compilado com sucesso"

# ── Configurar .env se necessário ─────────────────────────────────────────────

step "Verificando .env do mobile..."

if [ ! -f "$MOBILE/.env" ]; then
    warn ".env não encontrado. Copiando de .env.example..."
    cp "$MOBILE/.env.example" "$MOBILE/.env"
    php artisan key:generate --ansi
fi

if ! grep -q "NATIVEPHP_APP_ID" "$MOBILE/.env"; then
    echo "" >> "$MOBILE/.env"
    echo "NATIVEPHP_APP_ID=com.pandaend.app" >> "$MOBILE/.env"
    echo "NATIVEPHP_APP_NAME=PandaEnd" >> "$MOBILE/.env"
    echo "NATIVEPHP_APP_VERSION=1.0.0" >> "$MOBILE/.env"
    warn "NATIVEPHP_APP_ID adicionado ao .env. Edite em $MOBILE/.env se necessário."
fi

info "NATIVEPHP_APP_ID=$(grep '^NATIVEPHP_APP_ID=' "$MOBILE/.env" | cut -d'=' -f2 | head -1)"

# ── Escolha do tipo de build ──────────────────────────────────────────────────

echo ""
echo -e "${BOLD}O que deseja fazer?${RESET}"
echo "  1) Gerar APK para instalar no celular (sideload)  ✅ recomendado"
echo "  2) Instalar direto via USB no dispositivo conectado"
echo "  3) Abrir projeto no Android Studio"
echo ""
read -rp "Escolha [1/2/3]: " CHOICE

# Detecta o Java do Android Studio para usar nas ferramentas
AS_JAVA="/opt/android-studio/jbr/bin"
APKSIGNER="$ANDROID_HOME/build-tools/37.0.0/apksigner"
[ ! -f "$APKSIGNER" ] && APKSIGNER=$(find "$ANDROID_HOME/build-tools" -name "apksigner" 2>/dev/null | sort -V | tail -1)

sign_apk() {
    local UNSIGNED="$1"
    local SIGNED="$2"
    local KS="$HOME/.android/debug.keystore"

    # Cria debug keystore se não existir
    if [ ! -f "$KS" ]; then
        step "Criando debug keystore..."
        "$AS_JAVA/keytool" -genkeypair -v \
            -keystore "$KS" -alias androiddebugkey \
            -keyalg RSA -keysize 2048 -validity 10000 \
            -storepass android -keypass android \
            -dname "CN=Android Debug,O=Android,C=US" 2>&1 | grep -v "^$"
    fi

    step "Assinando APK..."
    PATH="$AS_JAVA:$PATH" "$APKSIGNER" sign \
        --ks "$KS" \
        --ks-key-alias androiddebugkey \
        --ks-pass pass:android \
        --key-pass pass:android \
        --out "$SIGNED" "$UNSIGNED"
    info "APK assinado: $SIGNED"
}

case "$CHOICE" in
    1)
        # Garante que temos a keystore antes de empacotar
        KS="$HOME/.android/debug.keystore"
        if [ ! -f "$KS" ]; then
            step "Criando debug keystore..."
            "$AS_JAVA/keytool" -genkeypair -v \
                -keystore "$KS" -alias androiddebugkey \
                -keyalg RSA -keysize 2048 -validity 10000 \
                -storepass android -keypass android \
                -dname "CN=Android Debug,O=Android,C=US" 2>&1 | grep -v "^$"
        fi

        step "Gerando e assinando o APK para sideload (sem dispositivo necessário)..."
        echo ""
        warn "Isso pode demorar alguns minutos na primeira vez (Gradle)..."
        echo ""
        cd "$MOBILE"
        
        # Roda o empacotamento com o keystore debug gerado
        PATH="$AS_JAVA:$PATH" php -d memory_limit=-1 artisan native:package android \
            --keystore="$KS" \
            --keystore-password=android \
            --key-alias=androiddebugkey \
            --key-password=android \
            --no-tty

        # Procura o APK gerado
        RELEASE_APK=$(find "$MOBILE" -name "app-release.apk" 2>/dev/null | head -1)
        UNSIGNED=$(find "$MOBILE" -name "app-release-unsigned.apk" 2>/dev/null | head -1)
        DEBUG_APK=$(find "$MOBILE" -name "app-debug.apk" 2>/dev/null | head -1)
        SIGNED_OUT="$MOBILE/nativephp/android/app/build/outputs/apk/PandaEnd.apk"

        if [ -n "$RELEASE_APK" ]; then
            cp "$RELEASE_APK" "$SIGNED_OUT"
            info "APK release (já assinado): $SIGNED_OUT"
        elif [ -n "$DEBUG_APK" ]; then
            cp "$DEBUG_APK" "$SIGNED_OUT"
            info "APK debug (já assinado): $SIGNED_OUT"
        elif [ -n "$UNSIGNED" ]; then
            sign_apk "$UNSIGNED" "$SIGNED_OUT"
        else
            warn "APK não encontrado. Tente a opção 3 (Android Studio) para gerar manualmente."
            exit 1
        fi

        echo ""
        echo -e "${GREEN}${BOLD}✅  APK pronto para sideload!${RESET}"
        echo ""
        echo "  Copie o arquivo abaixo para o celular e instale:"
        echo "  📦 $SIGNED_OUT"
        echo ""
        echo "  Ou instale via ADB:"
        echo "  adb install \"$SIGNED_OUT\""
        ;;
    2)
        step "Instalando direto no dispositivo Android via USB..."
        echo ""
        warn "Certifique-se de que um dispositivo está conectado com USB Debugging ativo."
        echo ""
        cd "$MOBILE" && php -d memory_limit=-1 artisan native:run android
        ;;
    3)
        step "Abrindo Android Studio..."
        ANDROID_PROJECT="$MOBILE/nativephp/android"
        # Tenta native:open primeiro; se falhar, abre diretamente
        if command -v android-studio >/dev/null 2>&1; then
            android-studio "$ANDROID_PROJECT" &
            info "Android Studio abrindo com o projeto: $ANDROID_PROJECT"
        else
            cd "$MOBILE" && php -d memory_limit=-1 artisan native:open
        fi
        echo ""
        echo "  No Android Studio:"
        echo "  Build → Build Bundle(s)/APK(s) → Build APK(s)"
        echo ""
        echo "  APK gerado em:"
        echo "  $ANDROID_PROJECT/app/build/outputs/apk/debug/app-debug.apk"
        ;;
    *)
        warn "Opção inválida — saindo."
        exit 0
        ;;
esac

echo ""
