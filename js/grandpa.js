/**
 * DEDE AI MODÜLÜ
 */

const Grandpa = {
    x: 0,
    y: 0,
    width: CONFIG.GRANDPA.WIDTH,
    height: CONFIG.GRANDPA.HEIGHT,
    speed: CONFIG.GRANDPA.BASE_SPEED,
    currentRoom: 'oturma',
    isAngry: false,
    patrolIndex: 0,
    roomChangeDelay: 0,
    searchTime: 0,
    speechTimer: 0,
    element: null,
    speechElement: null,
    
    init() {
        this.x = CONFIG.GRANDPA.START_X;
        this.y = CONFIG.GRANDPA.START_Y;
        this.currentRoom = 'oturma';
        this.isAngry = false;
        this.patrolIndex = 0;
        this.roomChangeDelay = CONFIG.GRANDPA.ROOM_CHANGE_MIN_DELAY;
        
        this.element = Utils.$('grandpa');
        this.speechElement = Utils.$('grandpa-speech');
        this.updatePosition();
    },
    
    update(gameState) {
        // Oyuncu aynı odadaysa
        if (this.currentRoom === gameState.currentRoom && !gameState.isHiding) {
            this.chasePlayer(gameState);
        } else {
            this.patrol(gameState);
        }
        
        // Oda değiştirme mantığı
        this.roomChangeDelay--;
        if (this.roomChangeDelay <= 0) {
            this.tryChangeRoom(gameState);
        }
        
        // Konuşma
        this.updateSpeech();
        
        this.updatePosition();
        this.updateVisuals();
    },
    
    chasePlayer(gameState) {
        this.isAngry = true;
        const speed = this.speed * CONFIG.GRANDPA.ANGRY_SPEED_MULTIPLIER;
        
        // Oyuncuya doğru hareket
        const dx = Player.x - this.x;
        const dy = Player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }
        
        // Sınırlar
        this.x = Utils.clamp(this.x, 10, CONFIG.CANVAS_WIDTH - this.width - 10);
        this.y = Utils.clamp(this.y, 80, CONFIG.CANVAS_HEIGHT - this.height);
        
        // Konuşma şansı
        if (Math.random() < 0.005) {
            this.speak();
        }
    },
    
    patrol(gameState) {
        this.isAngry = false;
        const room = ROOMS[this.currentRoom];
        if (!room || !room.patrol || room.patrol.length === 0) return;
        
        const target = room.patrol[this.patrolIndex];
        
        // Hedefe doğru hareket
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        } else {
            // Sonraki patrol noktası
            this.patrolIndex = (this.patrolIndex + 1) % room.patrol.length;
        }
    },
    
    tryChangeRoom(gameState) {
        // Oyuncu koşuyorsa sesi duy
        if (Player.isRunning && gameState.currentRoom !== this.currentRoom) {
            // Komşu oda mı kontrol et
            const currentRoomData = ROOMS[this.currentRoom];
            for (const door of currentRoomData.doors) {
                if (door.to === gameState.currentRoom && !door.isExit) {
                    this.changeRoom(gameState.currentRoom);
                    return;
                }
            }
        }
        
        // Rastgele oda değiştir
        if (Math.random() < 0.3) {
            const room = ROOMS[this.currentRoom];
            const doors = room.doors.filter(d => !d.isExit);
            if (doors.length > 0) {
                const randomDoor = doors[Utils.random(0, doors.length - 1)];
                this.changeRoom(randomDoor.to);
            }
        }
        
        this.roomChangeDelay = CONFIG.GRANDPA.ROOM_CHANGE_MIN_DELAY + Utils.random(0, CONFIG.GRANDPA.ROOM_CHANGE_RANDOM_DELAY);
    },
    
    changeRoom(roomId) {
        if (!ROOMS[roomId]) return;
        
        this.currentRoom = roomId;
        this.patrolIndex = 0;
        
        // Odanın ilk patrol noktasına git
        const room = ROOMS[roomId];
        if (room.patrol && room.patrol.length > 0) {
            this.x = room.patrol[0].x;
            this.y = room.patrol[0].y;
        }
    },
    
    speak() {
        const speech = GRANDPA_SPEECHES[Utils.random(0, GRANDPA_SPEECHES.length - 1)];
        if (this.speechElement) {
            this.speechElement.textContent = speech;
            this.speechElement.classList.add('active');
        }
        this.speechTimer = 120;
    },
    
    updateSpeech() {
        if (this.speechTimer > 0) {
            this.speechTimer--;
            if (this.speechTimer <= 0 && this.speechElement) {
                this.speechElement.classList.remove('active');
            }
        }
    },
    
    getDistanceToPlayer() {
        return Utils.distance(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Player.x + Player.width / 2,
            Player.y + Player.height / 2
        );
    },
    
    updatePosition() {
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    },
    
    updateVisuals() {
        if (this.element) {
            this.element.classList.toggle('angry', this.isAngry);
        }
    },
    
    setVisible(visible) {
        if (this.element) {
            this.element.classList.toggle('visible', visible);
        }
    },
    
    reset() {
        this.x = CONFIG.GRANDPA.START_X;
        this.y = CONFIG.GRANDPA.START_Y;
        this.currentRoom = 'oturma';
        this.isAngry = false;
        this.patrolIndex = 0;
        this.roomChangeDelay = CONFIG.GRANDPA.ROOM_CHANGE_MIN_DELAY;
        this.speechTimer = 0;
        if (this.speechElement) {
            this.speechElement.classList.remove('active');
        }
        this.updatePosition();
        this.updateVisuals();
    }
};
