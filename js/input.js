/**
 * GİRİŞ YÖNETİMİ
 * Klavye girişlerini yakalar
 */

const Input = {
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        shift: false
    },
    
    // Tek seferlik tuşlar (basılı tutunca tekrar etmesin)
    justPressed: {
        e: false,
        space: false,
        escape: false
    },
    
    init() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    },
    
    onKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Hareket tuşları
        if (key === 'w' || key === 'arrowup') this.keys.w = true;
        if (key === 'a' || key === 'arrowleft') this.keys.a = true;
        if (key === 's' || key === 'arrowdown') this.keys.s = true;
        if (key === 'd' || key === 'arrowright') this.keys.d = true;
        if (key === 'shift') this.keys.shift = true;
        
        // Tek seferlik tuşlar
        if (key === 'e') this.justPressed.e = true;
        if (key === ' ') {
            this.justPressed.space = true;
            e.preventDefault(); // Sayfa kaydırmasını engelle
        }
        if (key === 'escape') this.justPressed.escape = true;
    },
    
    onKeyUp(e) {
        const key = e.key.toLowerCase();
        
        if (key === 'w' || key === 'arrowup') this.keys.w = false;
        if (key === 'a' || key === 'arrowleft') this.keys.a = false;
        if (key === 's' || key === 'arrowdown') this.keys.s = false;
        if (key === 'd' || key === 'arrowright') this.keys.d = false;
        if (key === 'shift') this.keys.shift = false;
    },
    
    // Etkileşim tuşu basıldı mı?
    isInteractPressed() {
        if (this.justPressed.e) {
            this.justPressed.e = false;
            return true;
        }
        return false;
    },
    
    // Saklanma tuşu basıldı mı?
    isHidePressed() {
        if (this.justPressed.space) {
            this.justPressed.space = false;
            return true;
        }
        return false;
    },
    
    // Escape basıldı mı?
    isEscapePressed() {
        if (this.justPressed.escape) {
            this.justPressed.escape = false;
            return true;
        }
        return false;
    },
    
    // Tüm girişleri sıfırla
    reset() {
        this.keys = { w: false, a: false, s: false, d: false, shift: false };
        this.justPressed = { e: false, space: false, escape: false };
    }
};
