#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pipeline } = require('stream/promises');

// Hardened Regex Patterns (ReDoS önlemli, sınırlı kuantifikatörler)
const PATTERNS = {
    url: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    sensitive: /(?:password|passwd|secret|token|api_key|private_key)["'\s:=]+([^\s"']+)/gi,
    // Entropy analizi için potansiyel Base64/Hex key yakalayıcı (basitleştirilmiş)
    potential_key: /\b[A-Za-z0-9+/=]{32,64}\b/g 
};

// Shannon Entropy hesaplama (API Key doğrulaması için basit bir евristik)
function calculateEntropy(str) {
    const len = str.length;
    const frequencies = Array.from(str).reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1, freq), {});
    return Object.values(frequencies).reduce((sum, f) => sum - f / len * Math.log2(f / len), 0);
}

async function analyzeBinary(filePath, outputJson = false) {
    const tempFile = path.join(os.tmpdir(), `extractor_tmp_${Date.now()}.part`);
    const results = { urls: new Set(), ips: new Set(), sensitive: new Set(), apiKeys: new Set() };

    console.log(`[*] Analiz başlıyor: ${filePath}`);
    
    try {
        const readStream = fs.createReadStream(filePath, { encoding: 'binary', highWaterMark: 1024 * 1024 }); // 1MB chunks
        const writeTempStream = fs.createWriteStream(tempFile); // Geçici izolasyon

        readStream.on('data', (chunk) => {
            // ReDoS riskini azaltmak için chunk boyutu kontrollü
            for (const [type, regex] of Object.entries(PATTERNS)) {
                let match;
                while ((match = regex.exec(chunk)) !== null) {
                    if (type === 'potential_key') {
                        if (calculateEntropy(match[0]) > 4.5) results.apiKeys.add(match[0]); // Entropy eşiği
                    } else {
                        results[type === 'sensitive' ? 'sensitive' : type + 's'].add(match[0]);
                    }
                }
            }
            writeTempStream.write(chunk);
        });

        await pipeline(readStream, writeTempStream); // Stream bitişini bekle

        console.log('\n[+] Analiz Tamamlandı. Sonuçlar:');
        const finalData = {
            urls: Array.from(results.urls),
            ips: Array.from(results.ips),
            sensitive: Array.from(results.sensitive),
            apiKeys: Array.from(results.apiKeys)
        };

        console.log(JSON.stringify(finalData, null, 2));

        if (outputJson) {
            fs.writeFileSync('report.json', JSON.stringify(finalData, null, 2));
            console.log('\n[+] Sonuçlar report.json dosyasına kaydedildi.');
        }

    } catch (err) {
        console.error(`[-] Hata oluştu: ${err.message}`);
    } finally {
        // Forensics Cleanup: İşlem bitince tmp dosyasını kalıcı olarak sil
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
            console.log(`[*] İzole geçici dosya temizlendi: ${tempFile}`);
        }
    }
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.error("Kullanım: node extractor.js <binary_file> [--json]");
    process.exit(1);
}

analyzeBinary(targetFile, process.argv.includes('--json'));
