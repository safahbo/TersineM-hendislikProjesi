#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

// Modüler mimari importları
const PATTERNS = require('./patterns');
const { calculateEntropy } = require('./utils');

async function analyzeBinary(filePath, outputJson = false) {
    const tempFile = path.join(os.tmpdir(), `extractor_tmp_${Date.now()}.part`);
    const results = { urls: new Set(), ips: new Set(), sensitive: new Set(), apiKeys: new Set() };

    console.log(`[*] Analiz başlıyor: ${filePath}`);
    const hashSum = crypto.createHash('sha256');

    try {
        const readStream = fs.createReadStream(filePath, { encoding: 'binary', highWaterMark: 1024 * 1024 });
        const writeTempStream = fs.createWriteStream(tempFile);

        readStream.on('data', (chunk) => {
            hashSum.update(chunk);
            for (const [type, regex] of Object.entries(PATTERNS)) {
                let match;
                while ((match = regex.exec(chunk)) !== null) {
                    if (type === 'potential_key') {
                        if (calculateEntropy(match[0]) > 4.5) results.apiKeys.add(match[0]);
                    } else {
                        results[type === 'sensitive' ? 'sensitive' : type + 's'].add(match[0]);
                    }
                }
            }
            writeTempStream.write(chunk);
        });

        await pipeline(readStream, writeTempStream);

        const fileHash = hashSum.digest('hex');
        console.log('\n[+] Analiz Tamamlandı.');
        console.log(`[!] Dosya SHA-256: ${fileHash}`);

        const finalData = {
            metadata: { target: path.basename(filePath), sha256: fileHash },
            extracted: {
                urls: Array.from(results.urls),
                ips: Array.from(results.ips),
                sensitive: Array.from(results.sensitive),
                apiKeys: Array.from(results.apiKeys)
            }
        };

        console.log(JSON.stringify(finalData.extracted, null, 2));

        if (outputJson) {
            fs.writeFileSync('report.json', JSON.stringify(finalData, null, 2));
            console.log('\n[+] Sonuçlar report.json dosyasına kaydedildi.');
        }

    } catch (err) {
        console.error(`[-] Hata oluştu: ${err.message}`);
    } finally {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
            console.log(`[*] İzole geçici dosya temizlendi: ${tempFile}`);
        }
    }
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.error("Kullanım: node src/extractor.js <binary_file> [--json]");
    process.exit(1);
}

analyzeBinary(targetFile, process.argv.includes('--json'));
