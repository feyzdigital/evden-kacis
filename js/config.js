/**
 * OYUN KONFİGÜRASYONU
 * Tüm oyun sabitleri ve ayarları burada
 */

const CONFIG = {
    // Oyun alanı boyutları
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    
    // Oyuncu ayarları
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 62,
        START_X: 400,
        START_Y: 360
    },
    
    // Dede ayarları
    GRANDPA: {
        WIDTH: 46,
        HEIGHT: 70,
        START_X: 100,
        START_Y: 270,
        BASE_SPEED: 1.2,
        ANGRY_SPEED_MULTIPLIER: 1.4,
        DETECTION_RANGE: 210,
        RUNNING_DETECTION_RANGE: 360,
        ROOM_CHANGE_MIN_DELAY: 180,
        ROOM_CHANGE_RANDOM_DELAY: 100,
        SEARCH_DURATION: 240,
        FIND_CHANCE: 0.002
    },
    
    // Stamina ayarları
    STAMINA: {
        MAX: 100,
        DRAIN_RATE: 0.8,
        REGEN_RATE: 0.3
    },
    
    // Hasar ayarları
    DAMAGE: {
        CONTACT: 1.5,
        FOUND_HIDING: 30
    },
    
    // Kazanma koşulları
    WIN_CONDITIONS: {
        KEYS_REQUIRED: 2,
        CLUES_REQUIRED: 3
    }
};

// Karakter tanımları
const CHARACTERS = {
    warrior: {
        id: 'warrior',
        name: 'SAVAŞÇI',
        speed: 2.5,
        health: 100,
        stealth: 0.3,
        description: 'Yavaş ama dayanıklı'
    },
    ninja: {
        id: 'ninja',
        name: 'NİNJA',
        speed: 4.5,
        health: 40,
        stealth: 1.0,
        description: 'Çok hızlı ve gizli'
    },
    mage: {
        id: 'mage',
        name: 'BÜYÜCÜ',
        speed: 2.0,
        health: 70,
        stealth: 0.6,
        description: 'Dengeli yetenekler'
    },
    scout: {
        id: 'scout',
        name: 'İZCİ',
        speed: 3.5,
        health: 60,
        stealth: 0.8,
        description: 'Hızlı ve çevik'
    }
};

// Oda tanımları
const ROOMS = {
    salon: {
        id: 'salon',
        name: 'SALON',
        className: 'room-salon',
        furniture: [
            { type: 'sofa', x: 35, y: 290, w: 110, h: 50 },
            { type: 'table', x: 180, y: 310, w: 85, h: 42 },
            { type: 'wardrobe', x: 620, y: 250, w: 65, h: 95, hideSpot: 'wardrobe-salon' }
        ],
        puzzles: [
            { type: 'painting', x: 360, y: 65, id: 'painting1' },
            { type: 'clock', x: 530, y: 80, id: 'clock1' }
        ],
        doors: [
            { x: 752, y: 250, to: 'mutfak', entryPos: 'left' },
            { x: 360, y: 0, to: 'yatak', entryPos: 'bottom' }
        ],
        keys: [],
        patrol: [
            { x: 100, y: 270 },
            { x: 380, y: 320 },
            { x: 620, y: 270 },
            { x: 380, y: 400 }
        ]
    },
    mutfak: {
        id: 'mutfak',
        name: 'MUTFAK',
        className: 'room-mutfak',
        furniture: [
            { type: 'fridge', x: 35, y: 250, w: 45, h: 80 },
            { type: 'table', x: 300, y: 310, w: 85, h: 42 },
            { type: 'box', x: 540, y: 290, w: 65, h: 65, hideSpot: 'box-mutfak' }
        ],
        puzzles: [
            { type: 'book', x: 170, y: 80, id: 'book1' }
        ],
        doors: [
            { x: 0, y: 250, to: 'salon', entryPos: 'right' },
            { x: 360, y: 0, to: 'bodrum', entryPos: 'bottom' }
        ],
        keys: [
            { x: 680, y: 370, id: 'key1' }
        ],
        patrol: [
            { x: 120, y: 270 },
            { x: 360, y: 370 },
            { x: 580, y: 310 },
            { x: 260, y: 270 }
        ]
    },
    yatak: {
        id: 'yatak',
        name: 'YATAK ODASI',
        className: 'room-yatak',
        furniture: [
            { type: 'bed', x: 70, y: 270, w: 100, h: 65, hideSpot: 'bed-yatak' },
            { type: 'wardrobe', x: 260, y: 250, w: 65, h: 95, hideSpot: 'wardrobe-yatak' },
            { type: 'table', x: 540, y: 300, w: 85, h: 42 }
        ],
        puzzles: [
            { type: 'safe', x: 640, y: 125, id: 'safe1' },
            { type: 'painting', x: 120, y: 65, id: 'painting2' }
        ],
        doors: [
            { x: 360, y: 405, to: 'salon', entryPos: 'top' },
            { x: 752, y: 250, to: 'bodrum', entryPos: 'left' }
        ],
        keys: [],
        patrol: [
            { x: 170, y: 310 },
            { x: 460, y: 370 },
            { x: 640, y: 270 },
            { x: 360, y: 310 }
        ]
    },
    bodrum: {
        id: 'bodrum',
        name: 'BODRUM',
        className: 'room-bodrum',
        furniture: [
            { type: 'box', x: 60, y: 270, w: 42, h: 42 },
            { type: 'box', x: 150, y: 290, w: 42, h: 42 },
            { type: 'box', x: 440, y: 310, w: 85, h: 65, hideSpot: 'boxes-bodrum' }
        ],
        puzzles: [],
        doors: [
            { x: 360, y: 405, to: 'mutfak', entryPos: 'top' },
            { x: 0, y: 250, to: 'yatak', entryPos: 'right' },
            { x: 730, y: 175, to: 'exit', entryPos: null, isExit: true }
        ],
        keys: [
            { x: 260, y: 370, id: 'key2' }
        ],
        patrol: [
            { x: 120, y: 310 },
            { x: 360, y: 370 },
            { x: 540, y: 310 },
            { x: 260, y: 400 }
        ]
    }
};

