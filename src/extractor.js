#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Popüler Malware XOR Anahtarları (0x00 = Düz Metin)
const XOR_KEYS = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x77, 0xAA, 0xFF];

const PATTERNS = {
    url: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    sensitive: /(?:password|passwd|secret|token|api_key|private_key)["'\s:=]+([^\s"']+)/gi,
    potential_key: /\b[A-Za-z0-9+/=]{32,64}\b/g 
};

// ==========================================
// THREAD 2: WORKER (CPU Yükünü Çeken Kısım)
// ==========================================
if (!isMainThread) {
    const { chunkBuffer, chunkId } = workerData;
    const buffer = Buffer.from(chunkBuffer);
    const results = { urls: [], ips: [], sensitive: [], apiKeys: [], xorHits: [] };

    function calculateEntropy(str) {
        const len = str.length;
        const frequencies = Array.from(str).reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1, freq), {});
        return Object.values(frequencies).reduce((sum, f) => sum - f / len * Math.log2(f / len), 0);
    }

    // XOR Brute-Force Motoru
    for (const key of XOR_KEYS) {
        let currentString;
        if (key === 0x00) {
            currentString = buffer.toString('binary');
        } else {
            // Chunk'ı hedef XOR anahtarı ile deşifre et
            const xorBuffer = Buffer.allocUnsafe(buffer.length);
            for (let i = 0; i < buffer.length; i++) xorBuffer[i] = buffer[i] ^ key;
            currentString = xorBuffer.toString('binary');
        }

        for (const [type, regex] of Object.entries(PATTERNS)) {
            let match;
            while ((match = regex.exec(currentString)) !== null) {
                const foundStr = match[0];
                if (type === 'potential_key') {
                    if (calculateEntropy(foundStr) > 4.5) {
                        results.apiKeys.push(foundStr);
                        if (key !== 0x00) results.xorHits.push(`[XOR: 0x${key.toString(16).toUpperCase()}] ${foundStr}`);
                    }
                } else {
                    const targetArr = type === 'sensitive' ? results.sensitive : results[type + 's'];
                    targetArr.push(foundStr);
                    if (key !== 0x00) results.xorHits.push(`[XOR: 0x${key.toString(16).toUpperCase()}] ${foundStr}`);
                }
            }
        }
    }
    
    // İşlenmiş verileri Main Thread'e geri gönder
    parentPort.postMessage({ chunkId, results });
    process.exit(0);
}

// ==========================================
// THREAD 1: MAIN (Stream ve Orkestrasyon)
// ==========================================
if (isMainThread) {
    const MAGIC_BYTES = {
        '4D5A': 'Windows PE Executable (DLL/EXE)',
        '7F454C46': 'Linux ELF Executable',
        '25504446': 'PDF Document',
        '504B0304': 'ZIP / APK Archive'
    };

    function identifyFileSignature(fd) {
        const buffer = Buffer.alloc(4);
        fs.readSync(fd, buffer, 0, 4, 0);
        const hex = buffer.toString('hex').toUpperCase();
        for (const [magic, desc] of Object.entries(MAGIC_BYTES)) {
            if (hex.startsWith(magic)) return desc;
        }
        return 'Bilinmeyen / Raw Binary';
    }

    async function analyzeBinary(filePath, outputJson = false) {
        console.log(`\n[*] Yüksek Performanslı Analiz Başlatılıyor: ${filePath}`);
        console.log(`[*] Multi-threading aktif. Max eşzamanlı worker: ${os.cpus().length}`);
        
        const startTime = performance.now();
        const hashSum = crypto.createHash('sha256');
        
        const fd = fs.openSync(filePath, 'r');
        const fileType = identifyFileSignature(fd);
        fs.closeSync(fd);
        console.log(`[!] Dosya İmzası (Magic Byte): ${fileType}\n`);

        const readStream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 }); // 1MB Chunks
        const masterResults = { urls: new Set(), ips: new Set(), sensitive: new Set(), apiKeys: new Set(), xorHits: new Set() };
        
        let chunkIdCounter = 0;
        let activeWorkers = 0;
        const maxWorkers = os.cpus().length;
        
        await new Promise((resolve, reject) => {
            readStream.on('data', (chunk) => {
                hashSum.update(chunk);
                chunkIdCounter++;
                activeWorkers++;

                // Worker'a iş gönderimi
                const worker = new Worker(__filename, { 
                    workerData: { chunkBuffer: chunk, chunkId: chunkIdCounter } 
                });

                worker.on('message', (msg) => {
                    const { results } = msg;
                    results.urls.forEach(v => masterResults.urls.add(v));
                    results.ips.forEach(v => masterResults.ips.add(v));
                    results.sensitive.forEach(v => masterResults.sensitive.add(v));
                    results.apiKeys.forEach(v => masterResults.apiKeys.add(v));
                    results.xorHits.forEach(v => masterResults.xorHits.add(v));
                });

                worker.on('error', reject);
                worker.on('exit', () => {
                    activeWorkers--;
                    if (activeWorkers === 0 && readStream.destroyed) resolve(); // Tüm işler bitti
                });

                // Backpressure kontrolü: CPU boğulmasın diye stream'i geçici durdur
                if (activeWorkers >= maxWorkers) {
                    readStream.pause();
                    const waitInterval = setInterval(() => {
                        if (activeWorkers < maxWorkers) {
                            clearInterval(waitInterval);
                            readStream.resume();
                        }
                    }, 50);
                }
            });

            readStream.on('end', () => {
                readStream.destroy();
                if (activeWorkers === 0) resolve();
            });
            readStream.on('error', reject);
        });

        const endTime = performance.now();
        const fileHash = hashSum.digest('hex');

        console.log('[+] Multi-Threaded Analiz Tamamlandı.');
        console.log(`[!] Dosya SHA-256: ${fileHash}`);
        console.log(`[!] İşlem Süresi: ${((endTime - startTime) / 1000).toFixed(2)} saniye`);
        console.log(`[!] Taranan Chunk Sayısı: ${chunkIdCounter}`);

        const finalOutput = {
            metadata: { target: path.basename(filePath), signature: fileType, sha256: fileHash, processingTime: ((endTime - startTime) / 1000).toFixed(2) },
            findings: {
                ips: Array.from(masterResults.ips),
                urls: Array.from(masterResults.urls),
                api_keys: Array.from(masterResults.apiKeys),
                sensitive_data: Array.from(masterResults.sensitive),
                advanced_xor_detections: Array.from(masterResults.xorHits)
            }
        };

        console.log("\n[+] Özet Çıktı:");
        console.log(`    - Bulunan IP: ${finalOutput.findings.ips.length}`);
        console.log(`    - Bulunan URL: ${finalOutput.findings.urls.length}`);
        console.log(`    - XOR Deobfuscation Başarısı: ${finalOutput.findings.advanced_xor_detections.length} gizli veri çözüldü.`);

        if (outputJson) {
            fs.writeFileSync('report.json', JSON.stringify(finalOutput, null, 2));
            console.log('\n[+] Kapsamlı sonuçlar report.json dosyasına yazıldı.');
        }
    }

    const targetFile = process.argv[2];
    if (!targetFile) {
        console.error("Kullanım: node extractor.js <binary_file> [--json]");
        process.exit(1);
    }
    analyzeBinary(targetFile, process.argv.includes('--json')).catch(console.error);
}
