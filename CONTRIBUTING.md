# Projeye Katkıda Bulunma (Contributing)

Bu proje eğitim amaçlı bir Tersine Mühendislik (Reverse Engineering) aracıdır.

## Geliştirme Standartları
1. Yeni RegEx patternleri eklerken `src/patterns.js` dosyasını kullanınız.
2. ReDoS (Regex DoS) zafiyetlerini önlemek için kuantifikatörleri sınırlandırınız.
3. PR (Pull Request) göndermeden önce `npm test` ile güvenlik denetimlerini çalıştırınız.
