# Uygulama Tehdit Modeli (STRIDE)

Bu doküman, String Çıkarıcı aracının maruz kalabileceği siber tehditleri ve uygulanan mitigasyon (hafifletme) stratejilerini listeler.

| Tehdit Kategorisi | Etkilenen Bileşen | Alınan Önlem (Mitigasyon) |
| :--- | :--- | :--- |
| **Spoofing** | Girdi Doğrulama | Araç girdi dosyasının kaynağını doğrulamaz. Sandboxed ortamlarda çalıştırılması tavsiye edilmiştir. |
| **Tampering** | Temp Dosyalar | Geçici veriler `os.tmpdir()` içinde rasgele isimlendirilir. İşlem bitiminde `fs.unlinkSync` ile imha edilir. |
| **Repudiation** | Çıktı Yönetimi | STDOUT ve STDERR akışları tamamen ayrılmıştır. Kritik analizler izole log sunucularına iletilebilir. |
| **Information Disclosure** | Raporlama | Çıkarılan API Key vb. veriler raporda plaintext bulunur. `report.json` yetkisi kısıtlanmış klasörlerde saklanmalıdır. |
| **Denial of Service** | RegEx Motoru | **ReDoS** zafiyetini önlemek için güvenli pattern'ler kullanılmış ve stream chunk boyutları sınırlandırılmıştır. |
| **Elevation of Privilege** | Konteyner | Dockerfile içinde `USER node` ile root yetkisi düşürülmüştür. |
