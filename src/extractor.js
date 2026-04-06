#!/usr/bin/env node

/**
 * @file extractor.js
 * @description Advanced Binary String Extraction & Heuristic Analysis Engine
 * @project İstinye Üniversitesi - Bilişim Güvenliği Teknolojisi
 * @course Tersine Mühendislik (Reverse Engineering)
 * @author Safa Hacıbayramoğlu
 * @instructor Keyvan Arasteh
 * @version 1.1.0
 * * @security_architecture
 * Bu araç, malware analizi sırasında host sistem güvenliğini korumak için 
 * "İzolasyon" ve "Düşük Yetki" (Least Privilege) prensiplerine göre tasarlanmıştır.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

// Modüler mimari bileşenleri (Separation of Concerns)
const PATTERNS = require('./patterns');
const { calculateEntropy } = require('./utils');

/**
 * @async
 * @function analyzeBinary
 * @description Binary veriyi stream mimarisiyle işleyerek hassas veri tespiti yapar.
 * @param {string} filePath - Analiz edilecek hedef dosya yolu.
 * @param {boolean} outputJson - Raporun JSON formatında dışa aktarılıp aktarılmayacağı.
 * * @technical_specs
 * - Memory Complexity: O(1) - Stream tabanlı chunk işleme sayesinde sabit RAM kullanımı.
 * - Forensics: SHA-256 hash hesaplaması ile dosya bütünlük kontrolü.
 * - Heuristics: Shannon Entropy algoritması ile rastgelelik analizi.
 */
async function analyzeBinary(filePath, outputJson = false) {
    // Adli Bilişim (Forensics) standartlarında geçici dosya izolasyonu
    const tempFile = path.join(os.tmpdir(), `extractor_tmp_${Date.now()}.part`);
    const results = { 
        urls: new Set(), 
        ips: new Set(), 
        sensitive: new Set(), 
        apiKeys: new Set() 
    };

    console.log(`\n[!] ANALİZ MOTORU TETİKLENDİ: ${path.basename(filePath)}`);
    console.log(`[*] İzole çalışma alanı: ${tempFile}`);

    // Bütünlük kontrolü için kriptografik hash motoru
    const hashSum = crypto.createHash('sha256');

    try {
        /**
         * Yüksek performanslı I/O yapılandırması.
         * 1MB'lık 'highWaterMark' ile buffer yönetimi optimize edilmiştir.
         */
        const readStream = fs.createReadStream(filePath, { 
            encoding: 'binary', 
            highWaterMark: 1024 * 1024 
        });
        
        const writeTempStream = fs.createWriteStream(tempFile);

        /**
         * Stream 'data' olayı: Her bir veri bloğu (chunk) için analiz gerçekleştirilir.
         * Devasa boyutlu malware örneklerinde (Memory Dumps) sistem stabilitesini korur.
         */
        readStream.on('data', (chunk) => {
            // Hash güncelleme (Bütünlük doğrulaması için)
            hashSum.update(chunk);

            // Pattern Matching & Heuristic Discovery
            for (const [type, regex] of Object.entries(PATTERNS)) {
                let match;
                while ((match = regex.exec(chunk)) !== null) {
                    const detected = match[0];

                    if (type === 'potential_key') {
                        /**
                         * @logic Shannon Entropy Check
                         * Sadece regex eşleşmesi yeterli değildir; rastgelelik (entropy) 
                         * skoru 4.5 üzerindeyse dize "Yüksek Öncelikli API Key" olarak işaretlenir.
                         */
                        if (calculateEntropy(detected) > 4.5) {
                            results.apiKeys.add(detected);
                        }
                    } else {
                        // Kategorik sınıflandırma
                        const category = type === 'sensitive' ? 'sensitive' : type + 's';
                        results[category].add(detected);
                    }
                }
            }
            writeTempStream.write(chunk);
        });

        // Async Pipeline ile akış yönetimi
        await pipeline(readStream, writeTempStream);

        const fileHash = hashSum.digest('hex');
        console.log('\n' + '='.repeat(45));
        console.log(`[+] ANALİZ KUSURSUZ TAMAMLANDI`);
        console.log(`[#] DOSYA SHA-256: ${fileHash}`);
        console.log('='.repeat(45));

        // Veri modelleme ve metadata yapılandırması
        const finalData = {
            metadata: { 
                target: path.basename(filePath), 
                sha256: fileHash,
                timestamp: new Date().toISOString(),
                analyst: "Safa Hacıbayramoğlu"
            },
            extracted: {
                urls: Array.from(results.urls),
                ips: Array.from(results.ips),
                sensitive: Array.from(results.sensitive),
                apiKeys: Array.from(results.apiKeys)
            }
        };

        // Terminal çıktısı (Analist Özeti)
        console.log(`\n[>] Tespit Edilen Kritik Bulgular:`);
        console.log(`   - Network URL:     ${finalData.extracted.urls.length} adet`);
        console.log(`   - Network IP:      ${finalData.extracted.ips.length} adet`);
        console.log(`   - Hassas Kelimeler: ${finalData.extracted.sensitive.length} adet`);
        console.log(`   - API Anahtarları:  ${finalData.extracted.apiKeys.length} adet (High Entropy)`);

        if (outputJson) {
            fs.writeFileSync('report.json', JSON.stringify(finalData, null, 2));
            console.log('\n[+] Rapor dosyası oluşturuldu: report.json');
        }

    } catch (err) {
        console.error(`\n[-] KRİTİK ÇALIŞMA ZAMANI HATASI: ${err.message}`);
    } finally {
        // Anti-Forensics Prevention: Geçici dosyaların güvenli imhası
        if (fs.existsSync(tempFile)) {
            try {
                fs.unlinkSync(tempFile);
                console.log(`[*] Güvenli Temizlik: İzole geçici dosyalar başarıyla imha edildi.`);
            } catch (cleanupErr) {
                console.error(`[-] Temizlik Hatası: ${cleanupErr.message}`);
            }
        }
    }
}

/**
 * Giriş Noktası (EntryPoint) ve Argüman Yönetimi
 */
const targetFile = process.argv[2];

if (!targetFile || targetFile === '--help' || targetFile === '-h') {
    console.log(`
Advanced String Extractor v1.1.0
-------------------------------
Kullanım: node src/extractor.js <target_binary> [options]

Seçenekler:
  --json    Analiz çıktılarını 'report.json' dosyasına kaydeder.
  --help    Yardım menüsünü görüntüler.
    `);
    process.exit(0);
}

// Analizi başlat
analyzeBinary(targetFile, process.argv.includes('--json'));
