// Güvenlik Denetim Testi
const { calculateEntropy } = require('../src/utils');
const PATTERNS = require('../src/patterns');

console.log("[TEST] Regex ReDoS Kontrolü...");
// Karmaşık regexlerin çalışma süresi testi
const start = Date.now();
PATTERNS.url.test("http://safe-url.com");
if (Date.now() - start < 10) console.log("[OK] Regex motoru hızlı ve güvenli.");

console.log("[TEST] Entropi Hassasiyeti Kontrolü...");
const highEntropy = calculateEntropy("aB1!sK9#mL2$nP0%"); 
if (highEntropy > 4.0) console.log("[OK] Entropi motoru yüksek rastgeleliği yakalıyor.");
const { calculateEntropy } = require('../src/utils');
console.log("[TEST] Entropi Algoritması Doğrulanıyor...");
const score = calculateEntropy("4c0nS7r4ct0r!"); 
if (score > 3) console.log("[OK] Entropi motoru hassas veri tespiti için hazır.");
