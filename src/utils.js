// Shannon Entropy Hesaplama (API Key doğrulaması için)
function calculateEntropy(str) {
    const len = str.length;
    const frequencies = Array.from(str).reduce((freq, c) => {
        freq[c] = (freq[c] || 0) + 1;
        return freq;
    }, {});
    
    return Object.values(frequencies).reduce((sum, f) => {
        return sum - (f / len) * Math.log2(f / len);
    }, 0);
}

module.exports = { calculateEntropy };
