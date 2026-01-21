/**
 * UI MODÜLÜ
 */

const UI = {
    messageTimeout: null,
    
    init() {
        this.createCharacterGrid();
        
        // Mobil kontrolleri göster/gizle
        if (Utils.isMobile()) {
            this.showMobileControls();
        }
    },
    
    createCharacterGrid() {
        const grid = Utils.$('character-grid');
        grid.innerHTML = '';
        
        for (const charId in CHARACTERS) {
            const char = CHARACTERS[charId];
            
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.character = charId;
            
            card.innerHTML = `
                <div class="character-avatar">${char.emoji}</div>
                <div class="character-name">${char.name}</div>
                <div class="character-type">${char.type}</div>
                <div class="character-stats">
                    <span title="Can">❤️${char.health}</span>
                    <span title="Hız">⚡${char.speed}</span>
                    <span title="Gizlilik">👁️${Math.round(char.stealth * 100)}%</span>
                </div>
                <div class="character-desc">${char.description}</div>
            `;
            
            card.addEventListener('click', () => this.selectCharacter(charId, card));
            
            // Mobil için touch event
            card.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selectCharacter(charId, card);
            });
            
            grid.appendChild(card);
        }
    },
    
    selectCharacter(charId, cardElement) {
        // Önceki seçimi kaldır
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        
        // Yeni seçimi işaretle
        cardElement.classList.add('selected');
        Game.selectedCharacter = charId;
        
        // Başlat butonunu aktifle
        Utils.$('start-btn').disabled = false;
    },
    
    showMobileControls() {
        const mobileControls = Utils.$('mobile-controls');
        if (mobileControls) {
            mobileControls.classList.add('active');
        }
    },
    
    hideMobileControls() {
        const mobileControls = Utils.$('mobile-controls');
        if (mobileControls) {
            mobileControls.classList.remove('active');
        }
    },
    
    showGame() {
        Utils.$('menu-screen').style.display = 'none';
        Utils.$('game-screen').classList.add('active');
        
        if (Utils.isMobile()) {
            this.showMobileControls();
        }
    },
    
    showMenu() {
        Utils.$('menu-screen').style.display = 'flex';
        Utils.$('game-screen').classList.remove('active');
        this.hideMobileControls();
    },
    
    updateHealthBar(current, max) {
        const bar = Utils.$('health-bar');
        const percent = (current / max) * 100;
        bar.style.width = percent + '%';
        
        // Renk değişimi
        if (percent < 30) {
            bar.style.background = 'linear-gradient(90deg, #7f1d1d, #ef4444)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #991b1b, #ef4444)';
        }
    },
    
    updateStaminaBar(current, max) {
        const bar = Utils.$('stamina-bar');
        bar.style.width = (current / max) * 100 + '%';
    },
    
    updateKeyCount(count) {
        Utils.$('key-count').textContent = count;
    },
    
    updateClueCount(count) {
        Utils.$('clue-count').textContent = count;
    },
    
    updateRoomName(name) {
        Utils.$('room-name').textContent = name;
    },
    
    updateMinimap(currentRoom, visitedRooms, grandpaRoom) {
        const minimap = Utils.$('mini-map');
        minimap.innerHTML = '';
        
        // Oda düzeni: üst satır (yatak, bodrum), alt satır (oturma, mutfak)
        const roomOrder = ['yatak', 'bodrum', 'oturma', 'mutfak'];
        
        for (const roomId of roomOrder) {
            const room = ROOMS[roomId];
            if (!room) continue;
            
            const mapRoom = document.createElement('div');
            mapRoom.className = 'map-room';
            
            if (roomId === currentRoom) {
                mapRoom.classList.add('current');
            }
            if (roomId === grandpaRoom) {
                mapRoom.classList.add('grandpa-here');
            }
            
            // Kısa isim
            const shortNames = {
                oturma: 'ODA',
                mutfak: 'MUT',
                yatak: 'YTK',
                bodrum: 'BOD'
            };
            mapRoom.textContent = shortNames[roomId] || roomId.substring(0, 3).toUpperCase();
            
            minimap.appendChild(mapRoom);
        }
    },
    
    showMessage(text, duration = 2000) {
        const popup = Utils.$('message-popup');
        popup.textContent = text;
        popup.classList.add('active');
        
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        this.messageTimeout = setTimeout(() => {
            popup.classList.remove('active');
        }, duration);
    },
    
    shakeScreen() {
        const canvas = Utils.$('game-canvas');
        canvas.classList.add('shake');
        setTimeout(() => canvas.classList.remove('shake'), 300);
    },
    
    showHidingOverlay() {
        Utils.$('hiding-overlay').classList.add('active');
    },
    
    hideHidingOverlay() {
        Utils.$('hiding-overlay').classList.remove('active');
    },
    
    updatePeephole(text, color) {
        const peephole = Utils.$('peephole-content');
        peephole.textContent = text;
        peephole.style.color = color;
    },
    
    setHideWarning(show) {
        const warning = Utils.$('hide-warning');
        if (warning) {
            warning.style.display = show ? 'block' : 'none';
        }
    },
    
    showGameOver(stats) {
        Utils.$('game-over-stats').innerHTML = `
            <p>⏱️ Süre: ${stats.time}</p>
            <p>🔑 Anahtarlar: ${stats.keys}/2</p>
            <p>📜 İpuçları: ${stats.clues}/3</p>
        `;
        Utils.$('game-over').classList.add('active');
    },
    
    showGameWin(stats) {
        Utils.$('game-win-stats').innerHTML = `
            <p>⏱️ Süre: ${stats.time}</p>
            <p>🎭 Karakter: ${stats.characterName}</p>
            <p>🏆 TEBRİKLER!</p>
        `;
        Utils.$('game-win').classList.add('active');
    },
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }
};
