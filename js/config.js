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
        START_Y: 300
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

// Karakter tanımları - Yeni karakterler
const CHARACTERS = {
    duman: {
        id: 'duman',
        name: 'DUMAN',
        emoji: '🐱',
        type: 'Kedi',
        speed: 5.0,
        health: 35,
        stealth: 1.0,
        description: 'Sessiz ve çevik',
        color: 'linear-gradient(180deg, #6b7280 0%, #4b5563 30%, #374151 100%)'
    },
    mehmet: {
        id: 'mehmet',
        name: 'MEHMET',
        emoji: '👦',
        type: 'Erkek Çocuk',
        speed: 3.5,
        health: 70,
        stealth: 0.6,
        description: 'Dengeli yetenekler',
        color: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 30%, #1d4ed8 100%)'
    },
    gulten: {
        id: 'gulten',
        name: 'GÜLTEN',
        emoji: '👧',
        type: 'Kız Çocuk',
        speed: 4.0,
        health: 55,
        stealth: 0.8,
        description: 'Hızlı ve dikkatli',
        color: 'linear-gradient(180deg, #ec4899 0%, #db2777 30%, #be185d 100%)'
    },
    feyzullah: {
        id: 'feyzullah',
        name: 'FEYZULLAH',
        emoji: '👨',
        type: 'Dayı',
        speed: 2.0,
        health: 120,
        stealth: 0.3,
        description: 'Yavaş ama güçlü',
        color: 'linear-gradient(180deg, #f59e0b 0%, #d97706 30%, #b45309 100%)'
    }
};

// Oda tanımları - Düzeltilmiş kapı pozisyonları
const ROOMS = {
    oturma: {
        id: 'oturma',
        name: 'OTURMA ODASI',
        className: 'room-oturma',
        furniture: [
            { type: 'sofa', x: 50, y: 200, w: 120, h: 55 },
            { type: 'table', x: 220, y: 280, w: 90, h: 45 },
            { type: 'tv', x: 50, y: 100, w: 80, h: 50 },
            { type: 'wardrobe', x: 620, y: 180, w: 70, h: 100, hideSpot: 'wardrobe-oturma' }
        ],
        puzzles: [
            { type: 'painting', x: 400, y: 80, id: 'painting1' },
            { type: 'clock', x: 550, y: 90, id: 'clock1' }
        ],
        doors: [
            { x: 780, y: 200, to: 'mutfak', direction: 'right' },
            { x: 370, y: 0, to: 'yatak', direction: 'top' }
        ],
        keys: [],
        patrol: [
            { x: 120, y: 250 },
            { x: 400, y: 300 },
            { x: 650, y: 250 },
            { x: 400, y: 380 }
        ]
    },
    mutfak: {
        id: 'mutfak',
        name: 'MUTFAK',
        className: 'room-mutfak',
        furniture: [
            { type: 'fridge', x: 50, y: 180, w: 50, h: 90 },
            { type: 'counter', x: 50, y: 300, w: 150, h: 45 },
            { type: 'table', x: 350, y: 280, w: 100, h: 50 },
            { type: 'box', x: 600, y: 250, w: 70, h: 70, hideSpot: 'box-mutfak' }
        ],
        puzzles: [
            { type: 'book', x: 200, y: 90, id: 'book1' }
        ],
        doors: [
            { x: 0, y: 200, to: 'oturma', direction: 'left' },
            { x: 370, y: 0, to: 'bodrum', direction: 'top' }
        ],
        keys: [
            { x: 700, y: 350, id: 'key1' }
        ],
        patrol: [
            { x: 150, y: 250 },
            { x: 400, y: 350 },
            { x: 620, y: 280 },
            { x: 300, y: 250 }
        ]
    },
    yatak: {
        id: 'yatak',
        name: 'YATAK ODASI',
        className: 'room-yatak',
        furniture: [
            { type: 'bed', x: 50, y: 200, w: 130, h: 80, hideSpot: 'bed-yatak' },
            { type: 'wardrobe', x: 250, y: 180, w: 70, h: 100, hideSpot: 'wardrobe-yatak' },
            { type: 'desk', x: 550, y: 280, w: 100, h: 50 }
        ],
        puzzles: [
            { type: 'safe', x: 680, y: 120, id: 'safe1' },
            { type: 'painting', x: 400, y: 80, id: 'painting2' }
        ],
        doors: [
            { x: 370, y: 420, to: 'oturma', direction: 'bottom' },
            { x: 780, y: 200, to: 'bodrum', direction: 'right' }
        ],
        keys: [],
        patrol: [
            { x: 150, y: 280 },
            { x: 400, y: 350 },
            { x: 620, y: 250 },
            { x: 350, y: 280 }
        ]
    },
    bodrum: {
        id: 'bodrum',
        name: 'BODRUM',
        className: 'room-bodrum',
        furniture: [
            { type: 'box', x: 80, y: 220, w: 50, h: 50 },
            { type: 'box', x: 180, y: 260, w: 50, h: 50 },
            { type: 'bigbox', x: 450, y: 250, w: 100, h: 80, hideSpot: 'boxes-bodrum' },
            { type: 'barrel', x: 600, y: 300, w: 50, h: 60 }
        ],
        puzzles: [],
        doors: [
            { x: 370, y: 420, to: 'mutfak', direction: 'bottom' },
            { x: 0, y: 200, to: 'yatak', direction: 'left' },
            { x: 720, y: 100, to: 'exit', direction: 'right', isExit: true }
        ],
        keys: [
            { x: 300, y: 350, id: 'key2' }
        ],
        patrol: [
            { x: 150, y: 280 },
            { x: 400, y: 350 },
            { x: 550, y: 280 },
            { x: 300, y: 380 }
        ]
    }
};

