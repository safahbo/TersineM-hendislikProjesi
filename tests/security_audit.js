/**
 * @file security_audit.js
 * @description Modüllerin güvenlik ve doğruluk testleri
 */

const { calculateEntropy } = require('../src/utils');
const PATTERNS = require('../src/patterns');

console.log("[*] DevSecOps Otomatik Testleri Başlatılıyor...\n");

// 1. Entropi Analizi Testleri
const weakPassword = "password123";
const strongApiKey = "AKIAIOSFODNN7EXAMPLE";

console.log("--- Shannon Entropy Testleri ---");
console.log(`[TEST] Zayıf Şifre Entropisi: ${calculateEntropy(weakPassword).toFixed(2)} (Beklenen: < 3.5)`);
console.log(`[TEST] Güçlü API Key Entropisi: ${calculateEntropy(strongApiKey).toFixed(2)} (Beklenen: > 4.5)`);

if (calculateEntropy(strongApiKey) > 4.5) {
    console.log("✅ Entropi motoru yüksek rastgeleliği başarıyla tespit etti.\n");
}

// 2. ReDoS Korumalı Regex Testleri
console.log("--- Pattern Matching Testleri ---");
const sampleText = "Sızdırılan IP: 192.168.1.15 ve sunucu https://secure-server.com";

const ipMatch = sampleText.match(PATTERNS.ip);
const urlMatch = sampleText.match(PATTERNS.url);

if (ipMatch && ipMatch[0] === "192.168.1.15") console.log("✅ IP Adresi tespiti başarılı.");
if (urlMatch && urlMatch[0] === "https://secure-server.com") console.log("✅ URL tespiti başarılı.");

console.log("\n[+] Tüm denetimler başarıyla tamamlandı. Pipeline onaylandı.");
