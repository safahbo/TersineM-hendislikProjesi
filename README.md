# 🕵️‍♂️ Advanced String Extractor (Pro Edition)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Security](https://img.shields.io/badge/security-hardened-red)

Büyük çaplı binary dosyalarından (zararlı yazılım analizleri, bellek dökümleri - memory dumps, vb.) sistem belleğini (RAM) tüketmeden, gelişmiş RegEx ve Entropi analizi ile kritik verileri çıkaran profesyonel bir Tersine Mühendislik ve Adli Bilişim (Forensics) aracıdır.

## 📑 İçindekiler
- [Özellikler](#-özellikler)
- [Mimari ve Çalışma Prensibi](#-mimari-ve-çalışma-prensibi)
- [Kurulum ve İzolasyon](#-kurulum-ve-izolasyon)
- [Kullanım](#-kullanım)
- [Güvenlik ve Tehdit Modeli (STRIDE)](#-güvenlik-ve-tehdit-modeli-stride)

## 🚀 Özellikler

* **O(1) Bellek Karmaşıklığı:** Node.js `fs.createReadStream` mimarisi sayesinde GB'larca büyüklükteki dosyaları chunk'lar (parçalar) halinde okur. Analiz esnasında RAM şişmesini tamamen engeller.
* **Heuristic API Key Tespiti:** Shannon Entropi algoritması kullanarak yüksek rastgeleliğe sahip potansiyel Base64/Hex şifreleme anahtarlarını, AWS token'larını ve JWT'leri tespit eder.
* **Hardened Güvenlik:** ReDoS (Regular Expression Denial of Service) saldırılarına karşı optimize edilmiş, kuantifikatörleri sınırlandırılmış güvenli RegEx setleri kullanır.
* **Adli Bilişim Uyumluluğu:** Analiz sırasında `os.tmpdir()` altında oluşturulan geçici buffer dosyalarını işlem bitiminde kalıcı olarak silerek sistemde artefakt (iz) bırakmaz.
* **Multi-Stage Docker:** `USER node` direktifi ile yetkileri düşürülmüş, salt okunur (read-only) dosya sistemlerinde çalışmaya tam uygun güvenli konteyner mimarisi.

## 🧠 Mimari ve Çalışma Prensibi

1.  **I/O Stream Başlatma:** Hedef dosya 1MB'lık chunk'lar halinde belleğe alınmaya başlar.
2.  **Pattern Matching:** Her bir chunk, önceden derlenmiş 4 farklı RegEx motorundan (URL, IP, Sensitive Words, Potential Keys) geçirilir.
3.  **Entropi Doğrulaması:** "Potential Keys" filtresine takılan string'ler matematiksel olarak analiz edilir. İçerisindeki karakter dağılımı, Shannon Entropi formülü ($H = -\sum p_i \log_2 p_i$) ile hesaplanır. Entropi eşik değerini (örneğin 4.5) aşan dizeler "API Key" olarak sınıflandırılır.
4.  **Güvenli Çıktı:** Sonuçlar bellekte `Set` veri yapısında (tekrarları önlemek için) tutulur ve isteğe bağlı olarak JSON formatında dışa aktarılır.

## ⚙️ Kurulum ve İzolasyon

Zararlı yazılım veya bilinmeyen binary analizleri yaparken aracın izole bir ortamda çalıştırılması kritik önem taşır.

### Yöntem 1: Güvenli Docker Container (Önerilen)
Bu yöntem, aracın host sistemle etkileşimini tamamen keser ve bağımlılık sorunlarını ortadan kaldırır.

```bash
# İmajı build edin
docker build -t string-extractor:latest .

# Aracı Read-Only rootfs ile çalıştırın
docker run --rm --read-only \
  -v /path/to/malware:/data \
  string-extractor /data/sample.bin --json
