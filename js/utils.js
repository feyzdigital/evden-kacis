/**
 * YARDIMCI FONKSİYONLAR
 */

const Utils = {
    // Element seçici
    $(id) {
        return document.getElementById(id);
    },
    
    // Rastgele sayı (min-max arası)
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // İki nokta arası mesafe
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    // Süre formatla (saniye -> dakika:saniye)
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Çarpışma kontrolü (AABB)
    collides(rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
               rect1.x + rect1.w > rect2.x &&
               rect1.y < rect2.y + rect2.h &&
               rect1.y + rect1.h > rect2.y;
    },
    
    // Değeri sınırla
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};
