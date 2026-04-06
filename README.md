<div align="center">
  <img src="istinye-logo.png.png" width="180" alt="İstinye Üniversitesi Logo">
  
  <h1>Bilişim Güvenliği Teknolojisi</h1>
  <h3>Tersine Mühendislik Vize Projesi</h3>
  
  **Öğrenci:** Safa Hacıbayramoğlu | **Eğitmen:** Keyvan Arasteh
  
  <br>
  
  ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
  ![Docker](https://img.shields.io/badge/docker-ready-blue)
  ![Security](https://img.shields.io/badge/security-hardened-red)
  ![Architecture](https://img.shields.io/badge/architecture-modular-orange)
</div>

---

## 📑 İçindekiler
1. [Proje Amacı ve Kapsamı](#1-proje-amacı-ve-kapsamı)
2. [Temel Özellikler](#2-temel-özellikler)
3. [Mimari ve Çalışma Prensibi](#3-mimari-ve-çalışma-prensibi)
4. [Kurulum ve İzolasyon](#4-kurulum-ve-izolasyon)
5. [Kullanım](#5-kullanım)
6. [Tehdit Modellemesi (STRIDE)](#6-tehdit-modellemesi-stride)

---

## 1. Proje Amacı ve Kapsamı
Büyük çaplı binary dosyalarından (zararlı yazılım analizleri, bellek dökümleri - memory dumps), RAM'i tüketmeden gelişmiş RegEx ve Entropi analizi ile kritik verileri çıkaran profesyonel bir Tersine Mühendislik ve Adli Bilişim (Forensics) aracıdır.

## 2. Temel Özellikler
* **O(1) Bellek Karmaşıklığı:** Node.js `fs.createReadStream` mimarisi sayesinde GB'larca büyüklükteki dosyaları chunk'lar (parçalar) halinde okur. Analiz esnasında RAM şişmesini tamamen engeller.
* **Heuristic API Key Tespiti:** Shannon Entropi algoritması kullanarak yüksek rastgeleliğe sahip potansiyel Base64/Hex şifreleme anahtarlarını, AWS token'larını ve JWT'leri matematiksel olarak tespit eder.
* **Hardened Güvenlik:** ReDoS (Regular Expression Denial of Service) saldırılarına karşı optimize edilmiş, kuantifikatörleri sınırlandırılmış güvenli RegEx setleri kullanır.
* **Adli Bilişim Uyumluluğu:** Analiz sırasında `os.tmpdir()` altında oluşturulan geçici buffer dosyalarını işlem bitiminde kalıcı olarak silerek sistemde artefakt (iz) bırakmaz.

## 3. Mimari ve Çalışma Prensibi
Proje, "Sistemi tek bir büyük dosyaya sıkıştırmak yerine doğru mimari ayrımları kullanmak" prensibine göre DevSecOps standartlarında modüler olarak tasarlanmıştır:

* ⚙️ **`src/patterns.js`**: Regex motorunun kalbi. ReDoS korumalı IP, URL ve Keyword tespit algoritmaları.
* 🧮 **`src/utils.js`**: Shannon Entropi hesaplamaları ve matematiksel analiz fonksiyonları.
* 🚀 **`src/extractor.js`**: Stream API tabanlı ana I/O orkestratörü.

**Çalışma Akışı:**
1. **I/O Stream Başlatma:** Hedef dosya 1MB'lık chunk'lar halinde belleğe alınmaya başlar.
2. **Pattern Matching & Entropi:** Her bir chunk, regex motorlarından geçirilir. Entropi eşik değerini aşan dizeler (örn. 4.5) "API Key" olarak sınıflandırılır.
3. **Kriptografik Bütünlük:** Veri okunurken anlık olarak SHA-256 hash değeri hesaplanır.
4. **Güvenli Çıktı:** Sonuçlar bellekte `Set` veri yapısında tutulur ve analiz sonunda JSON formatında dışa aktarılır.

## 4. Kurulum ve İzolasyon
Zararlı yazılım analizleri yaparken aracın izole bir ortamda çalıştırılması kritik önem taşır. Konteyner mimarisi, `USER node` direktifi ile yetkileri düşürülmüş (privilege drop) olarak yapılandırılmıştır.

```bash
# İmajı Multi-Stage mimari ile build edin
docker build -t string-extractor:latest .

# Aracı Read-Only rootfs ile izole ortamda çalıştırın
docker run --rm --read-only -v /path/to/malware:/data string-extractor /data/sample.bin --json
