/**
 * UI MODÜLÜ
 */

const UI = {
    messageTimeout: null,
    
    init() {
        this.createCharacterGrid();
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
                <div class="character-sprite" style="background:${this.getCharacterColor(charId)};border-radius:50% 50% 40% 40%;"></div>
                <div class="character-name">${char.name}</div>
                <div class="character-stats">
                    ❤️${char.health} ⚡${char.speed} 👁️${Math.round(char.stealth * 100)}%
                </div>
                <div class="character-desc">${char.description}</div>
            `;
            
            card.addEventListener('click', () => this.selectCharacter(charId, card));
            grid.appendChild(card);
        }
    },
    
    getCharacterColor(charId) {
        const colors = {
            warrior: 'linear-gradient(180deg, #ef4444, #991b1b)',
            ninja: 'linear-gradient(180deg, #1f2937, #030712)',
            mage: 'linear-gradient(180deg, #a855f7, #6b21a8)',
            scout: 'linear-gradient(180deg, #22c55e, #15803d)'
        };
        return colors[charId] || 'gray';
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
    
    showGame() {
        Utils.$('menu-screen').style.display = 'none';
        Utils.$('game-screen').classList.add('active');
    },
    
    showMenu() {
        Utils.$('menu-screen').style.display = 'flex';
        Utils.$('game-screen').classList.remove('active');
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
        
        const roomOrder = ['yatak', 'bodrum', 'salon', 'mutfak'];
        
        for (const roomId of roomOrder) {
            const room = ROOMS[roomId];
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
                salon: 'SAL',
                mutfak: 'MUT',
                yatak: 'YTK',
                bodrum: 'BOD'
            };
            mapRoom.textContent = shortNames[roomId];
            
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
        Utils.$('hide-warning').style.display = show ? 'block' : 'none';
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
        `;
        Utils.$('game-win').classList.add('active');
    },
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }
};