// Kapı giriş pozisyonları
const DOOR_ENTRY_POSITIONS = {
    left: { x: 65, y: 280 },
    right: { x: 710, y: 280 },
    top: { x: 380, y: 105 },
    bottom: { x: 380, y: 400 }
};

// Bulmaca tanımları
const PUZZLES = {
    painting1: {
        id: 'painting1',
        type: 'riddle',
        title: 'ESKİ TABLO',
        content: 'Tablonun arkasında bir not var:<br><br>"Güneş doğduğunda 6, battığında 6.<br>Ortasında ne var?"',
        answer: '12',
        hint: 'Saat düşün...',
        reward: 'clue',
        clueText: 'İpucu 1: Kasa şifresi 3 basamaklı'
    },
    clock1: {
        id: 'clock1',
        type: 'observe',
        title: 'ANTİKA SAAT',
        content: 'Saat 7:25 gösteriyor.<br>Altında "725" yazılı bir not var.',
        reward: 'info'
    },
    book1: {
        id: 'book1',
        type: 'riddle',
        title: 'ESKİ KİTAP',
        content: 'Kitabın sayfaları arasında bir not:<br><br>"İlk rakam: Haftanın ortası kaçıncı gün?"',
        answer: '4',
        hint: 'Pazartesi 1, Salı 2...',
        reward: 'clue',
        clueText: 'İpucu 2: İlk rakam 4'
    },
    painting2: {
        id: 'painting2',
        type: 'riddle',
        title: 'AİLE PORTRESİ',
        content: 'Çerçevenin arkasında yazıyor:<br><br>"2 + 2 = ?"<br><br>Dikkat, bu normal matematik değil!',
        answer: '22',
        hint: 'Rakamları yan yana koy...',
        reward: 'clue',
        clueText: 'İpucu 3: Son iki rakam 25'
    },
    safe1: {
        id: 'safe1',
        type: 'code',
        title: 'ÇELİK KASA',
        content: '3 haneli şifreyi girin:',
        answer: '425',
        hint: 'İpuçlarını topladın mı?',
        reward: 'key'
    }
};

// Dede'nin konuşmaları
const GRANDPA_SPEECHES = [
    "Seni bulacağım!",
    "Nereye kaçıyorsun?",
    "Dur bakalım!",
    "Evimden çıkamazsın!",
    "Saklanma benden!",
    "Hımmm... neredesin?",
    "Ayak sesleri duyuyorum!",
    "Çıkışı bulamazsın!"
];
