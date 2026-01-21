/**
 * ANA OYUN MODÜLÜ
 */

const Game = {
    state: {
        isRunning: false,
        isGameOver: false,
        isGameWon: false,
        isPuzzleOpen: false,
        isHiding: false,
        currentRoom: 'oturma',
        visitedRooms: ['oturma'],
        health: 100,
        maxHealth: 100,
        stamina: 100,
        keys: 0,
        clues: 0,
        collectedKeys: [],
        solvedPuzzles: [],
        hideSpot: null,
        startTime: null
    },
    
    selectedCharacter: null,
    
    init() {
        console.log('🎮 Oyun başlatılıyor...');
        Input.init();
        UI.init();
        Utils.$('start-btn').addEventListener('click', () => this.start());
    },
    
    start() {
        if (!this.selectedCharacter) {
            UI.showMessage('Önce bir karakter seç!', 1500);
            return;
        }
        
        this.resetState();
        const character = CHARACTERS[this.selectedCharacter];
        this.state.maxHealth = character.health;
        this.state.health = character.health;
        
        Player.init(this.selectedCharacter);
        Grandpa.init();
        RoomManager.init();
        
        UI.showGame();
        UI.updateHealthBar(this.state.health, this.state.maxHealth);
        UI.updateStaminaBar(this.state.stamina, CONFIG.STAMINA.MAX);
        UI.updateKeyCount(this.state.keys);
        UI.updateClueCount(this.state.clues);
        UI.updateRoomName(ROOMS.oturma.name);
        UI.updateMinimap(this.state.currentRoom, this.state.visitedRooms, Grandpa.currentRoom);
        
        // İlk mesaj
        UI.showMessage('🏠 Evden kaç! Anahtarları ve ipuçlarını bul!', 3000);
        
        this.state.startTime = Date.now();
        this.state.isRunning = true;
        this.gameLoop();
    },
    
    resetState() {
        this.state = {
            isRunning: false, isGameOver: false, isGameWon: false,
            isPuzzleOpen: false, isHiding: false,
            currentRoom: 'oturma', visitedRooms: ['oturma'],
            health: 100, maxHealth: 100, stamina: CONFIG.STAMINA.MAX,
            keys: 0, clues: 0, collectedKeys: [], solvedPuzzles: [],
            hideSpot: null, startTime: null
        };
    },
    
    gameLoop() {
        if (!this.state.isRunning || this.state.isGameOver || this.state.isGameWon) return;
        
        Player.update(this.state);
        Grandpa.update(this.state);
        
        if (!this.state.isHiding) this.checkGrandpaCollision();
        this.checkInteractions();
        this.updateStamina();
        if (this.state.isHiding) this.updateHidingView();
        
        UI.updateMinimap(this.state.currentRoom, this.state.visitedRooms, Grandpa.currentRoom);
        Grandpa.setVisible(Grandpa.currentRoom === this.state.currentRoom);
        
        requestAnimationFrame(() => this.gameLoop());
    },
    
    updateStamina() {
        const isMoving = Input.keys.w || Input.keys.a || Input.keys.s || Input.keys.d || Input.joystick.active;
        if (Player.isRunning && isMoving) {
            this.state.stamina = Math.max(0, this.state.stamina - CONFIG.STAMINA.DRAIN_RATE);
        } else {
            this.state.stamina = Math.min(CONFIG.STAMINA.MAX, this.state.stamina + CONFIG.STAMINA.REGEN_RATE);
        }
        UI.updateStaminaBar(this.state.stamina, CONFIG.STAMINA.MAX);
    },
    
    checkGrandpaCollision() {
        if (Grandpa.currentRoom !== this.state.currentRoom) return;
        if (Grandpa.getDistanceToPlayer() < 40) this.takeDamage(CONFIG.DAMAGE.CONTACT);
    },
    
    takeDamage(amount) {
        this.state.health -= amount;
        UI.updateHealthBar(this.state.health, this.state.maxHealth);
        UI.shakeScreen();
        if (this.state.health <= 0) this.gameOver();
    },
    
    checkInteractions() {
        if (Input.isEscapePressed()) this.closePuzzle();
        
        if (Input.isHidePressed()) {
            if (this.state.isHiding) this.exitHiding();
            else this.tryHide();
        }
        
        if (Input.isInteractPressed()) {
            if (this.state.isPuzzleOpen || this.state.isHiding) return;
            
            const nearbyKey = RoomManager.findNearbyKey(Player.x, Player.y, this.state.currentRoom);
            if (nearbyKey && !this.state.collectedKeys.includes(nearbyKey.id)) {
                this.collectKey(nearbyKey);
                return;
            }
            
            const nearbyPuzzle = RoomManager.findNearbyPuzzle(Player.x, Player.y, this.state.currentRoom);
            if (nearbyPuzzle) { this.openPuzzle(nearbyPuzzle); return; }
            
            const nearbyDoor = RoomManager.findNearbyDoor(Player.x, Player.y, this.state.currentRoom);
            if (nearbyDoor) { this.useDoor(nearbyDoor); return; }
            
            // Yakında saklanma yeri var mı?
            const nearbyHideSpot = RoomManager.findNearbyHideSpot(Player.x, Player.y, this.state.currentRoom);
            if (nearbyHideSpot) {
                UI.showMessage('💡 Saklanmak için SPACE tuşuna bas!', 1200);
                return;
            }
            
            // Hiçbir şey yoksa
            UI.showMessage('Yakında etkileşim yapılacak bir şey yok', 1000);
        }
    },
    
    collectKey(key) {
        this.state.collectedKeys.push(key.id);
        this.state.keys++;
        RoomManager.hideKey(key.id, this.state.currentRoom);
        UI.updateKeyCount(this.state.keys);
        UI.showMessage('🔑 Anahtar bulundu!', 1500);
        this.checkWinCondition();
    },
    
    addKey(keyId) {
        if (!this.state.collectedKeys.includes(keyId)) {
            this.state.collectedKeys.push(keyId);
            this.state.keys++;
            UI.updateKeyCount(this.state.keys);
            this.checkWinCondition();
        }
    },
    
    addClue() {
        this.state.clues++;
        UI.updateClueCount(this.state.clues);
        this.checkWinCondition();
    },
    
    markPuzzleSolved(puzzleId) {
        if (!this.state.solvedPuzzles.includes(puzzleId)) {
            this.state.solvedPuzzles.push(puzzleId);
        }
    },
    
    useDoor(door) {
        if (door.isExit) {
            if (this.state.keys >= CONFIG.WIN_CONDITIONS.KEYS_REQUIRED && 
                this.state.clues >= CONFIG.WIN_CONDITIONS.CLUES_REQUIRED) {
                this.gameWin();
            } else {
                const needed = [];
                if (this.state.keys < CONFIG.WIN_CONDITIONS.KEYS_REQUIRED)
                    needed.push(`${CONFIG.WIN_CONDITIONS.KEYS_REQUIRED - this.state.keys} anahtar`);
                if (this.state.clues < CONFIG.WIN_CONDITIONS.CLUES_REQUIRED)
                    needed.push(`${CONFIG.WIN_CONDITIONS.CLUES_REQUIRED - this.state.clues} ipucu`);
                UI.showMessage(`🔒 ${needed.join(' ve ')} daha lazım!`, 2500);
            }
            return;
        }
        
        const targetRoom = door.to;
        if (!ROOMS[targetRoom]) return;
        
        this.state.currentRoom = RoomManager.changeRoom(targetRoom, door.direction);
        if (!this.state.visitedRooms.includes(targetRoom)) this.state.visitedRooms.push(targetRoom);
        Grandpa.roomChangeDelay = Utils.random(30, 80);
        UI.showMessage(`📍 ${ROOMS[targetRoom].name}`, 1000);
    },
    
    openPuzzle(puzzleId) {
        if (PuzzleSystem.open(puzzleId, this.state.solvedPuzzles)) this.state.isPuzzleOpen = true;
    },
    
    closePuzzle() { PuzzleSystem.close(); this.state.isPuzzleOpen = false; },
    
    tryHide() {
        if (this.state.isHiding || this.state.isPuzzleOpen) return;
        const hideSpot = RoomManager.findNearbyHideSpot(Player.x, Player.y, this.state.currentRoom);
        if (hideSpot) this.enterHiding(hideSpot);
        else UI.showMessage('Yakında saklanacak yer yok!', 1000);
    },
    
    enterHiding(hideSpot) {
        this.state.isHiding = true;
        this.state.hideSpot = hideSpot.id;
        Player.setPosition(hideSpot.x + hideSpot.w/2 - Player.width/2, hideSpot.y + hideSpot.h/2 - Player.height/2);
        Player.setHiddenVisual(true);
        UI.showHidingOverlay();
    },
    
    exitHiding() {
        if (!this.state.isHiding) return;
        this.state.isHiding = false;
        this.state.hideSpot = null;
        Player.setHiddenVisual(false);
        UI.hideHidingOverlay();
    },
    
    updateHidingView() {
        if (!this.state.hideSpot) return;
        const room = ROOMS[this.state.currentRoom];
        const furniture = room.furniture.find(f => f.hideSpot === this.state.hideSpot);
        if (!furniture) return;
        
        if (Grandpa.currentRoom === this.state.currentRoom) {
            const dist = Utils.distance(Grandpa.x + Grandpa.width/2, Grandpa.y + Grandpa.height/2,
                furniture.x + furniture.w/2, furniture.y + furniture.h/2);
            
            if (dist < 100) {
                UI.updatePeephole('👴 ÇOK YAKIN!', '#ef4444');
                UI.setHideWarning(true);
                const findChance = CONFIG.GRANDPA.FIND_CHANCE * (1 - Player.character.stealth * 0.7);
                if (Math.random() < findChance) {
                    this.exitHiding();
                    UI.showMessage('💢 Dede seni buldu!', 1500);
                    this.takeDamage(CONFIG.DAMAGE.FOUND_HIDING);
                }
            } else if (dist < 180) {
                UI.updatePeephole('👴 Yaklaşıyor...', '#fbbf24');
                UI.setHideWarning(false);
            } else {
                UI.updatePeephole('👴 Odada...', '#94a3b8');
                UI.setHideWarning(false);
            }
        } else {
            UI.updatePeephole('✓ Güvende', '#4ade80');
            UI.setHideWarning(false);
        }
    },
    
    checkWinCondition() {
        if (this.state.keys >= CONFIG.WIN_CONDITIONS.KEYS_REQUIRED && 
            this.state.clues >= CONFIG.WIN_CONDITIONS.CLUES_REQUIRED) {
            RoomManager.unlockExitDoor();
            UI.showMessage('🚪 Çıkış kapısı açıldı! Bodruma git!', 3000);
        }
    },
    
    gameOver() {
        this.state.isRunning = false;
        this.state.isGameOver = true;
        const playTime = Math.floor((Date.now() - this.state.startTime) / 1000);
        UI.showGameOver({ time: Utils.formatTime(playTime), keys: this.state.keys, clues: this.state.clues });
    },
    
    gameWin() {
        this.state.isRunning = false;
        this.state.isGameWon = true;
        const playTime = Math.floor((Date.now() - this.state.startTime) / 1000);
        UI.showGameWin({ time: Utils.formatTime(playTime), characterName: CHARACTERS[this.selectedCharacter].name });
    },
    
    restart() {
        UI.hideAllModals();
        Input.reset();
        this.resetState();
        Player.reset();
        Grandpa.reset();
        RoomManager.reset();
        
        const character = CHARACTERS[this.selectedCharacter];
        this.state.maxHealth = character.health;
        this.state.health = character.health;
        Player.speed = character.speed;
        
        UI.updateHealthBar(this.state.health, this.state.maxHealth);
        UI.updateStaminaBar(this.state.stamina, CONFIG.STAMINA.MAX);
        UI.updateKeyCount(0);
        UI.updateClueCount(0);
        UI.updateRoomName(ROOMS.oturma.name);
        
        this.state.startTime = Date.now();
        this.state.isRunning = true;
        this.gameLoop();
    }
};
