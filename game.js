/**
 * ANA OYUN MODÜLÜ
 * Tüm sistemleri koordine eder
 */

const Game = {
    // Oyun durumu
    state: {
        isRunning: false,
        isGameOver: false,
        isGameWon: false,
        isPuzzleOpen: false,
        isHiding: false,
        
        currentRoom: 'salon',
        visitedRooms: ['salon'],
        
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
    
    // Seçili karakter
    selectedCharacter: null,
    
    /**
     * Oyunu başlat
     */
    init() {
        console.log('Oyun başlatılıyor...');
        
        // Sistemleri başlat
        Input.init();
        UI.init();
        
        // Başlat butonu
        Utils.$('start-btn').addEventListener('click', () => this.start());
        
        console.log('Oyun hazır!');
    },
    
    /**
     * Oyunu başlat
     */
    start() {
        if (!this.selectedCharacter) {
            UI.showMessage('Önce bir karakter seç!', 1500);
            return;
        }
        
        console.log(`Oyun başlıyor: ${this.selectedCharacter}`);
        
        // State'i sıfırla
        this.resetState();
        
        // Karakter özelliklerini al
        const character = CHARACTERS[this.selectedCharacter];
        this.state.maxHealth = character.health;
        this.state.health = character.health;
        
        // Sistemleri başlat
        Player.init(this.selectedCharacter);
        Grandpa.init();
        RoomManager.init();
        
        // UI'ı güncelle
        UI.showGame();
        UI.updateHealthBar(this.state.health, this.state.maxHealth);
        UI.updateStaminaBar(this.state.stamina, CONFIG.STAMINA.MAX);
        UI.updateKeyCount(this.state.keys);
        UI.updateClueCount(this.state.clues);
        UI.updateRoomName(ROOMS.salon.name);
        UI.updateMinimap(this.state.currentRoom, this.state.visitedRooms, Grandpa.currentRoom);
        
        // Zamanı başlat
        this.state.startTime = Date.now();
        this.state.isRunning = true;
        
        // Oyun döngüsünü başlat
        this.gameLoop();
    },
    
    /**
     * State'i sıfırla
     */
    resetState() {
        this.state = {
            isRunning: false,
            isGameOver: false,
            isGameWon: false,
            isPuzzleOpen: false,
            isHiding: false,
            
            currentRoom: 'salon',
            visitedRooms: ['salon'],
            
            health: 100,
            maxHealth: 100,
            stamina: CONFIG.STAMINA.MAX,
            
            keys: 0,
            clues: 0,
            collectedKeys: [],
            solvedPuzzles: [],
            
            hideSpot: null,
            startTime: null
        };
    },
    
    /**
     * Ana oyun döngüsü
     */
    gameLoop() {
        if (!this.state.isRunning) return;
        if (this.state.isGameOver || this.state.isGameWon) return;
        
        // Sistemleri güncelle
        Player.update(this.state);
        Grandpa.update(this.state);
        
        // Çarpışma kontrolü
        if (!this.state.isHiding) {
            this.checkGrandpaCollision();
        }
        
        // Etkileşim kontrolü
        this.checkInteractions();
        
        // Stamina yönetimi
        this.updateStamina();
        
        // Saklanma görünümünü güncelle
        if (this.state.isHiding) {
            this.updateHidingView();
        }
        
        // UI güncelle
        UI.updateMinimap(this.state.currentRoom, this.state.visitedRooms, Grandpa.currentRoom);
        
        // Dede görünürlüğü
        Grandpa.setVisible(Grandpa.currentRoom === this.state.currentRoom);
        
        // Sonraki frame
        requestAnimationFrame(() => this.gameLoop());
    },
    
    /**
     * Stamina güncelle
     */
    updateStamina() {
        if (Player.isRunning && (Input.keys.w || Input.keys.a || Input.keys.s || Input.keys.d)) {
            this.state.stamina = Math.max(0, this.state.stamina - CONFIG.STAMINA.DRAIN_RATE);
        } else {
            this.state.stamina = Math.min(CONFIG.STAMINA.MAX, this.state.stamina + CONFIG.STAMINA.REGEN_RATE);
        }
        UI.updateStaminaBar(this.state.stamina, CONFIG.STAMINA.MAX);
    },
    
    /**
     * Dede çarpışması
     */
    checkGrandpaCollision() {
        if (Grandpa.currentRoom !== this.state.currentRoom) return;
        
        const distance = Grandpa.getDistanceToPlayer();
        if (distance < 38) {
            this.takeDamage(CONFIG.DAMAGE.CONTACT);
        }
    },
    
    /**
     * Hasar al
     */
    takeDamage(amount) {
        this.state.health -= amount;
        UI.updateHealthBar(this.state.health, this.state.maxHealth);
        UI.shakeScreen();
        
        if (this.state.health <= 0) {
            this.gameOver();
        }
    },
    
    /**
     * Etkileşimleri kontrol et
     */
    checkInteractions() {
        // Escape - bulmacayı kapat
        if (Input.isEscapePressed()) {
            this.closePuzzle();
        }
        
        // Space - saklanma
        if (Input.isHidePressed()) {
            if (this.state.isHiding) {
                this.exitHiding();
            } else {
                this.tryHide();
            }
        }
        
        // E - etkileşim
        if (Input.isInteractPressed()) {
            if (this.state.isPuzzleOpen || this.state.isHiding) return;
            
            // Anahtar kontrolü
            const nearbyKey = RoomManager.findNearbyKey(Player.x, Player.y, this.state.currentRoom);
            if (nearbyKey && !this.state.collectedKeys.includes(nearbyKey.id)) {
                this.collectKey(nearbyKey);
                return;
            }
            
            // Bulmaca kontrolü
            const nearbyPuzzle = RoomManager.findNearbyPuzzle(Player.x, Player.y, this.state.currentRoom);
            if (nearbyPuzzle) {
                this.openPuzzle(nearbyPuzzle);
                return;
            }
            
            // Kapı kontrolü
            const nearbyDoor = RoomManager.findNearbyDoor(Player.x, Player.y, this.state.currentRoom);
            if (nearbyDoor) {
                this.useDoor(nearbyDoor);
                return;
            }
        }
    },
    
    /**
     * Anahtar topla
     */
    collectKey(key) {
        this.state.collectedKeys.push(key.id);
        this.state.keys++;
        
        RoomManager.hideKey(key.id, this.state.currentRoom);
        UI.updateKeyCount(this.state.keys);
        UI.showMessage('🔑 Anahtar bulundu!', 1500);
        
        this.checkWinCondition();
    },
    
    /**
     * Anahtar ekle (kasadan)
     */
    addKey(keyId) {
        if (!this.state.collectedKeys.includes(keyId)) {
            this.state.collectedKeys.push(keyId);
            this.state.keys++;
            UI.updateKeyCount(this.state.keys);
            this.checkWinCondition();
        }
    },
    
    /**
     * İpucu ekle
     */
    addClue() {
        this.state.clues++;
        UI.updateClueCount(this.state.clues);
        this.checkWinCondition();
    },
    
    /**
     * Bulmaca çözüldü
     */
    markPuzzleSolved(puzzleId) {
        if (!this.state.solvedPuzzles.includes(puzzleId)) {
            this.state.solvedPuzzles.push(puzzleId);
        }
    },
    
    /**
     * Kapı kullan
     */
    useDoor(door) {
        // Çıkış kapısı
        if (door.isExit) {
            if (this.state.keys >= CONFIG.WIN_CONDITIONS.KEYS_REQUIRED && 
                this.state.clues >= CONFIG.WIN_CONDITIONS.CLUES_REQUIRED) {
                this.gameWin();
            } else {
                const needed = [];
                if (this.state.keys < CONFIG.WIN_CONDITIONS.KEYS_REQUIRED) {
                    needed.push(`${CONFIG.WIN_CONDITIONS.KEYS_REQUIRED - this.state.keys} anahtar`);
                }
                if (this.state.clues < CONFIG.WIN_CONDITIONS.CLUES_REQUIRED) {
                    needed.push(`${CONFIG.WIN_CONDITIONS.CLUES_REQUIRED - this.state.clues} ipucu`);
                }
                UI.showMessage(`🔒 ${needed.join(' ve ')} daha lazım!`, 2000);
            }
            return;
        }
        
        // Normal kapı
        this.state.currentRoom = RoomManager.changeRoom(door.to, door.entryPos);
        
        if (!this.state.visitedRooms.includes(door.to)) {
            this.state.visitedRooms.push(door.to);
        }
        
        // Dede'nin oda değiştirme gecikmesini sıfırla
        Grandpa.roomChangeDelay = Utils.random(0, 50);
    },
    
    /**
     * Bulmaca aç
     */
    openPuzzle(puzzleId) {
        if (PuzzleSystem.open(puzzleId, this.state.solvedPuzzles)) {
            this.state.isPuzzleOpen = true;
        }
    },
    
    /**
     * Bulmacayı kapat
     */
    closePuzzle() {
        PuzzleSystem.close();
        this.state.isPuzzleOpen = false;
    },
    
    /**
     * Saklanmaya çalış
     */
    tryHide() {
        if (this.state.isHiding || this.state.isPuzzleOpen) return;
        
        const hideSpot = RoomManager.findNearbyHideSpot(Player.x, Player.y, this.state.currentRoom);
        
        if (hideSpot) {
            this.enterHiding(hideSpot);
        } else {
            UI.showMessage('Yakında saklanacak yer yok!', 1000);
        }
    },
    
    /**
     * Saklanmaya gir
     */
    enterHiding(hideSpot) {
        this.state.isHiding = true;
        this.state.hideSpot = hideSpot.id;
        
        Grandpa.searchTime = 0;
        
        Player.setPosition(
            hideSpot.x + hideSpot.w/2 - Player.width/2,
            hideSpot.y + hideSpot.h/2 - Player.height/2
        );
        Player.setHiddenVisual(true);
        
        UI.showHidingOverlay();
    },
    
    /**
     * Saklanmadan çık
     */
    exitHiding() {
        if (!this.state.isHiding) return;
        
        this.state.isHiding = false;
        this.state.hideSpot = null;
        
        Player.setHiddenVisual(false);
        UI.hideHidingOverlay();
    },
    
    /**
     * Saklanma görünümünü güncelle
     */
    updateHidingView() {
        if (!this.state.hideSpot) return;
        
        // Saklanma yerini bul
        const room = ROOMS[this.state.currentRoom];
        const furniture = room.furniture.find(f => f.hideSpot === this.state.hideSpot);
        if (!furniture) return;
        
        if (Grandpa.currentRoom === this.state.currentRoom) {
            const spotCenter = {
                x: furniture.x + furniture.w/2,
                y: furniture.y + furniture.h/2
            };
            const distance = Utils.distance(
                Grandpa.x + Grandpa.width/2,
                Grandpa.y + Grandpa.height/2,
                spotCenter.x,
                spotCenter.y
            );
            
            if (distance < 85) {
                UI.updatePeephole('👴 ÇOK YAKIN!', '#ef4444');
                UI.setHideWarning(true);
                
                // Bulunma kontrolü
                const findChance = CONFIG.GRANDPA.FIND_CHANCE * (1 - Player.character.stealth * 0.7);
                if (Math.random() < findChance) {
                    this.exitHiding();
                    UI.showMessage('💢 Dede seni buldu!', 1500);
                    this.takeDamage(CONFIG.DAMAGE.FOUND_HIDING);
                }
            } else if (distance < 170) {
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
    
    /**
     * Kazanma koşulunu kontrol et
     */
    checkWinCondition() {
        if (this.state.keys >= CONFIG.WIN_CONDITIONS.KEYS_REQUIRED && 
            this.state.clues >= CONFIG.WIN_CONDITIONS.CLUES_REQUIRED) {
            RoomManager.unlockExitDoor();
            UI.showMessage('🚪 Çıkış kapısı açıldı! Bodruma git!', 3000);
        }
    },
    
    /**
     * Oyun bitti
     */
    gameOver() {
        this.state.isRunning = false;
        this.state.isGameOver = true;
        
        const playTime = Math.floor((Date.now() - this.state.startTime) / 1000);
        
        UI.showGameOver({
            time: Utils.formatTime(playTime),
            keys: this.state.keys,
            clues: this.state.clues
        });
    },
    
    /**
     * Oyun kazanıldı
     */
    gameWin() {
        this.state.isRunning = false;
        this.state.isGameWon = true;
        
        const playTime = Math.floor((Date.now() - this.state.startTime) / 1000);
        
        UI.showGameWin({
            time: Utils.formatTime(playTime),
            characterName: CHARACTERS[this.selectedCharacter].name
        });
    },
    
    /**
     * Yeniden başlat
     */
    restart() {
        UI.hideAllModals();
        Input.reset();
        
        this.resetState();
        Player.reset();
        Grandpa.reset();
        RoomManager.reset();
        
        // Karakter özelliklerini tekrar uygula
        const character = CHARACTERS[this.selectedCharacter];
        this.state.maxHealth = character.health;
        this.state.health = character.health;
        Player.speed = character.speed;
        
        // UI güncelle
        UI.updateHealthBar(this.state.health, this.state.maxHealth);
        UI.updateStaminaBar(this.state.stamina, CONFIG.STAMINA.MAX);
        UI.updateKeyCount(0);
        UI.updateClueCount(0);
        UI.updateRoomName(ROOMS.salon.name);
        
        // Tekrar başlat
        this.state.startTime = Date.now();
        this.state.isRunning = true;
        this.gameLoop();
    }
};
