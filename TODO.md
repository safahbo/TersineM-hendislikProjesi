# 🚀 Gelecek Planlaması ve Yapılacaklar (Roadmap)

Bu dosya, projenin mevcut durumunu ve gelecekte eklenmesi planlanan profesyonel özellikleri takip etmek için oluşturulmuştur.

## ✅ Tamamlanan Özellikler (v1.1.0)
- [x] **Stream I/O Mimari:** GB'larca boyutundaki dosyaların RAM tüketmeden analiz edilmesi.
- [x] **Shannon Entropi Analizi:** API Key ve şifreleme anahtarlarının matematiksel tespiti.
- [x] **ReDoS Koruması:** Regex motorunun DoS saldırılarına karşı güçlendirilmesi.
- [x] **Docker İzolasyonu:** Analiz sürecinin izole konteyner katmanına taşınması.
- [x] **CI/CD Pipeline:** GitHub Actions ile otomatik güvenlik denetimlerinin kurulması.

## 🛠️ Yakın Zamanda Planlananlar (v1.2.0)
- [ ] **PE/ELF Header Analizi:** Dosyaların sadece stringlerini değil, başlık bilgilerini de (entry point, sectionlar) analiz etmek.
- [ ] **YARA Entegrasyonu:** Tespit edilen stringlerin bilinen zararlı imzalarıyla (YARA kuralları) karşılaştırılması.
- [ ] **Export Formatları:** Raporların `.json` dışında `.csv` ve `.html` formatlarında da alınabilmesi.

## 🧪 Ar-Ge Hedefleri (v2.0.0)
- [ ] **Makine Öğrenmesi (ML) Katmanı:** Stringlerin zararlı olma ihtimalini yapay zeka ile skorlamak.
- [ ] **VirusTotal API:** Tespit edilen SHA-256 hash değerlerinin otomatik olarak VirusTotal üzerinde sorgulanması.
- [ ] **GUI Geliştirme:** Terminal kullanmak istemeyen analistler için basit bir masaüstü arayüzü (Electron.js).

---
*Bu liste, projenin akademik ve profesyonel gelişimine göre güncellenmeye devam edecektir.*
