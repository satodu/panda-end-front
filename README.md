# 🐼 Panda End — Retro Emulator Frontend

<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Laravel Logo">
  <span style="font-size: 50px; margin: 0 20px; vertical-align: middle;">+</span>
  <img src="https://reactjs.org/logo-og.png" width="100" alt="React Logo" style="vertical-align: middle; border-radius: 10px;">
</p>

O **Panda End** é um frontend moderno, elegante e de alta performance para emulação de consoles retro, projetado para rodar nativamente tanto no **Desktop** quanto em dispositivos **Mobile (Android)**. Utilizando a potência do **NativePHP** combinado com **Laravel**, **Vite**, **React (TypeScript)** e **EmulatorJS**, ele oferece uma biblioteca de jogos offline e multiplayer com sincronização.

---

## ✨ Principais Funcionalidades

### 🎮 Suporte Multiconsola Completo
Jogue clássicos de dezenas de plataformas nostálgicas, incluindo:
* **Nintendo:** NES, SNES, N64, Game Boy (GB), Game Boy Advance (GBA), Nintendo DS (NDS), Virtual Boy.
* **Sega:** Master System, Mega Drive, Game Gear, Sega CD, Sega 32X, Saturn.
* **Sony:** PlayStation (PSX), PSP.
* **Outros:** Atari (2600, 5200, 7800, Jaguar, Lynx), Commodore (C64, C128, Amiga, PET, Plus4, VIC-20), MAME 2003, Arcade, MSX, Neo Geo Pocket, TurboGrafx-16 (PC Engine), WonderSwan e mais.

### 🖥️ Desktop & Mobile (Cross-Platform)
* **Desktop:** Compilado como um aplicativo desktop leve via **Electron** (com PHP rodando nativamente local).
* **Mobile (Android):** Roda usando o **NativePHP Android Bridge** através de uma integração customizada em **Kotlin**, que estabelece a ponte de comunicação e WebView de alto desempenho.

### ⚡ Emulação Inteligente e Offline
* **Proxy de Cache (EmulatorJS CDN):** Na primeira execução, o app baixa os cores WASM e assets do emulador através de uma CDN estável e os salva localmente em `public/emulatorjs/`. Isso permite o funcionamento **100% offline** a partir do segundo uso.
* **Saves Locais:** Salva e carrega instantaneamente seus save states (`.sav`) diretamente no sistema de arquivos do dispositivo.

### 🌐 Netplay Multiplayer (P2P)
* Conecte-se com amigos para jogar cooperativo ou versus de forma online. O Host roda a ROM localmente e sincroniza as entradas de controle (inputs) do Player 2 com latência mínima, sem necessidade de redirecionamento de portas nas configurações do seu roteador.

---

## 🛠️ Stack Tecnológico

* **Core/Backend:** PHP 8.2+ & [Laravel 11](https://laravel.com)
* **Frontend:** [Vite](https://vite.dev) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [TailwindCSS](https://tailwindcss.com) + [Lucide Icons](https://lucide.dev)
* **Desktop Framework:** [NativePHP Electron](https://nativephp.com)
* **Mobile Framework:** [NativePHP Mobile](https://github.com/nativephp/laravel) (Android Module com código nativo Kotlin)
* **Engine de Emulação:** [EmulatorJS](https://emulatorjs.org) (WebAssembly / WASM)

---

## 📦 Como Instalar e Executar Localmente

### Pré-requisitos
Certifique-se de ter instalado em seu ambiente de desenvolvimento:
* PHP 8.2 ou superior (com extensões SQLite e ZIP ativas)
* Composer
* Node.js & npm
* Android SDK & Android Studio (apenas para build do Mobile)

---

### Passo a Passo (Setup Inicial)

1. **Clonar o Repositório:**
   ```bash
   git clone git@github.com:satodu/panda-end-front.git
   cd panda-end-front
   ```

2. **Instalar as dependências do Laravel:**
   ```bash
   composer install
   ```

3. **Instalar as dependências do Frontend (React):**
   ```bash
   npm install
   ```

4. **Configurar as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Criar e Migrar o Banco de Dados SQLite local:**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

---

### Executando em Modo Desenvolvimento

#### 1. Versão Web/Desktop (Vite + Laravel)
Rode o servidor local de desenvolvimento:
```bash
# Servidor Laravel
php artisan serve

# Build em tempo real do React (Vite)
npm run dev
```

Para abrir o aplicativo Desktop via NativePHP Electron:
```bash
php artisan native:serve
```

#### 2. Versão Mobile (Android)
Entre na pasta `mobile/` e configure os links simbólicos necessários antes de compilar:
```bash
# Setup dos links simbólicos das views/assets
shscripts/setup-mobile-symlinks.sh
```

Utilize o assistente automático de compilação em bash para rodar ou gerar o APK:
```bash
# Executa o script de build
shscripts/build-android.sh
```
O script guiará você nas seguintes opções:
1. **Gerar e assinar o APK para Sideload:** Compila o app no formato final auto-assinado e o coloca em `mobile/nativephp/android/app/build/outputs/apk/PandaEnd.apk` para transferência direta para qualquer celular.
2. **Instalar diretamente via USB:** Instala e inicializa diretamente no dispositivo Android conectado por USB com a Depuração USB ativa.
3. **Abrir no Android Studio:** Carrega a pasta de código nativo Kotlin (`mobile/nativephp/android`) para debugs de performance detalhados e desenvolvimento das pontes.

---

## 📁 Estrutura de Pastas Relevante

```text
├── app/Http/Controllers/     # Controladores Laravel (Import, SaveStates, CDN Proxy)
├── config/native.php         # Configurações globais do NativePHP Desktop
├── database/                 # Estruturas do SQLite local
├── mobile/                   # Subprojeto contendo configurações e dependências Mobile
│   ├── nativephp/android/    # Projeto nativo Kotlin de integração com Android (WebView/Wrapper)
│   └── vite.config.ts        # Configuração do Vite para Mobile
├── public/                   # Arquivos públicos e estrutura do EmulatorJS pós-cache
├── resources/js/             # Aplicação SPA React (Vite + TailwindCSS)
│   ├── components/game/      # Container do emulador e grid de jogos
│   ├── views/                # Views (Biblioteca, Importador de ROMs, Netplay, Login)
│   └── main.tsx              # Ponto de entrada do React
├── shscripts/                # Scripts de automatização de build Android
└── vite.config.ts            # Configuração principal do Vite para o app principal
```

---

## 🛡️ Segurança e Boas Práticas (Open Source)

O **Panda End Frontend** está pronto para ser open source! Nossos arquivos `.gitignore` estão calibrados para proteger sua privacidade de desenvolvimento:
* **Banco de dados local e logs:** Nunca são enviados ao repositório.
* **Segredos:** Arquivos `.env` locais estão completamente ocultados.
* **Builds grandes:** Bloqueia instaladores desktop `.exe`/`.dmg` e pacotes ZIP temporários compilados para Android (`laravel_bundle.zip` de ~76MB) para evitar lentidão e bloat no repositório.
* **Credenciais de Produção:** O `google-services.json` (Firebase) é proativamente ignorado para proteger sua conta.

---

## 📄 Licença

Este projeto é open source e licenciado sob a [MIT license](LICENSE).
