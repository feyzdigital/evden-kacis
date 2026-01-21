/**
 * ODA YÖNETİMİ
 */

const RoomManager = {
    currentRoom: 'salon',
    roomElements: {},
    keyElements: {},
    puzzleElements: {},
    exitUnlocked: false,
    
    init() {
        this.currentRoom = 'salon';
        this.exitUnlocked = false;
        this.createRooms();
        this.showRoom('salon');
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
                    box: '📦'
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
                const doorEl = document.createElement('div');
                doorEl.className = 'door';
                if (door.isExit) {
                    doorEl.classList.add('exit-door', 'locked');
                }
                doorEl.dataset.to = door.to;
                
                // Kapı pozisyonu ve boyutu
                if (door.x === 0) {
                    doorEl.classList.add('door-side');
                    doorEl.style.cssText = `left:0;top:${door.y}px;`;
                } else if (door.x >= 730) {
                    doorEl.classList.add('door-side');
                    doorEl.style.cssText = `right:0;top:${door.y}px;`;
                } else if (door.y === 0) {
                    doorEl.classList.add('door-top');
                    doorEl.style.cssText = `left:${door.x}px;top:0;`;
                } else {
                    doorEl.classList.add('door-bottom');
                    doorEl.style.cssText = `left:${door.x}px;bottom:0;`;
                }
                
                doorEl.textContent = door.isExit ? '🚪' : '➡️';
                roomEl.appendChild(doorEl);
            }
            
            this.roomElements[roomId] = roomEl;
            container.appendChild(roomEl);
        }
    },
    
    showRoom(roomId) {
        // Tüm odaları gizle
        for (const id in this.roomElements) {
            this.roomElements[id].classList.remove('active');
        }
        
        // Seçili odayı göster
        this.roomElements[roomId].classList.add('active');
        this.currentRoom = roomId;
        
        // Oda adını güncelle
        UI.updateRoomName(ROOMS[roomId].name);
    },
    
    changeRoom(roomId, entryPos) {
        this.showRoom(roomId);
        
        // Oyuncuyu giriş pozisyonuna taşı
        if (entryPos && DOOR_ENTRY_POSITIONS[entryPos]) {
            const pos = DOOR_ENTRY_POSITIONS[entryPos];
            Player.setPosition(pos.x, pos.y);
        }
        
        return roomId;
    },
    
    findNearbyDoor(x, y, roomId) {
        const room = ROOMS[roomId];
        const playerCenter = { x: x + Player.width / 2, y: y + Player.height / 2 };
        
        for (const door of room.doors) {
            let doorCenter;
            if (door.x === 0) {
                doorCenter = { x: 10, y: door.y + 30 };
            } else if (door.x >= 730) {
                doorCenter = { x: 790, y: door.y + 30 };
            } else if (door.y === 0) {
                doorCenter = { x: door.x + 30, y: 10 };
            } else {
                doorCenter = { x: door.x + 30, y: 430 };
            }
            
            const dist = Utils.distance(playerCenter.x, playerCenter.y, doorCenter.x, doorCenter.y);
            if (dist < 60) {
                return door;
            }
        }
        return null;
    },
    
    findNearbyKey(x, y, roomId) {
        const room = ROOMS[roomId];
        const playerCenter = { x: x + Player.width / 2, y: y + Player.height / 2 };
        
        for (const key of room.keys) {
            const dist = Utils.distance(playerCenter.x, playerCenter.y, key.x + 14, key.y + 14);
            if (dist < 50) {
                return key;
            }
        }
        return null;
    },
    
    findNearbyPuzzle(x, y, roomId) {
        const room = ROOMS[roomId];
        const playerCenter = { x: x + Player.width / 2, y: y + Player.height / 2 };
        
        for (const puzzle of room.puzzles) {
            const dist = Utils.distance(playerCenter.x, playerCenter.y, puzzle.x + 20, puzzle.y + 20);
            if (dist < 60) {
                return puzzle.id;
            }
        }
        return null;
    },
    
    findNearbyHideSpot(x, y, roomId) {
        const room = ROOMS[roomId];
        const playerCenter = { x: x + Player.width / 2, y: y + Player.height / 2 };
        
        for (const furniture of room.furniture) {
            if (!furniture.hideSpot) continue;
            
            const furnitureCenter = {
                x: furniture.x + furniture.w / 2,
                y: furniture.y + furniture.h / 2
            };
            
            const dist = Utils.distance(playerCenter.x, playerCenter.y, furnitureCenter.x, furnitureCenter.y);
            if (dist < 70) {
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
        const exitDoor = bodrumRoom.querySelector('.exit-door');
        if (exitDoor) {
            exitDoor.classList.remove('locked');
        }
    },
    
    reset() {
        this.exitUnlocked = false;
        this.createRooms();
        this.showRoom('salon');
    }
};