// Kapı giriş pozisyonları - Düzeltilmiş
const DOOR_ENTRY_POSITIONS = {
    left: { x: 60, y: 240 },
    right: { x: 700, y: 240 },
    top: { x: 380, y: 100 },
    bottom: { x: 380, y: 360 }
};

// Bulmaca tanımları
const PUZZLES = {
    painting1: {
        id: 'painting1',
        type: 'riddle',
        title: '🖼️ ESKİ TABLO',
        content: 'Tablonun arkasında bir not var:<br><br>"Güneş doğduğunda 6, battığında 6.<br>Ortasında ne var?"',
        answer: '12',
        hint: 'Saat düşün... 6 + 6 = ?',
        reward: 'clue',
        clueText: 'İpucu 1: Kasa şifresi 3 basamaklı'
    },
    clock1: {
        id: 'clock1',
        type: 'observe',
        title: '🕰️ ANTİKA SAAT',
        content: 'Saat 7:25 gösteriyor.<br><br>Altında kazınmış "725" yazısı var.<br><br>Bu önemli olabilir!',
        reward: 'info'
    },
    book1: {
        id: 'book1',
        type: 'riddle',
        title: '📖 ESKİ KİTAP',
        content: 'Kitabın sayfaları arasında bir not:<br><br>"İlk rakam: Haftanın ortası kaçıncı gün?"',
        answer: '4',
        hint: 'Pazartesi 1, Salı 2, Çarşamba 3...',
        reward: 'clue',
        clueText: 'İpucu 2: Şifrenin ilk rakamı 4'
    },
    painting2: {
        id: 'painting2',
        type: 'riddle',
        title: '🖼️ AİLE PORTRESİ',
        content: 'Çerçevenin arkasında yazıyor:<br><br>"2 ve 2 yan yana gelirse?"',
        answer: '22',
        hint: 'Matematik değil, yan yana yaz...',
        reward: 'clue',
        clueText: 'İpucu 3: Son iki rakam 25'
    },
    safe1: {
        id: 'safe1',
        type: 'code',
        title: '🔐 ÇELİK KASA',
        content: '3 haneli şifreyi girin:',
        answer: '425',
        hint: 'Tüm ipuçlarını topladın mı? 4-2-5',
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
    "Çıkışı bulamazsın!",
    "Yakaladım seni!",
    "Kaçamazsın!"
];
