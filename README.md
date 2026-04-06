<div align="center">
  <img src="istinye-logo.png.png" width="180" alt="İstinye Üniversitesi Logo">
  
  <h1>Bilişim Güvenliği Teknolojisi</h1>
  <h3>Tersine Mühendislik Vize Projesi</h3>
  
  **Öğrenci:** Safa Hacıbayramoğlu | **Eğitmen:** Keyvan Arasteh
</div>

---

## 📑 İçindekiler (TOC)
1. [Proje Amacı ve Kapsamı](#proje-amaci)
2. [Mimari Ayrımlar ve Modüller](#mimari)
3. [Kurulum ve İzolasyon](#kurulum)
4. [Kullanım](#kullanim)
5. [Tehdit Modellemesi (STRIDE)](#tehdit-modeli)

---

## 🚀 Proje Amacı ve Kapsamı <a name="proje-amaci"></a>
Büyük çaplı binary dosyalarından (zararlı yazılım analizleri, bellek dökümleri), RAM'i tüketmeden gelişmiş RegEx ve Entropi analizi ile kritik verileri çıkaran profesyonel bir Tersine Mühendislik aracıdır.

## 🧠 Mimari Ayrımlar ve Modüller <a name="mimari"></a>
Proje tek bir dosyaya yığılmak yerine DevSecOps standartlarına uygun olarak modüler tasarlanmıştır:
* `src/patterns.js`: Kuantifikatörleri sınırlandırılmış ReDoS korumalı Regex setleri.
* `src/utils.js`: Shannon Entropi hesaplamaları ve matematiksel analiz fonksiyonları.
* `src/extractor.js`: Stream API tabanlı ana I/O analiz motoru.

## ⚙️ Kurulum ve İzolasyon <a name="kurulum"></a>
Güvenli malware analizi için Docker önerilir. Konteyner `USER node` ile yetki düşürülmüş (privilege drop) olarak çalışır.

```bash
docker build -t string-extractor:latest .
docker run --rm --read-only -v /path/to/malware:/data string-extractor /data/sample.bin --json
