/**
 * OYUNCU MODÜLÜ
 */

const Player = {
    x: 0,
    y: 0,
    width: CONFIG.PLAYER.WIDTH,
    height: CONFIG.PLAYER.HEIGHT,
    speed: 3,
    isRunning: false,
    character: null,
    element: null,
    
    init(characterId) {
        this.character = CHARACTERS[characterId];
        this.speed = this.character.speed;
        this.x = CONFIG.PLAYER.START_X;
        this.y = CONFIG.PLAYER.START_Y;
        
        this.element = Utils.$('player');
        this.element.className = `player ${characterId}`;
        
        // Karakter emoji'sini ayarla
        const sprite = this.element.querySelector('.player-sprite');
        if (sprite) {
            sprite.style.background = this.character.color;
            sprite.setAttribute('data-emoji', this.character.emoji);
        }
        
        this.updatePosition();
    },
    
    update(gameState) {
        if (gameState.isPuzzleOpen || gameState.isHiding) return;
        
        // Koşma kontrolü
        this.isRunning = Input.keys.shift && gameState.stamina > 0;
        const currentSpeed = this.isRunning ? this.speed * 1.8 : this.speed;
        
        // Hareket
        let dx = 0, dy = 0;
        
        // Mobil joystick desteği
        if (Input.joystick.active) {
            dx = Input.joystick.dx * currentSpeed;
            dy = Input.joystick.dy * currentSpeed;
        } else {
            if (Input.keys.w) dy -= currentSpeed;
            if (Input.keys.s) dy += currentSpeed;
            if (Input.keys.a) dx -= currentSpeed;
            if (Input.keys.d) dx += currentSpeed;
            
            // Çapraz hareket normalizasyonu
            if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
            }
        }
        
        // Yeni pozisyon
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Sınır kontrolü
        const minY = 80;
        const maxX = CONFIG.CANVAS_WIDTH - this.width - 10;
        const maxY = CONFIG.CANVAS_HEIGHT - this.height;
        
        // Mobilya çarpışma kontrolü
        const room = ROOMS[gameState.currentRoom];
        
        let canMoveX = true;
        let canMoveY = true;
        
        for (const furniture of room.furniture) {
            const furnitureRect = { x: furniture.x, y: furniture.y, w: furniture.w, h: furniture.h };
            
            // X ekseni kontrolü
            if (Utils.collides({ x: newX, y: this.y, w: this.width, h: this.height }, furnitureRect)) {
                canMoveX = false;
            }
            
            // Y ekseni kontrolü
            if (Utils.collides({ x: this.x, y: newY, w: this.width, h: this.height }, furnitureRect)) {
                canMoveY = false;
            }
        }
        
        // Pozisyonu güncelle
        if (canMoveX) {
            this.x = Utils.clamp(newX, 10, maxX);
        }
        if (canMoveY) {
            this.y = Utils.clamp(newY, minY, maxY);
        }
        
        this.updatePosition();
    },
    
    updatePosition() {
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    },
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updatePosition();
    },
    
    setHiddenVisual(hidden) {
        if (this.element) {
            this.element.classList.toggle('hidden', hidden);
        }
    },
    
    reset() {
        this.x = CONFIG.PLAYER.START_X;
        this.y = CONFIG.PLAYER.START_Y;
        this.isRunning = false;
        this.setHiddenVisual(false);
        this.updatePosition();
    }
};
