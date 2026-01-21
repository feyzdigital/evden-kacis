/**
 * ODA YÖNETİMİ
 */

const RoomManager = {
    currentRoom: 'oturma',
    roomElements: {},
    keyElements: {},
    puzzleElements: {},
    exitUnlocked: false,
    
    init() {
        this.currentRoom = 'oturma';
        this.exitUnlocked = false;
        this.createRooms();
        this.showRoom('oturma');
    },
    
    createRooms() {
        const container = Utils.$('rooms-container');
        container.innerHTML = '';
        this.roomElements = {};
        this.keyElements = {};
        this.puzzleElements = {};
        
        for (const roomId in ROOMS) {
            const room = ROOMS[roomId];
            const roomEl = document.createElement('div');
            roomEl.id = `room-${roomId}`;
            roomEl.className = `room ${room.className}`;
            
            // Oda ismi etiketi
            const roomLabel = document.createElement('div');
            roomLabel.className = 'room-label';
            roomLabel.textContent = room.name;
            roomEl.appendChild(roomLabel);
            
            // Mobilyalar
            for (const furniture of room.furniture) {
                const furnitureEl = document.createElement('div');
                furnitureEl.className = `furniture furniture-${furniture.type}`;
                if (furniture.hideSpot) {
                    furnitureEl.classList.add('hide-spot');
                    furnitureEl.dataset.hideSpot = furniture.hideSpot;
                }
                furnitureEl.style.cssText = `left:${furniture.x}px;top:${furniture.y}px;width:${furniture.w}px;height:${furniture.h}px;`;
                
                // Mobilya ikonu
                const icons = {
                    sofa: '🛋️',
                    table: '🪑',
                    wardrobe: '🚪',
                    fridge: '🧊',
                    bed: '🛏️',
                    box: '📦',
                    bigbox: '📦',
                    tv: '📺',
                    counter: '🍳',
                    desk: '🖥️',
                    barrel: '🛢️'
                };
                furnitureEl.textContent = icons[furniture.type] || '';
                
                roomEl.appendChild(furnitureEl);
            }
            
            // Bulmacalar
            for (const puzzle of room.puzzles) {
                const puzzleEl = document.createElement('div');
                puzzleEl.className = 'puzzle';
                puzzleEl.dataset.puzzleId = puzzle.id;
                puzzleEl.style.cssText = `left:${puzzle.x}px;top:${puzzle.y}px;`;
                
                const icons = {
                    painting: '🖼️',
                    clock: '🕰️',
                    book: '📖',
                    safe: '🔐'
                };
                puzzleEl.textContent = icons[puzzle.type] || '❓';
                
                this.puzzleElements[puzzle.id] = puzzleEl;
                roomEl.appendChild(puzzleEl);
            }
            
            // Anahtarlar
            for (const key of room.keys) {
                const keyEl = document.createElement('div');
                keyEl.className = 'key-item';
                keyEl.dataset.keyId = key.id;
                keyEl.style.cssText = `left:${key.x}px;top:${key.y}px;`;
                keyEl.textContent = '🔑';
                
                this.keyElements[key.id] = keyEl;
                roomEl.appendChild(keyEl);
            }
            
            // Kapılar
            for (const door of room.doors) {
                if (door.to === 'exit' && door.isExit) {
                    // Çıkış kapısı
                    const doorEl = document.createElement('div');
                    doorEl.className = 'door exit-door locked';
                    doorEl.dataset.to = 'exit';
                    doorEl.dataset.isExit = 'true';
                    doorEl.style.cssText = this.getDoorStyle(door);
                    doorEl.innerHTML = '🚪<span class="door-label">ÇIKIŞ</span>';
                    roomEl.appendChild(doorEl);
                } else {
                    // Normal kapı
                    const doorEl = document.createElement('div');
                    doorEl.className = 'door';
                    doorEl.dataset.to = door.to;
                    doorEl.dataset.direction = door.direction;
                    doorEl.style.cssText = this.getDoorStyle(door);
                    
                    // Kapı yönünü gösteren ok
                    const arrows = {
                        left: '◀',
                        right: '▶',
                        top: '▲',
                        bottom: '▼'
                    };
                    doorEl.innerHTML = `${arrows[door.direction] || '➡️'}<span class="door-label">${ROOMS[door.to]?.name || ''}</span>`;
                    roomEl.appendChild(doorEl);
                }
            }
            
            this.roomElements[roomId] = roomEl;
            container.appendChild(roomEl);
        }
    },
    
    getDoorStyle(door) {
        const direction = door.direction;
        
        if (direction === 'left') {
            return `left:0;top:${door.y}px;width:25px;height:70px;`;
        } else if (direction === 'right') {
            return `right:0;top:${door.y}px;width:25px;height:70px;`;
        } else if (direction === 'top') {
            return `left:${door.x}px;top:60px;width:70px;height:25px;`;
        } else if (direction === 'bottom') {
            return `left:${door.x}px;bottom:0;width:70px;height:25px;`;
        }
        return '';
    },
    
    showRoom(roomId) {
        // Tüm odaları gizle
        for (const id in this.roomElements) {
            this.roomElements[id].classList.remove('active');
        }
        
        // Seçili odayı göster
        if (this.roomElements[roomId]) {
            this.roomElements[roomId].classList.add('active');
        }
        this.currentRoom = roomId;
        
        // Oda adını güncelle
        UI.updateRoomName(ROOMS[roomId].name);
    },
    
    changeRoom(roomId, direction) {
        this.showRoom(roomId);
        
        // Oyuncuyu karşı tarafa yerleştir
        const oppositePositions = {
            left: 'right',
            right: 'left',
            top: 'bottom',
            bottom: 'top'
        };
        
        const entryPos = oppositePositions[direction];
        if (entryPos && DOOR_ENTRY_POSITIONS[entryPos]) {
            const pos = DOOR_ENTRY_POSITIONS[entryPos];
            Player.setPosition(pos.x, pos.y);
        }
        
        return roomId;
    },
    
    findNearbyDoor(x, y, roomId) {
        const room = ROOMS[roomId];
        if (!room) return null;
        
        const playerCenterX = x + Player.width / 2;
        const playerCenterY = y + Player.height / 2;
        
        for (const door of room.doors) {
            let doorCenterX, doorCenterY;
            
            if (door.direction === 'left') {
                doorCenterX = 12;
                doorCenterY = door.y + 35;
            } else if (door.direction === 'right') {
                doorCenterX = CONFIG.CANVAS_WIDTH - 12;
                doorCenterY = door.y + 35;
            } else if (door.direction === 'top') {
                doorCenterX = door.x + 35;
                doorCenterY = 72;
            } else if (door.direction === 'bottom') {
                doorCenterX = door.x + 35;
                doorCenterY = CONFIG.CANVAS_HEIGHT - 12;
            }
            
            const dist = Utils.distance(playerCenterX, playerCenterY, doorCenterX, doorCenterY);
            if (dist < 70) {
                return door;
            }
        }
        return null;
    },
    
    findNearbyKey(x, y, roomId) {
        const room = ROOMS[roomId];
        if (!room) return null;
        
        const playerCenterX = x + Player.width / 2;
        const playerCenterY = y + Player.height / 2;
        
        for (const key of room.keys) {
            const dist = Utils.distance(playerCenterX, playerCenterY, key.x + 14, key.y + 14);
            if (dist < 60) {
                return key;
            }
        }
        return null;
    },
    
    findNearbyPuzzle(x, y, roomId) {
        const room = ROOMS[roomId];
        if (!room) return null;
        
        const playerCenterX = x + Player.width / 2;
        const playerCenterY = y + Player.height / 2;
        
        for (const puzzle of room.puzzles) {
            const dist = Utils.distance(playerCenterX, playerCenterY, puzzle.x + 20, puzzle.y + 20);
            if (dist < 70) {
                return puzzle.id;
            }
        }
        return null;
    },
    
    findNearbyHideSpot(x, y, roomId) {
        const room = ROOMS[roomId];
        if (!room) return null;
        
        const playerCenterX = x + Player.width / 2;
        const playerCenterY = y + Player.height / 2;
        
        for (const furniture of room.furniture) {
            if (!furniture.hideSpot) continue;
            
            const furnitureCenterX = furniture.x + furniture.w / 2;
            const furnitureCenterY = furniture.y + furniture.h / 2;
            
            const dist = Utils.distance(playerCenterX, playerCenterY, furnitureCenterX, furnitureCenterY);
            if (dist < 80) {
                return { ...furniture, id: furniture.hideSpot };
            }
        }
        return null;
    },
    
    hideKey(keyId, roomId) {
        if (this.keyElements[keyId]) {
            this.keyElements[keyId].classList.add('collected');
        }
    },
    
    markPuzzleSolved(puzzleId) {
        if (this.puzzleElements[puzzleId]) {
            this.puzzleElements[puzzleId].classList.add('solved');
        }
    },
    
    unlockExitDoor() {
        this.exitUnlocked = true;
        // Bodrumdaki çıkış kapısını aç
        const bodrumRoom = this.roomElements['bodrum'];
        if (bodrumRoom) {
            const exitDoor = bodrumRoom.querySelector('.exit-door');
            if (exitDoor) {
                exitDoor.classList.remove('locked');
            }
        }
    },
    
    reset() {
        this.exitUnlocked = false;
        this.createRooms();
        this.showRoom('oturma');
    }
};
