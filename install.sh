#!/bin/bash
# String Çıkarıcı Kurulum Betiği
# Güvenlik Notu: Bu betik root yetkisi gerektirir.

set -e

echo "[*] String Çıkarıcı kurulumu başlatılıyor..."

if [ "$EUID" -ne 0 ]; then
  echo "[-] Hata: Lütfen betiği sudo veya root yetkileriyle çalıştırın."
  exit 1
fi

if ! command -v node &> /dev/null; then
    echo "[-] Node.js bulunamadı. Lütfen önce Node.js yükleyin."
    exit 1
fi

APP_DIR="/opt/string-extractor"
BIN_LINK="/usr/local/bin/string-extractor"

echo "[*] Dosyalar $APP_DIR dizinine kopyalanıyor..."
mkdir -p "$APP_DIR"
cp -r src package.json "$APP_DIR/"

echo "[*] Symlink oluşturuluyor..."
chmod +x "$APP_DIR/src/extractor.js"
ln -sf "$APP_DIR/src/extractor.js" "$BIN_LINK"

echo "[+] Kurulum başarılı! Aracı 'string-extractor <dosya>' komutuyla çalıştırabilirsiniz."
