#!/bin/bash

echo "🚀 بدء تثبيت البيئة..."

# تحديث النظام
sudo apt update

# تثبيت Node.js لو مافي
if ! command -v node &> /dev/null
then
    echo "⚙️ تثبيت Node.js..."
    sudo apt install -y nodejs npm
fi

# تثبيت الحزم المطلوبة
echo "📦 تثبيت مكتبات npm..."
npm install express sqlite3 cors body-parser

echo "✅ التثبيت اكتمل! لتشغيل السيرفر:"
echo "1. شغّل: node server.js"
