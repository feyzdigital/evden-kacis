/**
 * GİRİŞ YÖNETİMİ
 * Klavye ve mobil dokunmatik girişleri yakalar
 */

const Input = {
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        shift: false
    },
    
    // Tek seferlik tuşlar
    justPressed: {
        e: false,
        space: false,
        escape: false
    },
    
    // Mobil joystick durumu
    joystick: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        dx: 0,
        dy: 0
    },
    
    init() {
        // Klavye eventleri
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mobil kontroller
        if (Utils.isMobile()) {
            this.initMobileControls();
        }
    },
    
    initMobileControls() {
        // Joystick alanı
        const joystickArea = Utils.$('joystick-area');
        if (!joystickArea) return;
        
        // Touch eventleri
        joystickArea.addEventListener('touchstart', (e) => this.onJoystickStart(e), { passive: false });
        joystickArea.addEventListener('touchmove', (e) => this.onJoystickMove(e), { passive: false });
        joystickArea.addEventListener('touchend', (e) => this.onJoystickEnd(e), { passive: false });
        
        // Aksiyon butonları
        const btnInteract = Utils.$('btn-interact');
        const btnHide = Utils.$('btn-hide');
        const btnRun = Utils.$('btn-run');
        
        if (btnInteract) {
            btnInteract.addEventListener('touchstart', () => { this.justPressed.e = true; });
        }
        if (btnHide) {
            btnHide.addEventListener('touchstart', () => { this.justPressed.space = true; });
        }
        if (btnRun) {
            btnRun.addEventListener('touchstart', () => { this.keys.shift = true; });
            btnRun.addEventListener('touchend', () => { this.keys.shift = false; });
        }
    },
    
    onJoystickStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.joystick.active = true;
        this.joystick.startX = touch.clientX;
        this.joystick.startY = touch.clientY;
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        
        // Joystick görselini güncelle
        this.updateJoystickVisual();
    },
    
    onJoystickMove(e) {
        if (!this.joystick.active) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        
        // Delta hesapla (max 50px)
        let dx = this.joystick.currentX - this.joystick.startX;
        let dy = this.joystick.currentY - this.joystick.startY;
        
        const maxDist = 50;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }
        
        this.joystick.dx = dx / maxDist; // -1 ile 1 arası
        this.joystick.dy = dy / maxDist;
        
        // Tuşlara çevir
        this.keys.w = this.joystick.dy < -0.3;
        this.keys.s = this.joystick.dy > 0.3;
        this.keys.a = this.joystick.dx < -0.3;
        this.keys.d = this.joystick.dx > 0.3;
        
        this.updateJoystickVisual();
    },
    
    onJoystickEnd(e) {
        e.preventDefault();
        this.joystick.active = false;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
        
        // Tüm yön tuşlarını sıfırla
        this.keys.w = false;
        this.keys.a = false;
        this.keys.s = false;
        this.keys.d = false;
        
        this.updateJoystickVisual();
    },
    
    updateJoystickVisual() {
        const knob = Utils.$('joystick-knob');
        if (!knob) return;
        
        if (this.joystick.active) {
            const offsetX = this.joystick.dx * 30;
            const offsetY = this.joystick.dy * 30;
            knob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        } else {
            knob.style.transform = 'translate(0, 0)';
        }
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
            e.preventDefault();
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
    
    isInteractPressed() {
        if (this.justPressed.e) {
            this.justPressed.e = false;
            return true;
        }
        return false;
    },
    
    isHidePressed() {
        if (this.justPressed.space) {
            this.justPressed.space = false;
            return true;
        }
        return false;
    },
    
    isEscapePressed() {
        if (this.justPressed.escape) {
            this.justPressed.escape = false;
            return true;
        }
        return false;
    },
    
    reset() {
        this.keys = { w: false, a: false, s: false, d: false, shift: false };
        this.justPressed = { e: false, space: false, escape: false };
        this.joystick = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, dx: 0, dy: 0 };
    }
};
