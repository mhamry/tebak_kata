/* =======================================================
   GAME.JS — Versi sudah diperbaiki
   Perbaikan utama:
   - hasil SpeechRecognition mengambil result terakhir (tidak selalu ev.results[0])
   - mic restart lebih stabil (delay kecil dan flag micActive dikelola dengan benar)
   - mic hanya dipanggil setelah klik START (tetap ada tombol 🎤 untuk on/off)
   - difficulty normal diatur lebih wajar (normal = 20s)
   - timer per kata diatur dan stop/start aman
   - proteksi untuk double-start mic / double-click
   - simpan lastScore saat game selesai
   - small UX fixes: update level & score lebih konsisten
========================================================== */

// ========= DATA SOAL =========
const data = [
  {
    word: "apple",
    clues: ["sweet", "fruit", "red", "tree", "round", "crunchy", "juice", "fresh", "snack", "healthy", "seed", "orchard", "pie", "smooth skin", "core", "green", "yellow", "small", "soft", "popular"],
  },
  {
    word: "policeman",
    clues: ["gun", "street", "uniform", "officer", "traffic", "law", "crime", "patrol", "guard", "arrest", "justice", "badge", "radio", "safety", "blue", "help", "protect", "public", "duty", "team"],
  },

  {
    word: "teacher",
    clues: ["school", "class", "learn", "students", "book", "explain", "help", "knowledge", "lesson", "board", "write", "grade", "subject", "education", "guide", "test", "exercise", "question", "answer", "mentor"],
  },
  {
    word: "banana",
    clues: ["yellow", "fruit", "sweet", "monkey", "soft", "long", "peel", "tropical", "bunch", "tree", "smooth", "fresh", "snack", "healthy", "vitamin", "potassium", "breakfast", "curve", "seedless", "tasty"],
  },
  {
    word: "doctor",
    clues: ["hospital", "health", "medicine", "checkup", "stethoscope", "patient", "cure", "treat", "clinic", "nurse", "white coat", "injury", "disease", "help", "care", "exam", "advice", "prescription", "emergency", "skill"],
  },
  {
    word: "bicycle",
    clues: ["ride", "pedal", "wheel", "handle", "road", "helmet", "brake", "speed", "exercise", "chain", "seat", "balance", "two wheels", "transport", "gear", "outdoor", "path", "bike", "cycle", "travel"],
  },
  {
    word: "mountain",
    clues: ["high", "peak", "hill", "rock", "climb", "nature", "snow", "forest", "valley", "fresh air", "view", "hiking", "cold", "tall", "wildlife", "path", "trail", "landscape", "earth", "summit"],
  },
  {
    word: "computer",
    clues: ["technology", "screen", "keyboard", "mouse", "internet", "code", "software", "hardware", "device", "typing", "data", "apps", "program", "machine", "digital", "work", "game", "study", "office", "tool"],
  },
  {
    word: "library",
    clues: ["books", "quiet", "read", "study", "shelf", "borrow", "return", "librarian", "knowledge", "story", "desk", "chair", "novel", "magazine", "catalog", "research", "public", "students", "information", "learning"],
  },
  {
    word: "chicken",
    clues: ["bird", "farm", "meat", "feather", "egg", "cluck", "animal", "food", "cook", "fried", "grill", "roast", "white", "protein", "farmhouse", "eat", "lunch", "fresh", "market", "kitchen"],
  },
  {
    word: "rainbow",
    clues: ["color", "sky", "rain", "sun", "arc", "beautiful", "bright", "weather", "light", "seven colors", "shine", "after rain", "curve", "nature", "rare", "view", "atmosphere", "wonder", "colorful", "pattern"],
  },
  {
    word: "airplane",
    clues: ["fly", "sky", "pilot", "airport", "travel", "wing", "engine", "seat", "safety", "cabin", "crew", "air", "flight", "takeoff", "landing", "window", "speed", "machine", "route", "passenger"],
  },
  {
    word: "dolphin",
    clues: ["ocean", "swim", "smart", "animal", "jump", "fish", "blue", "water", "friendly", "wave", "tail", "fin", "mammal", "group", "play", "sound", "wild", "show", "cute", "sea"],
  },
  {
    word: "train",
    clues: ["rail", "track", "station", "travel", "speed", "carriage", "engine", "horn", "steam", "driver", "passenger", "seat", "ticket", "transport", "journey", "tunnel", "platform", "metal", "long", "route"],
  },
  {
    word: "kitchen",
    clues: ["cook", "food", "stove", "pan", "knife", "sink", "table", "prepare", "meal", "recipe", "cupboard", "clean", "spoon", "fork", "fry", "boil", "gas", "apron", "cut", "chef"],
  },
  {
    word: "garden",
    clues: ["plant", "flower", "green", "tree", "grass", "water", "soil", "grow", "fresh", "nature", "fruit", "vegetable", "butterfly", "sun", "seed", "pot", "gardeners", "smell", "beauty", "outdoor"],
  },
  {
    word: "hospital",
    clues: ["doctor", "nurse", "patient", "medicine", "emergency", "care", "clinic", "surgery", "health", "room", "bed", "ambulance", "treat", "checkup", "equipment", "white", "clean", "sick", "service", "recovery"],
  },
  {
    word: "elephant",
    clues: ["big", "gray", "trunk", "tusk", "animal", "wild", "zoo", "jungle", "heavy", "large", "ears", "legs", "grass", "herd", "strong", "water", "forest", "walk", "eat", "mammal"],
  },
  {
    word: "camera",
    clues: ["photo", "picture", "lens", "shoot", "film", "capture", "memory", "flash", "focus", "button", "digital", "device", "image", "record", "view", "hold", "zoom", "screen", "shot", "travel"],
  },
  {
    word: "cupboard",
    clues: ["kitchen", "wood", "door", "storage", "plate", "bowl", "food", "shelf", "space", "keep", "clean", "utensils", "glass", "organize", "safe", "tall", "handle", "closed", "thing", "home"],
  },
  {
    word: "football",
    clues: ["sport", "kick", "goal", "team", "stadium", "ball", "field", "referee", "score", "win", "match", "player", "coach", "league", "fans", "pass", "run", "shoot", "practice", "game"],
  },
  {
    word: "chocolate",
    clues: ["sweet", "brown", "delicious", "snack", "candy", "bar", "sugar", "cocoa", "milk", "dark", "dessert", "taste", "melt", "soft", "treat", "wrap", "favorite", "eat", "box", "gift"],
  },

  {
    word: "pencil",
    clues: ["write", "school", "eraser", "wood", "sharp", "point", "lead", "draw", "sketch", "classroom", "paper", "homework", "note", "tool", "yellow", "long", "hand", "student", "simple", "stationery"],
  },
  {
    word: "firefighter",
    clues: ["fire", "truck", "water", "rescue", "helmet", "danger", "team", "emergency", "brave", "uniform", "hose", "smoke", "extinguish", "ladder", "building", "safety", "protect", "alarm", "help", "night shift"],
  },
  {
    word: "guitar",
    clues: ["music", "string", "sound", "play", "song", "band", "instrument", "pick", "wood", "melody", "chord", "hand", "strum", "note", "tune", "artist", "stage", "practice", "solo", "acoustic"],
  },
  {
    word: "orange",
    clues: ["fruit", "round", "sweet", "citrus", "peel", "vitamin C", "juice", "fresh", "tree", "smell", "snack", "orange color", "tropical", "seed", "slice", "healthy", "market", "drink", "basket", "bright"],
  },
  {
    word: "chef",
    clues: ["cook", "kitchen", "food", "restaurant", "knife", "recipe", "dish", "taste", "heat", "pan", "flavor", "serve", "apron", "salt", "menu", "prepare", "skill", "professional", "training", "kitchenware"],
  },
  {
    word: "turtle",
    clues: ["slow", "shell", "animal", "swim", "land", "water", "reptile", "green", "egg", "ocean", "cute", "walk", "nature", "wildlife", "hard", "protection", "long life", "island", "sea", "creature"],
  },
  {
    word: "robot",
    clues: ["machine", "metal", "technology", "smart", "program", "AI", "work", "move", "future", "arm", "build", "tool", "factory", "science", "control", "code", "task", "button", "battery", "robotics"],
  },
  {
    word: "moon",
    clues: ["night", "sky", "round", "space", "shine", "crater", "gray", "light", "star", "earth", "orbit", "shadow", "telescope", "astronomy", "cold", "gravity", "full", "crescent", "dark", "surface"],
  },
  {
    word: "cat",
    clues: ["animal", "pet", "fur", "whisker", "meow", "cute", "claw", "sleep", "jump", "milk", "purr", "tail", "house", "play", "feed", "soft", "ears", "hunter", "mouse", "friendly"],
  },
  {
    word: "pizza",
    clues: ["food", "cheese", "tomato", "slice", "round", "bake", "oven", "topping", "pepperoni", "crust", "restaurant", "dough", "delicious", "hot", "menu", "serve", "eat", "box", "fast food", "party"],
  },
  {
    word: "carpet",
    clues: ["floor", "soft", "cover", "home", "decorate", "clean", "dust", "vacuum", "room", "warm", "color", "pattern", "fabric", "texture", "step", "roll", "thick", "square", "living room", "household"],
  },
  {
    word: "farmer",
    clues: ["field", "crop", "rice", "cow", "chicken", "plant", "farm", "soil", "sun", "rain", "tractor", "harvest", "grass", "barn", "morning", "work", "grow", "food", "seed", "land"],
  },
  {
    word: "butterfly",
    clues: ["fly", "wing", "color", "garden", "flower", "insect", "beautiful", "small", "nature", "nectar", "pattern", "light", "summer", "outdoor", "caterpillar", "life cycle", "group", "leaf", "soft", "air"],
  },
  {
    word: "clock",
    clues: ["time", "hour", "minute", "second", "round", "wall", "hands", "tick", "alarm", "watch", "number", "measure", "schedule", "wake", "day", "night", "office", "home", "sound", "tool"],
  },
  {
    word: "bridge",
    clues: ["river", "road", "connect", "car", "walk", "city", "steel", "build", "long", "cross", "water", "strong", "structure", "traffic", "transport", "arches", "engineer", "support", "design", "height"],
  },
  {
    word: "camera",
    clues: ["photo", "lens", "shoot", "picture", "flash", "capture", "focus", "zoom", "memory", "image", "record", "button", "digital", "device", "travel", "save", "screen", "shot", "video", "hold"],
  },
  {
    word: "snowman",
    clues: ["winter", "cold", "white", "snow", "round", "carrot", "nose", "scarf", "fun", "freeze", "season", "outside", "play", "build", "arms", "stick", "eyes", "family", "holiday", "frost"],
  },
  {
    word: "school",
    clues: ["study", "teacher", "class", "student", "learning", "subject", "board", "desk", "test", "book", "bell", "break", "friends", "uniform", "lesson", "library", "homework", "schedule", "bag", "education"],
  },
  {
    word: "coffee",
    clues: ["drink", "brown", "hot", "cup", "morning", "cafe", "bean", "bitter", "aroma", "sugar", "milk", "stir", "energy", "work", "break", "table", "brew", "steam", "liquid", "favorite"],
  },
  {
    word: "island",
    clues: ["sea", "water", "sand", "beach", "tropical", "sun", "wave", "vacation", "boat", "small", "nature", "tree", "coconut", "travel", "remote", "blue", "fish", "coral", "warm", "sky"],
  },

  { word: "teacher", clues: ["school", "class", "student", "lesson", "board", "write", "explain", "homework", "book", "pen", "help", "teach", "test", "subject", "desk", "paper", "learn", "guide", "room", "knowledge"] },
  { word: "mountain", clues: ["high", "rock", "climb", "snow", "cold", "peak", "nature", "hill", "forest", "wild", "air", "view", "trail", "camp", "green", "earth", "steep", "travel", "summit", "big"] },
  { word: "river", clues: ["water", "flow", "wet", "long", "bridge", "fish", "boat", "fresh", "nature", "blue", "wave", "stream", "current", "bank", "cool", "travel", "deep", "earth", "wild", "path"] },
  { word: "window", clues: ["glass", "room", "house", "see", "open", "close", "frame", "sun", "air", "light", "wall", "curtain", "clean", "square", "view", "wind", "outside", "inside", "line", "look"] },
  { word: "doctor", clues: ["hospital", "sick", "patient", "help", "medicine", "health", "white", "coat", "check", "care", "clinic", "tool", "body", "test", "heal", "room", "nurse", "stethoscope", "desk", "work"] },
  { word: "garden", clues: ["flower", "green", "plant", "tree", "grass", "water", "soil", "sun", "grow", "nature", "fresh", "tool", "yard", "small", "leaf", "fruit", "fence", "earth", "hose", "seed"] },
  { word: "bottle", clues: ["water", "drink", "plastic", "glass", "cap", "hold", "liquid", "carry", "blue", "cold", "shop", "desk", "hand", "small", "round", "pour", "fill", "empty", "clean", "use"] },
  { word: "bicycle", clues: ["wheel", "ride", "pedal", "road", "sport", "fast", "slow", "seat", "handle", "travel", "exercise", "metal", "chain", "helmet", "park", "path", "two", "move", "outdoor", "fun"] },
  { word: "forest", clues: ["tree", "green", "nature", "wild", "animal", "bird", "rain", "leaf", "wood", "fresh", "air", "ground", "shadow", "walk", "dark", "life", "fire", "sound", "trail", "earth"] },
  { word: "hotel", clues: ["room", "sleep", "travel", "stay", "key", "bed", "guest", "reception", "lobby", "service", "clean", "food", "floor", "lift", "bag", "holiday", "night", "window", "staff", "check"] },
  { word: "elephant", clues: ["big", "animal", "gray", "trunk", "wild", "ear", "Africa", "Asia", "heavy", "forest", "grass", "zoo", "long", "water", "family", "sound", "walk", "nature", "skin", "tail"] },
  { word: "pencil", clues: ["write", "school", "wood", "lead", "eraser", "sharp", "paper", "draw", "long", "yellow", "desk", "student", "tool", "hand", "line", "point", "box", "small", "use", "class"] },
  { word: "newspaper", clues: ["news", "paper", "read", "text", "photo", "daily", "morning", "headline", "story", "report", "page", "ink", "buy", "shop", "world", "event", "column", "writer", "black", "white"] },
  { word: "camera", clues: ["photo", "picture", "lens", "flash", "shoot", "memory", "screen", "focus", "light", "travel", "hold", "small", "digital", "view", "zoom", "record", "scene", "button", "click", "capture"] },
  { word: "umbrella", clues: ["rain", "wet", "cover", "hold", "open", "close", "stick", "black", "storm", "hands", "sky", "street", "dry", "shade", "sun", "walk", "wind", "drop", "water", "weather"] },
  { word: "library", clues: ["book", "read", "quiet", "study", "student", "table", "shelf", "borrow", "return", "paper", "computer", "chair", "room", "write", "learn", "big", "public", "page", "author", "information"] },
  { word: "ocean", clues: ["water", "blue", "wave", "salt", "deep", "big", "fish", "boat", "ship", "wind", "sky", "travel", "beach", "sand", "whale", "shark", "island", "current", "cold", "open"] },
  { word: "chicken", clues: ["bird", "animal", "farm", "egg", "food", "white", "brown", "feather", "cluck", "small", "eat", "run", "grass", "wing", "house", "barn", "sound", "market", "cook", "meat"] },
  { word: "computer", clues: ["screen", "keyboard", "mouse", "program", "code", "work", "office", "internet", "file", "data", "click", "type", "window", "software", "hardware", "run", "fast", "desk", "user", "system"] },
  { word: "market", clues: ["shop", "buy", "sell", "food", "fruit", "crowd", "street", "price", "bag", "fresh", "vendor", "table", "money", "people", "loud", "open", "day", "fish", "meat", "stand"] },
  { word: "school", clues: ["student", "teacher", "class", "desk", "lesson", "bell", "paper", "write", "bag", "subject", "test", "work", "learn", "room", "whiteboard", "uniform", "chair", "friend", "hall", "library"] },
  { word: "bridge", clues: ["cross", "river", "road", "car", "long", "metal", "walk", "connect", "city", "water", "build", "support", "arch", "high", "big", "travel", "street", "path", "structure", "land"] },
  { word: "planet", clues: ["Earth", "space", "round", "sun", "moon", "star", "orbit", "sky", "dark", "galaxy", "big", "cold", "far", "world", "light", "spin", "planet", "live", "gas", "blue"] },
  { word: "train", clues: ["rail", "travel", "fast", "slow", "carriage", "ticket", "station", "track", "whistle", "window", "seat", "carry", "people", "city", "journey", "long", "sound", "platform", "move", "steel"] },
  { word: "desk", clues: ["table", "wood", "work", "school", "office", "write", "draw", "paper", "pen", "laptop", "chair", "small", "big", "top", "leg", "clean", "room", "corner", "flat", "surface"] },
  { word: "waiter", clues: ["restaurant", "food", "serve", "order", "menu", "table", "drink", "plate", "kitchen", "customer", "pay", "chair", "pen", "write", "dish", "carry", "job", "work", "glass", "bill"] },
  { word: "butterfly", clues: ["wing", "color", "fly", "garden", "flower", "nature", "small", "soft", "air", "life", "tree", "insect", "beautiful", "day", "light", "body", "antenna", "shape", "orange", "pattern"] },
  { word: "candle", clues: ["light", "fire", "wax", "stick", "burn", "warm", "night", "dark", "smell", "yellow", "soft", "small", "melt", "room", "holder", "table", "gift", "glow", "white", "flame"] },
  { word: "airport", clues: ["plane", "travel", "runway", "luggage", "ticket", "passport", "gate", "pilot", "flight", "departure", "arrival", "bag", "security", "line", "board", "terminal", "seat", "screen", "crew", "sky"] },
  { word: "shirt", clues: ["cloth", "wear", "button", "white", "blue", "cotton", "iron", "wash", "dry", "hanger", "closet", "body", "long", "short", "fashion", "store", "man", "woman", "office", "pocket"] },
  { word: "cookie", clues: ["sweet", "food", "snack", "eat", "bake", "brown", "sugar", "chocolate", "kitchen", "plate", "small", "round", "soft", "crunchy", "flour", "gift", "milk", "holiday", "bite", "treat"] },
  { word: "hospital", clues: ["doctor", "nurse", "patient", "sick", "care", "room", "bed", "medicine", "check", "help", "test", "white", "clean", "emergency", "ambulance", "health", "visit", "staff", "tool", "clinic"] },
  { word: "clock", clues: ["time", "round", "number", "hour", "minute", "second", "hand", "wall", "sound", "tick", "alarm", "ring", "watch", "look", "work", "glass", "circle", "move", "day", "night"] },
  { word: "radio", clues: ["music", "news", "sound", "voice", "speaker", "listen", "channel", "signal", "car", "old", "home", "button", "volume", "wave", "air", "tool", "box", "story", "program", "noise"] },
  { word: "football", clues: ["sport", "ball", "kick", "team", "grass", "goal", "stadium", "run", "score", "match", "coach", "game", "win", "player", "field", "fan", "shoes", "referee", "practice", "training"] },
  { word: "pillow", clues: ["sleep", "soft", "bed", "night", "rest", "cover", "white", "cotton", "room", "dream", "head", "relax", "warm", "blanket", "comfort", "square", "home", "clean", "fluffy", "fabric"] },
  { word: "knife", clues: ["sharp", "cut", "kitchen", "food", "steel", "handle", "cook", "danger", "tool", "long", "small", "table", "slice", "use", "clean", "point", "sharp", "hold", "wood", "blade"] },
  { word: "moon", clues: ["night", "sky", "round", "white", "light", "dark", "star", "shine", "space", "cold", "high", "quiet", "black", "glow", "circle", "far", "gravity", "orbit", "crater", "rock"] },
  { word: "panda", clues: ["bear", "black", "white", "cute", "China", "bamboo", "eat", "forest", "sleep", "zoo", "soft", "round", "slow", "animal", "nature", "rare", "peace", "walk", "big", "friendly"] },
  { word: "juice", clues: ["drink", "fruit", "sweet", "orange", "glass", "fresh", "cold", "bottle", "breakfast", "apple", "grape", "pineapple", "liquid", "mix", "ice", "cup", "healthy", "shop", "sip", "smooth"] },
  { word: "volcano", clues: ["mountain", "fire", "lava", "hot", "eruption", "ash", "smoke", "danger", "rock", "nature", "big", "red", "earth", "explode", "steam", "crater", "magma", "dark", "boom", "heat"] },
  { word: "mirror", clues: ["glass", "see", "face", "wall", "clean", "reflect", "look", "bathroom", "room", "shine", "silver", "square", "big", "small", "frame", "stand", "image", "bright", "clear", "surface"] },
  { word: "farmer", clues: ["field", "plant", "soil", "food", "work", "animal", "cow", "chicken", "rice", "corn", "grass", "truck", "farm", "tool", "weather", "sun", "grow", "harvest", "barn", "seed"] },
  { word: "penguin", clues: ["bird", "black", "white", "cold", "snow", "ice", "walk", "swim", "fish", "Antarctica", "cute", "small", "family", "group", "slide", "water", "animal", "nature", "winter", "feather"] },
  { word: "robot", clues: ["machine", "metal", "arm", "work", "tool", "factory", "code", "program", "move", "electric", "future", "artificial", "tech", "brain", "task", "build", "system", "shape", "light", "smart"] },
  { word: "rainbow", clues: ["color", "sky", "rain", "sun", "arc", "light", "bright", "beauty", "cloud", "blue", "green", "yellow", "red", "purple", "curve", "magic", "nature", "after", "storm", "shine"] },
  { word: "sandwich", clues: ["bread", "food", "eat", "lunch", "cheese", "meat", "vegetable", "kitchen", "plate", "tomato", "lettuce", "slice", "cut", "simple", "snack", "ham", "wrap", "fill", "fresh", "bite"] },
  { word: "carpet", clues: ["floor", "soft", "room", "home", "walk", "clean", "dust", "red", "big", "small", "cover", "warm", "fabric", "roll", "thick", "pattern", "brown", "step", "decorate", "house"] },
  {
    word: "mountain",
    clues: ["high", "rock", "peak", "snow", "climb", "hike", "cold", "nature", "forest", "trail", "wind", "sky", "steep", "wild", "fresh", "blue", "ridge", "summit", "view", "outdoor"],
  },
  {
    word: "pencil",
    clues: ["write", "school", "yellow", "wood", "eraser", "note", "sharp", "long", "draw", "paper", "point", "sketch", "tool", "class", "hand", "tip", "graphite", "line", "student", "desk"],
  },
  {
    word: "river",
    clues: ["water", "flow", "long", "bridge", "fish", "boat", "nature", "cold", "fresh", "blue", "current", "bank", "tree", "run", "wet", "travel", "wide", "deep", "stream", "path"],
  },
  {
    word: "doctor",
    clues: ["hospital", "white", "health", "patient", "check", "medicine", "clinic", "help", "care", "disease", "tools", "nurse", "work", "treat", "cure", "office", "mask", "exam", "expert", "duty"],
  },
  {
    word: "school",
    clues: ["study", "teacher", "student", "class", "desk", "board", "learn", "bell", "uniform", "paper", "friend", "test", "room", "subject", "book", "library", "hall", "chair", "lesson", "building"],
  },
  {
    word: "banana",
    clues: ["yellow", "fruit", "sweet", "peel", "soft", "long", "tropical", "snack", "tree", "fresh", "food", "lunch", "healthy", "smooth", "bunch", "curve", "seedless", "easy", "light", "favorite"],
  },
  {
    word: "teacher",
    clues: ["class", "student", "school", "lesson", "explain", "write", "help", "subject", "test", "homework", "desk", "chalk", "book", "talk", "grade", "guide", "plan", "room", "teach", "education"],
  },
  {
    word: "window",
    clues: ["glass", "open", "close", "house", "light", "air", "room", "frame", "curtain", "view", "wall", "square", "look", "clean", "shine", "building", "rain", "outside", "inside", "clear"],
  },
  {
    word: "camera",
    clues: ["photo", "picture", "lens", "shoot", "memory", "flash", "record", "focus", "click", "image", "device", "digital", "capture", "film", "screen", "hold", "travel", "light", "zoom", "view"],
  },
  {
    word: "guitar",
    clues: ["music", "string", "sound", "play", "band", "instrument", "hand", "song", "wood", "tone", "note", "rock", "acoustic", "electric", "pick", "performance", "melody", "chord", "beat", "stage"],
  },
  {
    word: "forest",
    clues: ["tree", "green", "nature", "animal", "wood", "bird", "plant", "wild", "fresh", "air", "hike", "path", "shadow", "quiet", "leaf", "soil", "long", "dark", "cold", "life"],
  },
  {
    word: "computer",
    clues: ["screen", "keyboard", "mouse", "coding", "program", "internet", "device", "office", "electric", "type", "file", "data", "game", "processor", "apps", "task", "work", "software", "modern", "technology"],
  },
  {
    word: "flower",
    clues: ["petal", "color", "garden", "plant", "smell", "nature", "bee", "green", "stem", "leaf", "soil", "spring", "grow", "sun", "beautiful", "fresh", "soft", "red", "gift", "bouquet"],
  },
  {
    word: "market",
    clues: ["buy", "sell", "food", "fruit", "shop", "people", "busy", "money", "store", "street", "fresh", "vendor", "price", "bag", "walk", "crowd", "cash", "stall", "trade", "daily"],
  },
  {
    word: "airplane",
    clues: ["fly", "sky", "wing", "pilot", "travel", "airport", "engine", "seat", "ticket", "air", "fast", "bag", "trip", "cloud", "window", "landing", "takeoff", "runway", "crew", "safety"],
  },
  {
    word: "apple",
    clues: ["fruit", "sweet", "red", "round", "tree", "green", "snack", "juice", "crunchy", "fresh", "seed", "smooth", "healthy", "soft", "popular", "pie", "small", "yellow", "core", "basket"],
  },
  {
    word: "station",
    clues: ["train", "bus", "travel", "wait", "ticket", "platform", "crowd", "schedule", "arrival", "departure", "track", "public", "transport", "bench", "line", "sound", "stop", "ride", "building", "city"],
  },
  {
    word: "rain",
    clues: ["water", "cloud", "wet", "drop", "sky", "storm", "umbrella", "coat", "cold", "weather", "puddle", "dark", "wind", "gray", "fall", "sound", "street", "fresh", "nature", "season"],
  },
  {
    word: "bread",
    clues: ["food", "bake", "eat", "soft", "slice", "butter", "breakfast", "flour", "fresh", "warm", "sandwich", "loaf", "shop", "crust", "brown", "white", "kitchen", "simple", "snack", "toast"],
  },
  {
    word: "tree",
    clues: ["wood", "green", "leaf", "nature", "plant", "tall", "forest", "shade", "branch", "root", "bark", "grow", "life", "oxygen", "bird", "fruit", "season", "flower", "soil", "natural"],
  },
  {
    word: "bridge",
    clues: ["river", "cross", "road", "car", "build", "long", "steel", "walk", "city", "connect", "travel", "traffic", "support", "structure", "public", "arch", "strong", "path", "column", "over"],
  },
  {
    word: "chicken",
    clues: ["bird", "food", "animal", "farm", "egg", "feather", "white", "cook", "meat", "kitchen", "sound", "claw", "brown", "fresh", "eat", "market", "animal", "yard", "wing", "small"],
  },
  {
    word: "pillow",
    clues: ["sleep", "soft", "bed", "rest", "night", "room", "white", "cover", "dream", "comfort", "cotton", "relax", "blanket", "head", "home", "fluffy", "warm", "square", "cushion", "fabric"],
  },
  {
    word: "bus",
    clues: ["ride", "travel", "school", "yellow", "seat", "driver", "road", "public", "big", "stop", "ticket", "city", "move", "slow", "street", "turn", "line", "window", "sound", "transport"],
  },
  {
    word: "lion",
    clues: ["animal", "big", "wild", "forest", "king", "mane", "roar", "hunt", "strong", "Africa", "cat", "yellow", "teeth", "power", "nature", "cage", "zoo", "fast", "tail", "brave"],
  },
  {
    word: "pizza",
    clues: ["food", "cheese", "slice", "hot", "tomato", "bake", "kitchen", "oven", "round", "dough", "restaurant", "topping", "pepperoni", "meal", "box", "delivery", "crust", "sauce", "bread", "favorite"],
  },
  {
    word: "ocean",
    clues: ["water", "blue", "deep", "wave", "fish", "salt", "boat", "ship", "big", "wide", "sand", "swim", "coral", "sea", "island", "storm", "foam", "shore", "tide", "nature"],
  },
  {
    word: "clock",
    clues: ["time", "round", "number", "tick", "minute", "hour", "wall", "watch", "alarm", "move", "hand", "circle", "metal", "sound", "table", "digital", "screen", "pointer", "wake", "office"],
  },
  {
    word: "hospital",
    clues: ["doctor", "patient", "health", "nurse", "room", "care", "medicine", "help", "injury", "sick", "white", "bed", "ambulance", "check", "treat", "building", "emergency", "clinic", "heal", "staff"],
  },
  {
    word: "table",
    clues: ["wood", "dining", "eat", "room", "chair", "flat", "surface", "four legs", "object", "place", "kitchen", "round", "family", "meal", "hold", "cup", "plate", "home", "study", "desk"],
  },
  {
    word: "candle",
    clues: ["light", "wax", "fire", "flame", "bright", "burn", "smell", "romantic", "soft", "yellow", "wax", "stick", "dark", "night", "small", "warm", "home", "melt", "glow", "table"],
  },
  {
    word: "horse",
    clues: ["animal", "farm", "ride", "fast", "brown", "strong", "tail", "field", "run", "hooves", "grass", "race", "wild", "road", "sound", "stable", "long", "hair", "white", "big"],
  },
  {
    word: "lamp",
    clues: ["light", "bright", "room", "electric", "night", "table", "stand", "switch", "shade", "bulb", "home", "warm", "yellow", "read", "corner", "wire", "energy", "glow", "object", "small"],
  },
  {
    word: "train",
    clues: ["rail", "track", "station", "travel", "long", "fast", "seat", "ticket", "engine", "move", "sound", "door", "crowd", "ride", "window", "cargo", "platform", "schedule", "metal", "public"],
  },
  {
    word: "baby",
    clues: ["small", "cute", "cry", "milk", "sleep", "soft", "diaper", "family", "young", "mother", "care", "blanket", "tiny", "laugh", "carry", "play", "love", "warm", "new", "born"],
  },
  {
    word: "shirt",
    clues: ["cloth", "wear", "body", "button", "color", "fabric", "white", "blue", "pocket", "fold", "clean", "collar", "long", "short", "dry", "iron", "pattern", "office", "casual", "dress"],
  },
  {
    word: "moon",
    clues: ["night", "sky", "round", "bright", "white", "space", "dark", "shine", "crater", "orbit", "star", "planet", "cold", "light", "big", "blue", "move", "circle", "glow", "silent"],
  },
  {
    word: "bed",
    clues: ["sleep", "night", "rest", "room", "pillow", "sheet", "blanket", "soft", "relax", "dream", "home", "mattress", "comfort", "warm", "wood", "lay", "tired", "morning", "night", "furniture"],
  },
  {
    word: "soap",
    clues: ["wash", "clean", "bath", "foam", "water", "sink", "smell", "soft", "hand", "body", "shower", "white", "liquid", "bubble", "bright", "fresh", "skin", "touch", "house", "hygiene"],
  },
  {
    word: "cup",
    clues: ["drink", "water", "coffee", "tea", "table", "kitchen", "glass", "handle", "round", "white", "hot", "liquid", "plate", "clean", "pour", "hold", "small", "favorite", "ceramic", "break"],
  },
  {
    word: "car",
    clues: ["drive", "road", "engine", "wheel", "door", "seat", "travel", "gas", "key", "fast", "move", "traffic", "city", "sound", "brake", "light", "window", "black", "tire", "travel"],
  },
  {
    word: "socks",
    clues: ["foot", "wear", "warm", "soft", "pair", "shoe", "color", "fabric", "clean", "wash", "dry", "wardrobe", "sport", "long", "short", "white", "black", "cover", "home", "comfortable"],
  },
  {
    word: "juice",
    clues: ["drink", "fruit", "sweet", "cold", "glass", "fresh", "orange", "apple", "cup", "mix", "water", "healthy", "ice", "pour", "breakfast", "smooth", "tropical", "taste", "favorite", "liquid"],
  },
  {
    word: "cat",
    clues: ["animal", "pet", "fur", "tail", "cute", "meow", "home", "soft", "sleep", "small", "mouse", "play", "happy", "food", "look", "jump", "clean", "white", "black", "lovely"],
  },
  {
    word: "key",
    clues: ["door", "open", "lock", "metal", "small", "ring", "hold", "silver", "pocket", "room", "house", "car", "shape", "turn", "sound", "carry", "important", "safe", "keychain", "find"],
  },
  {
    word: "ice",
    clues: ["cold", "freeze", "water", "hard", "drink", "cube", "snow", "white", "glass", "melt", "winter", "cold", "fresh", "clear", "smooth", "solid", "cool", "cup", "frozen", "touch"],
  },

  {
    word: "city",
    clues: ["building", "busy", "street", "car", "people", "work", "light", "road", "crowd", "store", "public", "noise", "traffic", "park", "office", "large", "town", "area", "place", "urban"],
  },
  {
    word: "sand",
    clues: ["beach", "tiny", "grain", "brown", "hot", "foot", "sea", "warm", "play", "soft", "sun", "water", "dry", "wind", "ground", "nature", "light", "shore", "desert", "vacation"],
  },
  {
    word: "chair",
    clues: ["sit", "furniture", "wood", "leg", "table", "home", "class", "room", "seat", "office", "comfort", "design", "fabric", "back", "rest", "brown", "place", "object", "living", "simple"],
  },
  {
    word: "bird",
    clues: ["animal", "fly", "wing", "sky", "small", "tree", "nest", "egg", "blue", "song", "sound", "feather", "forest", "nature", "air", "branch", "wild", "food", "light", "morning"],
  },
  {
    word: "paper",
    clues: ["write", "white", "thin", "book", "school", "note", "cut", "page", "print", "fold", "class", "draw", "copy", "office", "pen", "desk", "flat", "file", "document", "sheet"],
  },
  {
    word: "milk",
    clues: ["drink", "white", "cow", "glass", "cold", "breakfast", "healthy", "food", "cup", "store", "sweet", "pour", "kids", "kitchen", "fresh", "carton", "shake", "smooth", "calcium", "nutritious"],
  },
  {
    word: "phone",
    clues: ["call", "talk", "mobile", "screen", "ring", "message", "device", "pocket", "internet", "sound", "hold", "app", "camera", "small", "vibrate", "light", "charge", "number", "dial", "contact"],
  },
  {
    word: "hat",
    clues: ["wear", "head", "sun", "cap", "shade", "fashion", "clothes", "cover", "round", "fabric", "style", "protect", "sport", "winter", "summer", "fit", "color", "casual", "coat", "dress"],
  },
  {
    word: "road",
    clues: ["car", "street", "drive", "path", "travel", "asphalt", "line", "truck", "bike", "walk", "traffic", "city", "way", "route", "long", "turn", "crossing", "bridge", "direction", "public"],
  },
  {
    word: "boat",
    clues: ["water", "sea", "lake", "ride", "ship", "travel", "sail", "wave", "fish", "engine", "blue", "dock", "anchor", "wood", "ocean", "river", "float", "wind", "coast", "harbor"],
  },
  {
    word: "map",
    clues: ["country", "place", "travel", "find", "guide", "paper", "road", "direction", "world", "location", "route", "city", "mark", "symbol", "legend", "area", "tourist", "read", "plan", "draw"],
  },
  {
    word: "cupboard",
    clues: ["kitchen", "store", "plate", "dish", "wood", "door", "open", "close", "shelf", "room", "home", "food", "bowl", "glass", "item", "hold", "inside", "clean", "organize", "wall"],
  },
  {
    word: "egg",
    clues: ["food", "breakfast", "white", "yellow", "shell", "cook", "boil", "fry", "chicken", "protein", "kitchen", "pan", "shape", "round", "break", "meal", "fresh", "small", "crack", "brown"],
  },
  {
    word: "knife",
    clues: ["cut", "sharp", "kitchen", "metal", "food", "cook", "danger", "point", "slice", "tool", "handle", "hold", "clean", "table", "object", "silver", "long", "thin", "dangerous", "meal"],
  },
  {
    word: "shoe",
    clues: ["foot", "walk", "pair", "wear", "lace", "sport", "run", "leather", "black", "white", "fashion", "comfort", "wet", "clean", "dirty", "floor", "sole", "fit", "step", "outdoor"],
  },
  {
    word: "riverbank",
    clues: ["water", "edge", "grass", "fish", "walk", "nature", "tree", "fresh", "stone", "path", "wet", "calm", "cold", "sit", "view", "relax", "animal", "green", "sand", "shore"],
  },
  {
    word: "forest",
    clues: ["tree", "green", "nature", "animal", "leaf", "wood", "wild", "dark", "fresh", "air", "quiet", "cold", "bird", "soil", "branch", "path", "sunlight", "shadow", "flower", "natural"],
  },
  {
    word: "mirror",
    clues: ["glass", "look", "face", "reflect", "clean", "wall", "bathroom", "home", "bright", "shine", "smooth", "square", "round", "frame", "object", "image", "room", "stand", "silver", "light"],
  },
  {
    word: "rainbow",
    clues: ["color", "sky", "rain", "sun", "light", "arch", "beauty", "bright", "blue", "red", "yellow", "green", "purple", "curve", "cloud", "after rain", "nature", "look", "pretty", "wide"],
  },
  {
    word: "truck",
    clues: ["road", "big", "heavy", "cargo", "load", "driver", "engine", "wheel", "long", "travel", "sound", "move", "company", "delivery", "job", "fuel", "truck stop", "highway", "transport", "metal"],
  },
  {
    word: "banana",
    clues: ["yellow", "fruit", "sweet", "peel", "soft", "long", "tree", "tropical", "snack", "fresh", "food", "healthy", "smooth", "bunch", "curve", "seedless", "easy", "light", "lunch", "favorite"],
  },
  {
    word: "glasses",
    clues: ["eye", "see", "lens", "wear", "frame", "clear", "vision", "reading", "face", "plastic", "metal", "help", "focus", "object", "round", "square", "clean", "protect", "optical", "look"],
  },
  {
    word: "blanket",
    clues: ["sleep", "warm", "bed", "soft", "night", "cover", "winter", "room", "fabric", "fold", "cozy", "home", "cold", "comfort", "wrap", "relax", "rest", "big", "material", "morning"],
  },
  {
    word: "wallet",
    clues: ["money", "cash", "card", "pocket", "small", "leather", "bag", "hold", "ID", "safe", "keep", "coin", "black", "brown", "open", "close", "important", "item", "daily", "carry"],
  },
  {
    word: "cloud",
    clues: ["sky", "white", "soft", "water", "air", "blue", "float", "shape", "rain", "storm", "gray", "look", "shadow", "light", "dark", "big", "small", "day", "weather", "nature"],
  },
  {
    word: "butterfly",
    clues: ["wing", "color", "fly", "flower", "garden", "soft", "insect", "nature", "beautiful", "light", "air", "blue", "yellow", "pink", "tiny", "leaf", "forest", "day", "animal", "spring"],
  },
  {
    word: "candy",
    clues: ["sweet", "color", "small", "sugar", "kids", "food", "snack", "wrapper", "taste", "store", "round", "soft", "hard", "chew", "treat", "fun", "party", "box", "bag", "delicious"],
  },
  {
    word: "moonlight",
    clues: ["night", "bright", "sky", "shine", "white", "soft", "shadow", "quiet", "peace", "light", "dark", "nature", "look", "calm", "cool", "evening", "silver", "glow", "silent", "night air"],
  },
  {
    word: "farm",
    clues: ["animal", "cow", "chicken", "field", "food", "land", "plant", "grow", "green", "rice", "corn", "farmer", "nature", "sun", "tree", "rural", "work", "tractor", "soil", "vegetable"],
  },
  {
    word: "king",
    clues: ["royal", "crown", "kingdom", "palace", "rule", "power", "gold", "leader", "throne", "robe", "castle", "guard", "rich", "people", "ancient", "history", "story", "knight", "land", "man"],
  },
  {
    word: "queen",
    clues: ["royal", "crown", "palace", "rule", "woman", "rich", "beautiful", "dress", "castle", "guard", "gold", "story", "leader", "ancient", "voice", "royalty", "throne", "lady", "famous", "king"],
  },
  {
    word: "fire",
    clues: ["hot", "burn", "red", "orange", "heat", "danger", "camp", "forest", "smoke", "light", "cook", "warm", "flame", "wood", "bright", "spark", "dry", "energy", "disaster", "emergency"],
  },
  {
    word: "ice cream",
    clues: ["cold", "sweet", "food", "dessert", "cone", "cup", "cream", "milk", "sugar", "flavor", "chocolate", "vanilla", "cold", "eat", "kids", "favorite", "treat", "store", "frozen", "summer"],
  },
  {
    word: "butter",
    clues: ["yellow", "food", "bread", "milk", "spread", "soft", "melt", "kitchen", "cook", "taste", "knife", "pan", "bake", "fat", "block", "salted", "breakfast", "cold", "package", "smooth"],
  },
  {
    word: "camera",
    clues: ["photo", "picture", "lens", "shoot", "flash", "memory", "capture", "focus", "device", "screen", "hand", "travel", "light", "record", "click", "mode", "digital", "zoom", "tool", "trip"],
  },
  {
    word: "garden",
    clues: ["flower", "plant", "green", "soil", "water", "tree", "grow", "nature", "sun", "fresh", "grass", "leaf", "butterfly", "garden tools", "fruit", "vegetable", "insect", "beautiful", "space", "outdoor"],
  },
  {
    word: "pencil case",
    clues: ["school", "pencil", "pen", "small", "zipper", "bag", "class", "desk", "organize", "carry", "item", "student", "color", "object", "work", "stationery", "eraser", "holder", "fabric", "daily"],
  },
  {
    word: "robot",
    clues: ["machine", "metal", "tech", "future", "program", "move", "arm", "computer", "electric", "build", "AI", "tool", "engineer", "science", "work", "voice", "sensor", "smart", "task", "modern"],
  },
  {
    word: "tiger",
    clues: ["animal", "striped", "orange", "big", "wild", "strong", "teeth", "forest", "hunt", "cat", "danger", "fast", "claw", "jungle", "Asia", "roar", "nature", "predator", "tail", "power"],
  },
  {
    word: "cookie",
    clues: ["sweet", "bake", "chocolate", "snack", "round", "small", "kids", "flour", "sugar", "oven", "brown", "crunchy", "soft", "dessert", "treat", "homemade", "kitchen", "break", "box", "favorite"],
  },
  {
    word: "coconut",
    clues: ["brown", "hard", "tropical", "tree", "fruit", "milk", "white", "sweet", "round", "water", "beach", "island", "shell", "break", "food", "fresh", "summer", "green", "fiber", "oil"],
  },
  {
    word: "whale",
    clues: ["ocean", "big", "blue", "fish", "water", "deep", "tail", "splash", "mammal", "giant", "swim", "sound", "wave", "sea", "cold", "long", "wild", "nature", "animal", "breath"],
  },
  {
    word: "blanket",
    clues: ["warm", "soft", "bed", "sleep", "cover", "night", "fabric", "cozy", "winter", "cold", "comfort", "home", "fold", "thick", "snuggle", "room", "rest", "cushion", "relax", "warmth"],
  },
  {
    word: "garden",
    clues: ["flowers", "plants", "soil", "green", "water", "sunlight", "grow", "trees", "grass", "leaf", "nature", "outdoor", "fresh", "seed", "insects", "beauty", "fruit", "path", "bush", "tools"],
  },
  {
    word: "teacher",
    clues: ["school", "class", "lesson", "students", "education", "book", "write", "explain", "subject", "test", "help", "guide", "knowledge", "board", "homework", "grade", "desk", "work", "classroom", "learning"],
  },
  {
    word: "mountain",
    clues: ["high", "rock", "peak", "hike", "nature", "snow", "cold", "climb", "adventure", "wind", "forest", "trail", "steep", "wild", "landscape", "blue", "ridge", "sky", "tall", "view"],
  },
  {
    word: "window",
    clues: ["glass", "frame", "room", "open", "close", "air", "light", "sun", "house", "view", "curtain", "wall", "clean", "inside", "outside", "square", "look", "transparent", "home", "fresh"],
  },
  {
    word: "pencil",
    clues: ["write", "draw", "eraser", "lead", "school", "sharpener", "paper", "sketch", "note", "yellow", "wood", "tip", "line", "art", "class", "tool", "hand", "simple", "student", "item"],
  },
  {
    word: "rainbow",
    clues: ["color", "sky", "rain", "sun", "arc", "beautiful", "bright", "nature", "weather", "light", "curve", "rare", "blue", "yellow", "red", "green", "shine", "after rain", "look", "wonder"],
  },
  {
    word: "bottle",
    clues: ["water", "drink", "plastic", "cap", "glass", "hold", "carry", "liquid", "container", "pour", "cold", "refill", "shape", "clear", "use", "cup", "table", "label", "blue", "store"],
  },
  {
    word: "rabbit",
    clues: ["animal", "ears", "jump", "cute", "fur", "white", "carrot", "fast", "small", "pet", "grass", "burrow", "soft", "tail", "nature", "forest", "hop", "food", "cage", "wild"],
  },
  {
    word: "camera",
    clues: ["photo", "shoot", "lens", "flash", "capture", "memory", "image", "picture", "device", "travel", "record", "focus", "button", "video", "screen", "zoom", "hold", "digital", "color", "moment"],
  },
  {
    word: "rocket",
    clues: ["space", "launch", "sky", "astronaut", "engine", "fire", "speed", "travel", "moon", "planet", "mission", "explore", "flight", "fuel", "noise", "metal", "technology", "lift", "air", "satellite"],
  },
  {
    word: "market",
    clues: ["buy", "sell", "food", "people", "shop", "fruit", "vegetable", "vendor", "money", "crowd", "place", "street", "table", "fresh", "bus", "bags", "meat", "open", "noise", "stand"],
  },
  {
    word: "doctor",
    clues: ["hospital", "medicine", "patient", "health", "check", "nurse", "clinic", "care", "sick", "treat", "white coat", "stethoscope", "cure", "help", "room", "desk", "exam", "work", "heal", "science"],
  },
  {
    word: "bridge",
    clues: ["river", "cross", "road", "car", "structure", "build", "travel", "steel", "long", "connect", "walk", "arch", "city", "traffic", "water", "support", "big", "safe", "high", "view"],
  },
  {
    word: "turtle",
    clues: ["shell", "slow", "animal", "green", "water", "swim", "walk", "beach", "egg", "nature", "cute", "sea", "ocean", "hard", "reptile", "sand", "life", "small", "old", "brown"],
  },
  {
    word: "candle",
    clues: ["light", "wax", "flame", "burn", "smell", "room", "night", "bright", "hot", "match", "stick", "melt", "table", "white", "soft", "warm", "romantic", "tiny", "yellow", "peace"],
  },
  {
    word: "wallet",
    clues: ["money", "pocket", "card", "cash", "leather", "small", "hold", "item", "bag", "keep", "safe", "carry", "id", "photo", "brown", "simple", "gift", "open", "close", "thing"],
  },
  {
    word: "planet",
    clues: ["space", "round", "sun", "orbit", "blue", "earth", "moon", "science", "astronomy", "gas", "rock", "big", "solar", "sky", "star", "gravity", "world", "life", "dark", "light"],
  },
  {
    word: "bag",
    clues: ["carry", "item", "school", "strap", "zipper", "pocket", "thing", "shoulder", "store", "cloth", "travel", "book", "water", "bagpack", "student", "small", "big", "hand", "simple", "thing"],
  },
  {
    word: "soap",
    clues: ["clean", "bath", "foam", "wash", "hand", "water", "shower", "smell", "fresh", "skin", "white", "bar", "liquid", "soft", "sink", "bathroom", "use", "daily", "health", "home"],
  },
  {
    word: "violin",
    clues: ["music", "string", "bow", "play", "sound", "instrument", "classic", "tone", "concert", "wood", "practice", "note", "melody", "brown", "shape", "teacher", "song", "art", "beautiful", "stage"],
  },
  {
    word: "queen",
    clues: ["woman", "royal", "king", "crown", "palace", "leader", "power", "rule", "gold", "dress", "beautiful", "kingdom", "chair", "queen bee", "family", "symbol", "strong", "lady", "noble", "respect"],
  },
  {
    word: "circle",
    clues: ["round", "shape", "line", "draw", "compass", "math", "paper", "wheel", "spin", "closed", "simple", "figure", "curve", "ball", "loop", "ring", "point", "smooth", "form", "flat"],
  },
  {
    word: "knife",
    clues: ["cut", "sharp", "kitchen", "metal", "tool", "cook", "food", "slice", "danger", "handle", "table", "thin", "silver", "use", "wash", "small", "big", "point", "cutting", "chop"],
  },
  {
    word: "castle",
    clues: ["king", "queen", "stone", "tower", "wall", "bridge", "old", "history", "battle", "gate", "royal", "armour", "knight", "moat", "fantasy", "big", "strong", "flag", "past", "legend"],
  },
  {
    word: "train",
    clues: ["rail", "track", "station", "travel", "speed", "long", "carriage", "whistle", "engine", "ticket", "window", "chair", "stop", "move", "transport", "line", "metal", "platform", "sound", "journey"],
  },
  {
    word: "honey",
    clues: ["sweet", "bee", "yellow", "food", "jar", "thick", "flower", "sticky", "natural", "spread", "bread", "taste", "gold", "liquid", "healthy", "nectar", "create", "insect", "delicious", "smooth"],
  },
  {
    word: "monkey",
    clues: ["animal", "tree", "banana", "jump", "funny", "forest", "tail", "cute", "wild", "brown", "fast", "hands", "feet", "smart", "swing", "branch", "play", "noise", "fruit", "jungle"],
  },
  {
    word: "bread",
    clues: ["food", "eat", "slice", "toast", "breakfast", "loaf", "soft", "flour", "bake", "kitchen", "butter", "jam", "white", "brown", "fresh", "oven", "warm", "table", "plate", "meal"],
  },
  {
    word: "clock",
    clues: ["time", "tick", "hour", "minute", "second", "round", "wall", "watch", "hand", "alarm", "number", "sound", "wake", "bed", "table", "small", "battery", "read", "look", "ring"],
  },
  {
    word: "river",
    clues: ["water", "flow", "blue", "nature", "fish", "boat", "bridge", "clean", "fresh", "long", "bank", "tree", "wild", "wave", "cool", "deep", "swim", "current", "animal", "path"],
  },
  {
    word: "shoe",
    clues: ["foot", "walk", "wear", "pair", "lace", "style", "leather", "sport", "run", "comfort", "size", "sole", "toe", "color", "shop", "clean", "fit", "fashion", "brown", "black"],
  },
  {
    word: "leaf",
    clues: ["green", "tree", "plant", "nature", "fall", "shape", "thin", "grow", "wind", "branch", "forest", "life", "sun", "fresh", "soft", "tiny", "stem", "garden", "yellow", "brown"],
  },
  {
    word: "milk",
    clues: ["white", "drink", "cow", "glass", "calcium", "strong", "bone", "healthy", "cold", "breakfast", "food", "fresh", "sweet", "liquid", "pour", "table", "cup", "kid", "daily", "smooth"],
  },
  {
    word: "crown",
    clues: ["king", "queen", "gold", "head", "royal", "power", "rule", "beautiful", "jewel", "circle", "bright", "symbol", "shine", "royalty", "wear", "top", "round", "metal", "rich", "heritage"],
  },
  {
    word: "robot",
    clues: ["machine", "metal", "technology", "future", "arm", "move", "work", "program", "electric", "tool", "task", "science", "silver", "voice", "smart", "help", "button", "eye", "shape", "function"],
  },
  {
    word: "forest",
    clues: ["tree", "green", "wild", "nature", "animal", "wood", "plant", "shadow", "leaf", "dark", "bird", "quiet", "fresh", "road", "walk", "deep", "soil", "mushroom", "life", "wind"],
  },
  {
    word: "sugar",
    clues: ["sweet", "white", "food", "tea", "drink", "cook", "small", "grain", "kitchen", "taste", "cup", "spoon", "mix", "powder", "bottle", "sweeten", "add", "cake", "daily", "eat"],
  },
  {
    word: "jacket",
    clues: ["clothes", "wear", "warm", "zip", "winter", "coat", "pocket", "style", "fashion", "outside", "cold", "thick", "hood", "color", "fabric", "brown", "black", "daily", "rain", "wind"],
  },
  {
    word: "carpet",
    clues: ["floor", "soft", "home", "room", "fabric", "clean", "vacuum", "pattern", "color", "thick", "warm", "walk", "smooth", "big", "roll", "decorate", "house", "style", "shape", "design"],
  },
  {
    word: "cup",
    clues: ["drink", "coffee", "tea", "small", "handle", "water", "kitchen", "table", "hold", "liquid", "white", "glass", "ceramic", "hot", "milk", "cold", "sip", "use", "wash", "daily"],
  },
  {
    word: "duck",
    clues: ["bird", "water", "yellow", "swim", "lake", "quack", "animal", "wing", "feather", "cute", "walk", "beak", "farm", "egg", "small", "pond", "nature", "food", "sound", "family"],
  },
  {
    word: "star",
    clues: ["sky", "night", "shine", "light", "space", "bright", "twinkle", "small", "far", "galaxy", "moon", "sparkle", "glow", "dark", "planet", "blue", "yellow", "white", "high", "beautiful"],
  },
  {
    word: "banana",
    clues: ["fruit", "yellow", "sweet", "soft", "peel", "long", "tree", "bunch", "food", "snack", "fresh", "monkey", "smooth", "ripe", "breakfast", "healthy", "nature", "tropical", "green", "taste"],
  },
  {
    word: "shirt",
    clues: ["clothes", "wear", "button", "collar", "white", "blue", "fabric", "wash", "iron", "style", "look", "fashion", "school", "office", "simple", "short", "long", "design", "body", "daily"],
  },
  {
    word: "glove",
    clues: ["hand", "winter", "warm", "wear", "cold", "clothes", "pair", "soft", "fabric", "snow", "finger", "protect", "sport", "work", "hold", "fit", "black", "brown", "outdoor", "thick"],
  },
  {
    word: "airplane",
    clues: ["fly", "sky", "travel", "wings", "engine", "airport", "cloud", "pilot", "seat", "fast", "ticket", "trip", "window", "high", "air", "safety", "crew", "bag", "plane", "journey"],
  },
  {
    word: "blanket",
    clues: ["warm", "soft", "bed", "sleep", "cover", "night", "fabric", "cozy", "winter", "cold", "comfort", "home", "fold", "thick", "snuggle", "room", "rest", "cushion", "relax", "warmth"],
  },
  {
    word: "garden",
    clues: ["flowers", "plants", "soil", "green", "water", "sunlight", "grow", "trees", "grass", "leaf", "nature", "outdoor", "fresh", "seed", "insects", "beauty", "fruit", "path", "bush", "tools"],
  },
  {
    word: "teacher",
    clues: ["school", "class", "lesson", "students", "education", "book", "write", "explain", "subject", "test", "help", "guide", "knowledge", "board", "homework", "grade", "desk", "work", "classroom", "learning"],
  },
  {
    word: "mountain",
    clues: ["high", "rock", "peak", "hike", "nature", "snow", "cold", "climb", "adventure", "wind", "forest", "trail", "steep", "wild", "landscape", "blue", "ridge", "sky", "tall", "view"],
  },
  {
    word: "window",
    clues: ["glass", "frame", "room", "open", "close", "air", "light", "sun", "house", "view", "curtain", "wall", "clean", "inside", "outside", "square", "look", "transparent", "home", "fresh"],
  },
  {
    word: "pencil",
    clues: ["write", "draw", "eraser", "lead", "school", "sharpener", "paper", "sketch", "note", "yellow", "wood", "tip", "line", "art", "class", "tool", "hand", "simple", "student", "item"],
  },
  {
    word: "rainbow",
    clues: ["color", "sky", "rain", "sun", "arc", "beautiful", "bright", "nature", "weather", "light", "curve", "rare", "blue", "yellow", "red", "green", "shine", "after rain", "look", "wonder"],
  },
  {
    word: "bottle",
    clues: ["water", "drink", "plastic", "cap", "glass", "hold", "carry", "liquid", "container", "pour", "cold", "refill", "shape", "clear", "use", "cup", "table", "label", "blue", "store"],
  },
  {
    word: "rabbit",
    clues: ["animal", "ears", "jump", "cute", "fur", "white", "carrot", "fast", "small", "pet", "grass", "burrow", "soft", "tail", "nature", "forest", "hop", "food", "cage", "wild"],
  },
  {
    word: "camera",
    clues: ["photo", "shoot", "lens", "flash", "capture", "memory", "image", "picture", "device", "travel", "record", "focus", "button", "video", "screen", "zoom", "hold", "digital", "color", "moment"],
  },
  {
    word: "rocket",
    clues: ["space", "launch", "sky", "astronaut", "engine", "fire", "speed", "travel", "moon", "planet", "mission", "explore", "flight", "fuel", "noise", "metal", "technology", "lift", "air", "satellite"],
  },
  {
    word: "market",
    clues: ["buy", "sell", "food", "people", "shop", "fruit", "vegetable", "vendor", "money", "crowd", "place", "street", "table", "fresh", "bus", "bags", "meat", "open", "noise", "stand"],
  },
  {
    word: "doctor",
    clues: ["hospital", "medicine", "patient", "health", "check", "nurse", "clinic", "care", "sick", "treat", "white coat", "stethoscope", "cure", "help", "room", "desk", "exam", "work", "heal", "science"],
  },
  {
    word: "bridge",
    clues: ["river", "cross", "road", "car", "structure", "build", "travel", "steel", "long", "connect", "walk", "arch", "city", "traffic", "water", "support", "big", "safe", "high", "view"],
  },
  {
    word: "turtle",
    clues: ["shell", "slow", "animal", "green", "water", "swim", "walk", "beach", "egg", "nature", "cute", "sea", "ocean", "hard", "reptile", "sand", "life", "small", "old", "brown"],
  },
  {
    word: "candle",
    clues: ["light", "wax", "flame", "burn", "smell", "room", "night", "bright", "hot", "match", "stick", "melt", "table", "white", "soft", "warm", "romantic", "tiny", "yellow", "peace"],
  },
  {
    word: "wallet",
    clues: ["money", "pocket", "card", "cash", "leather", "small", "hold", "item", "bag", "keep", "safe", "carry", "id", "photo", "brown", "simple", "gift", "open", "close", "thing"],
  },
  {
    word: "planet",
    clues: ["space", "round", "sun", "orbit", "blue", "earth", "moon", "science", "astronomy", "gas", "rock", "big", "solar", "sky", "star", "gravity", "world", "life", "dark", "light"],
  },
  {
    word: "bag",
    clues: ["carry", "item", "school", "strap", "zipper", "pocket", "thing", "shoulder", "store", "cloth", "travel", "book", "water", "bagpack", "student", "small", "big", "hand", "simple", "thing"],
  },
  {
    word: "soap",
    clues: ["clean", "bath", "foam", "wash", "hand", "water", "shower", "smell", "fresh", "skin", "white", "bar", "liquid", "soft", "sink", "bathroom", "use", "daily", "health", "home"],
  },
  {
    word: "violin",
    clues: ["music", "string", "bow", "play", "sound", "instrument", "classic", "tone", "concert", "wood", "practice", "note", "melody", "brown", "shape", "teacher", "song", "art", "beautiful", "stage"],
  },
  {
    word: "queen",
    clues: ["woman", "royal", "king", "crown", "palace", "leader", "power", "rule", "gold", "dress", "beautiful", "kingdom", "chair", "queen bee", "family", "symbol", "strong", "lady", "noble", "respect"],
  },
  {
    word: "circle",
    clues: ["round", "shape", "line", "draw", "compass", "math", "paper", "wheel", "spin", "closed", "simple", "figure", "curve", "ball", "loop", "ring", "point", "smooth", "form", "flat"],
  },
  {
    word: "knife",
    clues: ["cut", "sharp", "kitchen", "metal", "tool", "cook", "food", "slice", "danger", "handle", "table", "thin", "silver", "use", "wash", "small", "big", "point", "cutting", "chop"],
  },
  {
    word: "castle",
    clues: ["king", "queen", "stone", "tower", "wall", "bridge", "old", "history", "battle", "gate", "royal", "armour", "knight", "moat", "fantasy", "big", "strong", "flag", "past", "legend"],
  },
  {
    word: "train",
    clues: ["rail", "track", "station", "travel", "speed", "long", "carriage", "whistle", "engine", "ticket", "window", "chair", "stop", "move", "transport", "line", "metal", "platform", "sound", "journey"],
  },
  {
    word: "honey",
    clues: ["sweet", "bee", "yellow", "food", "jar", "thick", "flower", "sticky", "natural", "spread", "bread", "taste", "gold", "liquid", "healthy", "nectar", "create", "insect", "delicious", "smooth"],
  },
  {
    word: "monkey",
    clues: ["animal", "tree", "banana", "jump", "funny", "forest", "tail", "cute", "wild", "brown", "fast", "hands", "feet", "smart", "swing", "branch", "play", "noise", "fruit", "jungle"],
  },
  {
    word: "bread",
    clues: ["food", "eat", "slice", "toast", "breakfast", "loaf", "soft", "flour", "bake", "kitchen", "butter", "jam", "white", "brown", "fresh", "oven", "warm", "table", "plate", "meal"],
  },
  {
    word: "clock",
    clues: ["time", "tick", "hour", "minute", "second", "round", "wall", "watch", "hand", "alarm", "number", "sound", "wake", "bed", "table", "small", "battery", "read", "look", "ring"],
  },
  {
    word: "river",
    clues: ["water", "flow", "blue", "nature", "fish", "boat", "bridge", "clean", "fresh", "long", "bank", "tree", "wild", "wave", "cool", "deep", "swim", "current", "animal", "path"],
  },
  {
    word: "shoe",
    clues: ["foot", "walk", "wear", "pair", "lace", "style", "leather", "sport", "run", "comfort", "size", "sole", "toe", "color", "shop", "clean", "fit", "fashion", "brown", "black"],
  },
  {
    word: "leaf",
    clues: ["green", "tree", "plant", "nature", "fall", "shape", "thin", "grow", "wind", "branch", "forest", "life", "sun", "fresh", "soft", "tiny", "stem", "garden", "yellow", "brown"],
  },
  {
    word: "milk",
    clues: ["white", "drink", "cow", "glass", "calcium", "strong", "bone", "healthy", "cold", "breakfast", "food", "fresh", "sweet", "liquid", "pour", "table", "cup", "kid", "daily", "smooth"],
  },
  {
    word: "crown",
    clues: ["king", "queen", "gold", "head", "royal", "power", "rule", "beautiful", "jewel", "circle", "bright", "symbol", "shine", "royalty", "wear", "top", "round", "metal", "rich", "heritage"],
  },
  {
    word: "robot",
    clues: ["machine", "metal", "technology", "future", "arm", "move", "work", "program", "electric", "tool", "task", "science", "silver", "voice", "smart", "help", "button", "eye", "shape", "function"],
  },
  {
    word: "forest",
    clues: ["tree", "green", "wild", "nature", "animal", "wood", "plant", "shadow", "leaf", "dark", "bird", "quiet", "fresh", "road", "walk", "deep", "soil", "mushroom", "life", "wind"],
  },
  {
    word: "sugar",
    clues: ["sweet", "white", "food", "tea", "drink", "cook", "small", "grain", "kitchen", "taste", "cup", "spoon", "mix", "powder", "bottle", "sweeten", "add", "cake", "daily", "eat"],
  },
  {
    word: "jacket",
    clues: ["clothes", "wear", "warm", "zip", "winter", "coat", "pocket", "style", "fashion", "outside", "cold", "thick", "hood", "color", "fabric", "brown", "black", "daily", "rain", "wind"],
  },
  {
    word: "carpet",
    clues: ["floor", "soft", "home", "room", "fabric", "clean", "vacuum", "pattern", "color", "thick", "warm", "walk", "smooth", "big", "roll", "decorate", "house", "style", "shape", "design"],
  },
  {
    word: "cup",
    clues: ["drink", "coffee", "tea", "small", "handle", "water", "kitchen", "table", "hold", "liquid", "white", "glass", "ceramic", "hot", "milk", "cold", "sip", "use", "wash", "daily"],
  },
  {
    word: "duck",
    clues: ["bird", "water", "yellow", "swim", "lake", "quack", "animal", "wing", "feather", "cute", "walk", "beak", "farm", "egg", "small", "pond", "nature", "food", "sound", "family"],
  },
  {
    word: "star",
    clues: ["sky", "night", "shine", "light", "space", "bright", "twinkle", "small", "far", "galaxy", "moon", "sparkle", "glow", "dark", "planet", "blue", "yellow", "white", "high", "beautiful"],
  },
  {
    word: "banana",
    clues: ["fruit", "yellow", "sweet", "soft", "peel", "long", "tree", "bunch", "food", "snack", "fresh", "monkey", "smooth", "ripe", "breakfast", "healthy", "nature", "tropical", "green", "taste"],
  },
  {
    word: "shirt",
    clues: ["clothes", "wear", "button", "collar", "white", "blue", "fabric", "wash", "iron", "style", "look", "fashion", "school", "office", "simple", "short", "long", "design", "body", "daily"],
  },
  {
    word: "glove",
    clues: ["hand", "winter", "warm", "wear", "cold", "clothes", "pair", "soft", "fabric", "snow", "finger", "protect", "sport", "work", "hold", "fit", "black", "brown", "outdoor", "thick"],
  },
  {
    word: "airplane",
    clues: ["fly", "sky", "travel", "wings", "engine", "airport", "cloud", "pilot", "seat", "fast", "ticket", "trip", "window", "high", "air", "safety", "crew", "bag", "plane", "journey"],
  },
  {
    word: "mirror",
    clues: ["glass", "reflection", "look", "face", "see", "wall", "clean", "shine", "image", "bathroom", "square", "frame", "smooth", "bright", "silver", "object", "home", "check", "clear", "light"],
  },
  {
    word: "pizza",
    clues: ["food", "cheese", "slice", "tomato", "crust", "warm", "oven", "topping", "round", "dough", "meal", "pepperoni", "sauce", "bread", "restaurant", "bake", "plate", "hot", "delicious", "snack"],
  },
  {
    word: "library",
    clues: ["books", "read", "quiet", "study", "shelf", "borrow", "knowledge", "desk", "chair", "building", "research", "paper", "story", "learning", "author", "student", "computer", "catalog", "learn", "entry"],
  },
  {
    word: "butterfly",
    clues: ["wing", "fly", "colorful", "insect", "flower", "beauty", "nature", "garden", "small", "light", "pattern", "soft", "spring", "air", "move", "fragile", "life", "leaf", "bright", "animal"],
  },
  {
    word: "umbrella",
    clues: ["rain", "cover", "wet", "open", "close", "handle", "water", "storm", "protection", "wind", "tool", "carry", "street", "walk", "dark", "drop", "shade", "sun", "blue", "sky"],
  },
  {
    word: "computer",
    clues: ["screen", "keyboard", "mouse", "device", "internet", "work", "study", "program", "code", "store", "data", "software", "hardware", "click", "open", "close", "type", "digital", "technology", "machine"],
  },
  {
    word: "tomato",
    clues: ["red", "round", "vegetable", "fruit", "kitchen", "slice", "salad", "soft", "fresh", "smooth", "juice", "plant", "garden", "seed", "cook", "raw", "ripe", "taste", "food", "healthy"],
  },
  {
    word: "helmet",
    clues: ["head", "protect", "bike", "motor", "safety", "hard", "strap", "wear", "road", "ride", "gear", "crash", "accident", "sport", "shield", "cover", "hard material", "chin", "fit", "secure"],
  },
  {
    word: "notebook",
    clues: ["write", "paper", "school", "note", "book", "line", "study", "open", "close", "hand", "pen", "desk", "class", "teacher", "idea", "draw", "white", "page", "cover", "simple"],
  },
  {
    word: "lion",
    clues: ["animal", "roar", "wild", "big", "strong", "mane", "yellow", "power", "hunter", "king", "savanna", "fast", "sharp", "claws", "teeth", "nature", "danger", "pride", "family", "predator"],
  },
  {
    word: "snow",
    clues: ["white", "cold", "winter", "fall", "ice", "soft", "sky", "freeze", "flake", "weather", "snowman", "season", "ground", "shoe", "cold wind", "storm", "light", "quiet", "nature", "coldness"],
  },
  {
    word: "balloon",
    clues: ["air", "party", "round", "color", "float", "helium", "string", "pop", "fun", "gift", "decoration", "soft", "expand", "shape", "fly", "event", "inflate", "light", "toy", "bright"],
  },
  {
    word: "chair",
    clues: ["sit", "seat", "room", "table", "wood", "leg", "back", "furniture", "class", "office", "home", "comfort", "plastic", "brown", "white", "simple", "use", "place", "design", "rest"],
  },
  {
    word: "sandwich",
    clues: ["bread", "food", "eat", "ham", "cheese", "lettuce", "slice", "kitchen", "lunch", "tomato", "easy", "simple", "meal", "plate", "snack", "make", "fresh", "cold", "bite", "tasty"],
  },
  {
    word: "volcano",
    clues: ["mountain", "lava", "eruption", "fire", "hot", "smoke", "rock", "danger", "nature", "earth", "red", "ash", "explosion", "crater", "heat", "power", "magma", "big", "ground", "flow"],
  },
  {
    word: "kangaroo",
    clues: ["animal", "jump", "Australia", "pouch", "strong", "fast", "tail", "grass", "wild", "brown", "cute", "hop", "nature", "field", "move", "big", "mammal", "carry", "baby", "fur"],
  },
  {
    word: "computer",
    clues: ["screen", "keyboard", "mouse", "device", "internet", "type", "program", "download", "file", "tech", "work", "study", "app", "open", "close", "store", "memory", "chip", "code", "machine"],
  },
  {
    word: "flower",
    clues: ["petal", "color", "garden", "beautiful", "smell", "plant", "nature", "green", "vase", "gift", "fresh", "soft", "bloom", "leaf", "stem", "pink", "red", "yellow", "white", "spring"],
  },
  {
    word: "cookie",
    clues: ["sweet", "bake", "chocolate", "brown", "crunchy", "snack", "kitchen", "butter", "treat", "oven", "round", "sugar", "flour", "bite", "crumb", "plate", "delicious", "kids", "milk", "dessert"],
  },
  {
    word: "bridge",
    clues: ["cross", "river", "road", "travel", "connect", "cars", "structure", "steel", "long", "safe", "walk", "vehicle", "path", "tall", "support", "under", "above", "city", "traffic", "view"],
  },
  {
    word: "shark",
    clues: ["fish", "ocean", "teeth", "danger", "big", "fast", "swim", "blue", "attack", "water", "fin", "deep", "predator", "wild", "animal", "fear", "grey", "hunt", "sea", "power"],
  },
  {
    word: "candle",
    clues: ["light", "wax", "burn", "night", "smell", "soft", "yellow", "room", "fire", "bright", "warm", "small", "romantic", "stick", "melt", "table", "white", "glow", "tiny", "peace"],
  },
  {
    word: "farmer",
    clues: ["field", "farm", "animal", "plant", "grow", "food", "soil", "work", "tractor", "barn", "morning", "milk", "harvest", "garden", "tool", "land", "vegetable", "hay", "seed", "earth"],
  },
  {
    word: "jungle",
    clues: ["forest", "trees", "wild", "animal", "green", "dense", "danger", "nature", "monkey", "bird", "thick", "plant", "rain", "insect", "path", "dark", "sound", "leaf", "wood", "tiger"],
  },
  {
    word: "rocket",
    clues: ["space", "launch", "astronaut", "sky", "science", "travel", "engine", "fire", "mission", "fuel", "speed", "technology", "satellite", "fly", "stars", "moon", "planet", "metal", "lift", "explore"],
  },
  {
    word: "bicycle",
    clues: ["pedal", "wheel", "ride", "street", "fast", "helmet", "road", "seat", "brake", "sport", "handle", "speed", "outdoor", "cycle", "gear", "balance", "tires", "move", "path", "simple"],
  },
  {
    word: "penguin",
    clues: ["bird", "cold", "snow", "Antarctica", "black", "white", "cute", "fish", "ice", "walk", "swim", "animal", "slide", "group", "flippers", "family", "egg", "nature", "cold wind", "water"],
  },
  {
    word: "pillow",
    clues: ["sleep", "soft", "bed", "head", "night", "rest", "room", "white", "cover", "square", "cotton", "comfort", "fluffy", "dream", "blanket", "relax", "smooth", "fabric", "shape", "home"],
  },
  {
    word: "orange",
    clues: ["fruit", "color", "round", "juice", "sweet", "citrus", "fresh", "peel", "vitamin", "eat", "healthy", "tree", "seed", "snack", "kitchen", "sour", "tropical", "slice", "smell", "bright"],
  },
  {
    word: "raincoat",
    clues: ["rain", "wet", "coat", "yellow", "wear", "hood", "storm", "cover", "waterproof", "cold", "walk", "street", "plastic", "protect", "jacket", "wind", "splash", "weather", "safety", "gear"],
  },
  {
    word: "diamond",
    clues: ["gem", "shine", "ring", "expensive", "clear", "hard", "stone", "sparkle", "bright", "luxury", "cut", "jewelry", "gift", "beautiful", "white", "light", "rare", "value", "wedding", "glitter"],
  },
  {
    word: "fork",
    clues: ["eat", "food", "table", "metal", "kitchen", "prongs", "spoon", "knife", "hold", "dinner", "meal", "tool", "silver", "grab", "pick", "clean", "use", "dish", "plate", "small"],
  },
  {
    word: "elephant",
    clues: ["big", "animal", "trunk", "grey", "wild", "strong", "Africa", "Asia", "nature", "forest", "heavy", "giant", "walk", "ears", "family", "water", "grass", "thick", "skin", "tusk"],
  },
  {
    word: "ticket",
    clues: ["travel", "paper", "buy", "train", "bus", "movie", "seat", "entry", "event", "price", "show", "number", "receive", "hold", "print", "code", "small", "use", "place", "visit"],
  },
  {
    word: "radio",
    clues: ["sound", "music", "voice", "station", "signal", "device", "listen", "tune", "news", "speaker", "battery", "old", "button", "volume", "frequency", "wave", "broadcast", "program", "talk", "audio"],
  },
  {
    word: "dancer",
    clues: ["dance", "move", "music", "stage", "show", "art", "perform", "body", "flexible", "costume", "grace", "rhythm", "team", "talent", "practice", "feet", "balance", "beauty", "event", "lights"],
  },
  {
    word: "camera",
    clues: ["photo", "picture", "lens", "flash", "capture", "shoot", "device", "memory", "screen", "record", "travel", "focus", "button", "zoom", "image", "video", "hand", "digital", "moment", "light"],
  },
  {
    word: "feather",
    clues: ["bird", "soft", "light", "white", "wing", "fly", "nature", "air", "animal", "fall", "thin", "shape", "smooth", "touch", "small", "gentle", "blue", "brown", "down", "fluffy"],
  },
  {
    word: "key",
    clues: ["lock", "door", "open", "close", "metal", "small", "house", "car", "ring", "hold", "use", "silver", "safe", "security", "item", "find", "lost", "pocket", "carry", "tool"],
  },
  {
    word: "shoes",
    clues: ["feet", "wear", "walk", "pair", "lace", "comfort", "leather", "color", "fashion", "sport", "run", "style", "footwear", "shop", "size", "clean", "protect", "toe", "sole", "casual"],
  },
  {
    word: "watermelon",
    clues: ["fruit", "green", "red", "sweet", "juicy", "seed", "big", "round", "summer", "fresh", "cold", "slice", "picnic", "nature", "snack", "smooth", "tasty", "water", "eat", "healthy"],
  },
  {
    word: "dragon",
    clues: ["myth", "fire", "fly", "big", "power", "strong", "wing", "danger", "fantasy", "legend", "creature", "scale", "tail", "story", "fear", "cave", "ancient", "magic", "roar", "giant"],
  },
  {
    word: "ladder",
    clues: ["climb", "step", "tall", "tool", "wood", "metal", "hold", "reach", "roof", "work", "support", "wall", "move", "high", "two sides", "balance", "stand", "carry", "safety", "object"],
  },
  {
    word: "guitar",
    clues: ["music", "string", "sound", "play", "instrument", "song", "finger", "wood", "note", "melody", "band", "stage", "art", "practice", "tune", "pick", "chord", "solo", "tone", "rhythm"],
  },
  {
    word: "moon",
    clues: ["night", "sky", "round", "light", "space", "crater", "bright", "white", "Earth", "orbit", "shine", "star", "shadow", "dark", "full", "crescent", "big", "quiet", "beautiful", "gravity"],
  },
  {
    word: "chef",
    clues: ["cook", "kitchen", "food", "knife", "restaurant", "menu", "recipe", "apron", "taste", "dinner", "meal", "prepare", "pan", "heat", "flavor", "serve", "hat", "cut", "mix", "profession"],
  },
  {
    word: "cloud",
    clues: ["sky", "white", "soft", "rain", "weather", "float", "air", "blue", "shape", "light", "high", "fluffy", "storm", "wind", "shade", "move", "dark", "grey", "day", "nature"],
  },
  {
    word: "ladder",
    clues: ["steps", "climb", "tool", "tall", "reach", "metal", "wood", "roof", "height", "support", "balance", "work", "garage", "carry", "portable", "rung", "stand", "move", "hand", "safe"],
  },
  {
    word: "wallet",
    clues: ["money", "pocket", "leather", "card", "cash", "small", "hold", "zipper", "id", "coins", "carry", "bag", "open", "close", "gift", "brown", "black", "fold", "thin", "bank"],
  },
  {
    word: "castle",
    clues: ["stone", "king", "queen", "tower", "medieval", "bridge", "wall", "strong", "royal", "guard", "history", "gate", "land", "moat", "fort", "old", "big", "battle", "crown", "hall"],
  },
  {
    word: "rainbow",
    clues: ["sky", "color", "rain", "sun", "arc", "bright", "beautiful", "weather", "light", "curve", "nature", "rare", "hope", "seven", "after rain", "view", "shine", "blue", "red", "green"],
  },
  {
    word: "market",
    clues: ["buy", "sell", "crowd", "stall", "food", "fruit", "shop", "place", "vendor", "money", "trade", "fresh", "busy", "walk", "bag", "basket", "goods", "price", "talk", "street"],
  },
  {
    word: "blanket",
    clues: ["warm", "sleep", "bed", "soft", "cover", "night", "cold", "fabric", "comfort", "cozy", "winter", "couch", "fold", "color", "thick", "thin", "house", "hug", "wrap", "rest"],
  },
  {
    word: "theater",
    clues: ["stage", "show", "act", "seat", "lights", "curtain", "movie", "performance", "crowd", "speaker", "screen", "ticket", "sound", "music", "drama", "hall", "event", "story", "play", "applause"],
  },
  {
    word: "bridge",
    clues: ["river", "cross", "road", "cars", "structure", "long", "metal", "stone", "connect", "travel", "path", "walk", "support", "traffic", "big", "city", "engineer", "build", "high", "water"],
  },
  {
    word: "helmet",
    clues: ["head", "safety", "bike", "motor", "hard", "protect", "wear", "strap", "gear", "sport", "ride", "crash", "plastic", "metal", "shell", "visor", "secure", "law", "road", "fit"],
  },
  {
    word: "robot",
    clues: ["machine", "metal", "move", "tech", "future", "AI", "arm", "head", "program", "build", "factory", "work", "tool", "task", "voice", "light", "electric", "sensor", "face", "button"],
  },
  {
    word: "mirror",
    clues: ["glass", "reflect", "wall", "see", "face", "frame", "clean", "shine", "bathroom", "bedroom", "look", "image", "smooth", "bright", "square", "round", "hand", "beauty", "check", "silver"],
  },
  {
    word: "turtle",
    clues: ["animal", "shell", "slow", "green", "sea", "water", "walk", "swim", "egg", "beach", "nature", "cute", "small", "big", "reptile", "long life", "safe", "head", "legs", "ocean"],
  },
  {
    word: "pencil",
    clues: ["write", "wood", "lead", "sharp", "eraser", "school", "draw", "paper", "yellow", "long", "hold", "tip", "sketch", "tool", "hand", "student", "desk", "point", "simple", "note"],
  },
  {
    word: "planet",
    clues: ["space", "round", "orbit", "sun", "earth", "big", "star", "moon", "dark", "galaxy", "sky", "science", "life", "rock", "gas", "move", "day", "night", "solar", "world"],
  },
  {
    word: "parcel",
    clues: ["box", "mail", "send", "deliver", "package", "wrap", "post", "address", "tape", "courier", "label", "receive", "shop", "buy", "gift", "brown", "fast", "door", "truck", "carry"],
  },
  {
    word: "window",
    clues: ["glass", "light", "open", "close", "home", "air", "frame", "view", "curtain", "room", "wall", "look", "outside", "clear", "square", "wind", "sun", "morning", "screen", "shine"],
  },
  {
    word: "shadow",
    clues: ["dark", "shape", "sun", "light", "ground", "follow", "move", "body", "object", "night", "shade", "black", "silhouette", "floor", "long", "short", "day", "walk", "appear", "disappear"],
  },
  {
    word: "pillow",
    clues: ["sleep", "soft", "bed", "head", "rest", "white", "fabric", "cover", "comfort", "night", "foam", "fluff", "dream", "relax", "square", "hug", "room", "warm", "cotton", "couch"],
  },
  {
    word: "rocket",
    clues: ["space", "launch", "fire", "engine", "astronaut", "sky", "round", "fast", "air", "science", "lift", "fuel", "NASA", "travel", "ship", "moon", "planet", "boom", "flight", "stars"],
  },
  {
    word: "farmer",
    clues: ["field", "crop", "plant", "soil", "work", "food", "farm", "cow", "chicken", "vegetable", "tractor", "grow", "land", "seed", "harvest", "early", "tool", "water", "barn", "rice"],
  },
  {
    word: "basket",
    clues: ["hold", "carry", "handle", "food", "picnic", "weave", "store", "small", "round", "bag", "gift", "fruit", "bread", "shop", "buy", "keep", "wood", "plastic", "light", "contain"],
  },
  {
    word: "camera",
    clues: ["photo", "lens", "shoot", "memory", "focus", "flash", "device", "digital", "picture", "record", "button", "screen", "zoom", "trip", "hold", "color", "image", "save", "travel", "capture"],
  },
  {
    word: "ticket",
    clues: ["paper", "entry", "buy", "movie", "train", "bus", "travel", "price", "seat", "show", "event", "code", "scan", "pass", "line", "counter", "keep", "tear", "check", "admit"],
  },
  {
    word: "dragon",
    clues: ["myth", "fire", "big", "wings", "tail", "scale", "magic", "strong", "fly", "fantasy", "animal", "story", "legend", "fear", "claw", "teeth", "red", "green", "old", "roar"],
  },
  {
    word: "cookie",
    clues: ["sweet", "bake", "chocolate", "small", "round", "crunchy", "snack", "sugar", "kitchen", "kids", "brown", "soft", "treat", "tin", "delicious", "oven", "bite", "cream", "plate", "flour"],
  },
  {
    word: "harbor",
    clues: ["boat", "ship", "sea", "dock", "anchor", "water", "port", "fisherman", "travel", "cargo", "trade", "coast", "wave", "map", "bay", "city", "transport", "net", "bridge", "ocean"],
  },
  {
    word: "pepper",
    clues: ["spicy", "food", "black", "red", "green", "vegetable", "cook", "taste", "seasoning", "kitchen", "grind", "powder", "fresh", "slice", "hot", "mild", "flavor", "eat", "dish", "plant"],
  },
  {
    word: "pigeon",
    clues: ["bird", "gray", "city", "fly", "wing", "street", "park", "seed", "coo", "roof", "group", "small", "walk", "animal", "sky", "fast", "common", "urban", "branch", "feather"],
  },
  {
    word: "bucket",
    clues: ["water", "carry", "handle", "plastic", "metal", "clean", "tool", "floor", "house", "blue", "fill", "pour", "wet", "hold", "wash", "bath", "tap", "simple", "round", "container"],
  },
  {
    word: "puzzle",
    clues: ["game", "piece", "fit", "mind", "solve", "play", "picture", "challenge", "brain", "table", "fun", "match", "shape", "connect", "logic", "think", "hard", "box", "bits", "image"],
  },
  {
    word: "orange",
    clues: ["fruit", "color", "round", "citrus", "sweet", "peel", "juice", "vitamin", "fresh", "tree", "seed", "slice", "garden", "healthy", "snack", "sour", "bright", "drink", "soft", "tasty"],
  },
  {
    word: "sofa",
    clues: ["seat", "living room", "cushion", "soft", "sit", "rest", "relax", "fabric", "arm", "back", "family", "big", "brown", "gray", "home", "furniture", "comfort", "long", "nap", "cozy"],
  },
  {
    word: "bridge",
    clues: ["river", "cross", "cars", "walk", "road", "metal", "stone", "long", "connect", "structure", "path", "travel", "engineer", "support", "city", "vehicle", "big", "water", "ground", "traffic"],
  },
  {
    word: "needle",
    clues: ["sharp", "thin", "metal", "thread", "sew", "cloth", "hand", "small", "point", "tool", "pin", "stitch", "fabric", "fix", "craft", "hole", "silver", "tiny", "danger", "careful"],
  },
  {
    word: "forest",
    clues: ["trees", "green", "animals", "rain", "nature", "leaf", "trail", "wild", "fresh", "wood", "path", "camp", "sun", "quiet", "river", "rock", "hike", "shade", "air", "land"],
  },
  {
    word: "lantern",
    clues: ["light", "night", "carry", "glow", "fire", "lamp", "old", "metal", "handle", "dark", "warm", "camp", "bright", "hang", "glass", "yellow", "rustic", "shine", "travel", "outside"],
  },
  {
    word: "cotton",
    clues: ["fabric", "soft", "white", "plant", "thread", "cloth", "shirt", "light", "clean", "fluffy", "warm", "material", "natural", "pick", "grow", "field", "dry", "touch", "use", "industry"],
  },
  {
    word: "butter",
    clues: ["yellow", "food", "spread", "bread", "milk", "cow", "fat", "cook", "soft", "salted", "bake", "kitchen", "pan", "melts", "cream", "smooth", "taste", "dish", "slice", "cold"],
  },
  {
    word: "candle",
    clues: ["wax", "light", "flame", "fire", "burn", "night", "scent", "stick", "melt", "dark", "bright", "long", "soft", "heat", "relax", "room", "yellow", "birthday", "party", "shine"],
  },
  {
    word: "violin",
    clues: ["music", "string", "bow", "sound", "play", "instrument", "note", "classical", "wood", "song", "hand", "tune", "practice", "stage", "concert", "art", "skill", "melody", "soft", "beautiful"],
  },
  {
    word: "garden",
    clues: ["plants", "flowers", "soil", "water", "green", "grow", "sun", "home", "yard", "tree", "tool", "seed", "beautiful", "fresh", "leaf", "nature", "butterfly", "grass", "small", "fence"],
  },
  {
    word: "courage",
    clues: ["brave", "strong", "heart", "fear", "act", "bold", "fight", "hero", "spirit", "try", "risk", "difficult", "stand", "soul", "believe", "power", "face", "moment", "trust", "will"],
  },
  {
    word: "whistle",
    clues: ["sound", "mouth", "blow", "air", "sport", "coach", "referee", "noise", "metal", "train", "signal", "sharp", "small", "hand", "breath", "tool", "ring", "short", "long", "call"],
  },
  {
    word: "scooter",
    clues: ["ride", "wheel", "street", "foot", "push", "small", "kids", "fast", "handle", "balance", "toy", "fun", "travel", "road", "move", "turn", "outdoor", "park", "simple", "metal"],
  },
  {
    word: "anchor",
    clues: ["boat", "ship", "sea", "heavy", "drop", "chain", "hold", "stop", "water", "dock", "iron", "sail", "ocean", "rope", "sink", "secure", "harbor", "travel", "marine", "weight"],
  },
  {
    word: "hammer",
    clues: ["tool", "hit", "build", "metal", "nail", "wood", "hard", "hand", "work", "garage", "fix", "strong", "handle", "sound", "heavy", "task", "house", "job", "strike", "head"],
  },
  {
    word: "radio",
    clues: ["music", "sound", "news", "frequency", "station", "audio", "device", "speaker", "tune", "voice", "old", "signal", "listen", "car", "song", "noise", "dial", "broadcast", "wave", "talk"],
  },
  {
    word: "storm",
    clues: ["rain", "wind", "dark", "sky", "cloud", "loud", "flash", "lightning", "thunder", "weather", "strong", "scary", "cold", "heavy", "wet", "night", "gray", "drop", "danger", "flood"],
  },
  {
    word: "compass",
    clues: ["north", "south", "east", "west", "tool", "travel", "direction", "needle", "round", "map", "guide", "hand", "metal", "explore", "camp", "hike", "forest", "old", "move", "magnetic"],
  },
  {
    word: "crystal",
    clues: ["clear", "shine", "stone", "rock", "bright", "glass", "light", "sparkle", "clean", "smooth", "hard", "gem", "white", "blue", "shape", "cold", "sharp", "pretty", "natural", "small"],
  },
  {
    word: "helmet",
    clues: ["protect", "head", "safety", "bike", "motor", "gear", "hard", "wear", "law", "road", "strap", "crash", "secure", "sport", "fit", "cover", "foam", "plastic", "test", "shield"],
  },

  {
    word: "backpack",
    clues: ["bag", "carry", "school", "zipper", "strap", "books", "travel", "pocket", "gear", "daily", "load", "shoulder", "item", "storage", "supplies", "light", "pack", "nylon", "gear", "container"],
  },
  {
    word: "pencil",
    clues: ["write", "school", "yellow", "eraser", "sharp", "wood", "lead", "note", "draw", "point", "hand", "tool", "stationery", "line", "sketch", "simple", "thin", "mark", "grip", "desk"],
  },
  {
    word: "window",
    clues: ["glass", "house", "open", "frame", "sunlight", "air", "view", "wall", "bright", "room", "square", "curtain", "transparent", "home", "clear", "outside", "inside", "shade", "wind", "panel"],
  },
  {
    word: "blanket",
    clues: ["warm", "sleep", "bed", "soft", "cover", "night", "cold", "comfort", "fabric", "cozy", "rest", "home", "room", "winter", "thick", "snuggle", "fluffy", "quilt", "material", "relax"],
  },
  {
    word: "candle",
    clues: ["light", "wax", "flame", "burn", "scent", "dark", "room", "stick", "fire", "warm", "melt", "small", "romantic", "soft", "bright", "match", "holder", "white", "decor", "glow"],
  },
  {
    word: "elephant",
    clues: ["animal", "big", "gray", "trunk", "ears", "wild", "Africa", "Asia", "zoo", "grass", "giant", "strong", "heavy", "family", "herd", "intelligent", "thick", "skin", "tusk", "nature"],
  },
  {
    word: "raincoat",
    clues: ["rain", "wear", "yellow", "jacket", "wet", "storm", "hood", "plastic", "waterproof", "outside", "protection", "walk", "coat", "drop", "splash", "weather", "mud", "boots", "cover", "travel"],
  },
  {
    word: "wallet",
    clues: ["money", "card", "pocket", "leather", "cash", "ID", "carry", "small", "keep", "safe", "fold", "buy", "pay", "brown", "black", "bag", "store", "coins", "note", "daily"],
  },
  {
    word: "mirror",
    clues: ["reflection", "glass", "look", "face", "wall", "bathroom", "see", "clean", "frame", "smooth", "bright", "body", "image", "room", "silver", "check", "stand", "shape", "decorate", "shine"],
  },
  {
    word: "pillow",
    clues: ["sleep", "soft", "head", "rest", "bed", "comfort", "night", "square", "cotton", "foam", "cover", "room", "white", "relax", "cozy", "dream", "snore", "home", "fluffy", "nap"],
  },
  {
    word: "engine",
    clues: ["machine", "car", "power", "run", "fuel", "motor", "move", "heat", "metal", "system", "drive", "vehicle", "part", "noise", "mechanic", "speed", "strong", "function", "energy", "oil"],
  },
  {
    word: "sandwich",
    clues: ["food", "bread", "eat", "lunch", "ham", "cheese", "bite", "fill", "salad", "snack", "stack", "quick", "simple", "cook", "kitchen", "plate", "tomato", "lettuce", "meal", "tasty"],
  },
  {
    word: "turtle",
    clues: ["animal", "shell", "slow", "green", "water", "swim", "ocean", "beach", "egg", "reptile", "nature", "walk", "cute", "wild", "sea", "small", "hard", "protect", "old", "long life"],
  },
  {
    word: "ladder",
    clues: ["climb", "step", "tool", "high", "reach", "metal", "wood", "two sides", "garage", "support", "balance", "work", "house", "repair", "roof", "tall", "stable", "hand", "up", "down"],
  },
  {
    word: "bananas",
    clues: ["fruit", "yellow", "sweet", "long", "peel", "tree", "snack", "soft", "healthy", "bunch", "tropical", "fresh", "smooth", "eating", "energy", "potassium", "monkey", "green", "ripe", "food"],
  },
  {
    word: "airport",
    clues: ["plane", "travel", "flight", "pilot", "gate", "runway", "arrival", "departure", "check-in", "passport", "ticket", "bag", "terminal", "security", "waiting", "airline", "people", "fly", "sky", "trip"],
  },
  {
    word: "penguin",
    clues: ["animal", "cold", "bird", "black", "white", "ice", "snow", "walk", "cute", "swim", "fish", "antarctica", "family", "group", "small", "round", "nature", "wing", "water", "winter"],
  },
  {
    word: "trophy",
    clues: ["award", "win", "gold", "sport", "champion", "prize", "cup", "shine", "team", "success", "proud", "event", "metal", "display", "honor", "victory", "achievement", "celebrate", "stand", "competition"],
  },

  {
    word: "notebook",
    clues: ["write", "paper", "school", "pages", "line", "note", "study", "book", "pen", "cover", "desk", "carry", "student", "journal", "idea", "plan", "daily", "list", "record", "small"],
  },
  {
    word: "umbrella",
    clues: ["rain", "wet", "cover", "carry", "open", "stick", "handle", "weather", "protect", "fold", "water", "wind", "storm", "shade", "sun", "outside", "tool", "travel", "dark", "drop"],
  },
  {
    word: "giraffe",
    clues: ["animal", "tall", "long neck", "spots", "yellow", "brown", "wild", "Africa", "zoo", "leaf", "tree", "eat", "walk", "legs", "nature", "herbivore", "cute", "big", "calm", "savanna"],
  },
  {
    word: "backyard",
    clues: ["house", "grass", "garden", "tree", "outside", "play", "family", "yard", "fence", "ground", "sun", "space", "small", "home", "plants", "activity", "dogs", "kids", "open", "area"],
  },
  {
    word: "lipstick",
    clues: ["makeup", "red", "color", "lips", "beauty", "face", "cosmetic", "tube", "shine", "smooth", "fashion", "women", "style", "pink", "gloss", "apply", "mirror", "shade", "pretty", "small"],
  },
  {
    word: "airplane",
    clues: ["fly", "sky", "travel", "wing", "engine", "pilot", "airport", "seat", "ticket", "big", "fast", "passenger", "trip", "high", "window", "cloud", "landing", "takeoff", "runway", "journey"],
  },
  {
    word: "crocodile",
    clues: ["animal", "river", "big", "teeth", "danger", "green", "water", "swim", "hunt", "wild", "reptile", "scales", "strong", "jaw", "bite", "eggs", "nature", "cold blood", "long", "tail"],
  },
  {
    word: "calendar",
    clues: ["date", "day", "month", "year", "plan", "schedule", "event", "office", "time", "paper", "wall", "mark", "note", "week", "organize", "number", "daily", "reminder", "month name", "show"],
  },
  {
    word: "skyscraper",
    clues: ["building", "tall", "city", "glass", "office", "high", "floor", "windows", "tower", "modern", "urban", "large", "elevator", "people", "work", "street", "structure", "shine", "block", "sky"],
  },
  {
    word: "volleyball",
    clues: ["sport", "ball", "team", "net", "court", "hit", "jump", "serve", "play", "game", "win", "score", "match", "outside", "competition", "move", "beach", "sand", "teamwork", "practice"],
  },
  {
    word: "diamond",
    clues: ["gem", "shine", "cut", "ring", "hard", "expensive", "jewelry", "clear", "sparkle", "luxury", "beautiful", "rare", "stone", "white", "gift", "value", "bright", "shape", "special", "precious"],
  },
  {
    word: "ocean",
    clues: ["water", "blue", "wave", "fish", "deep", "sea", "boat", "salt", "life", "big", "sand", "beach", "swim", "shell", "tide", "wide", "ocean floor", "coral", "shark", "island"],
  },
  {
    word: "fireplace",
    clues: ["fire", "warm", "winter", "brick", "house", "living room", "wood", "burn", "cozy", "heat", "family", "comfort", "smoke", "night", "holiday", "glow", "old", "home", "relax", "flame"],
  },
  {
    word: "library",
    clues: ["books", "read", "quiet", "shelf", "study", "learn", "table", "page", "write", "students", "knowledge", "librarian", "building", "borrow", "return", "clean", "public", "education", "chair", "catalog"],
  },
  {
    word: "avocado",
    clues: ["fruit", "green", "soft", "seed", "healthy", "smooth", "tasty", "fresh", "slice", "breakfast", "sandwich", "salad", "eat", "fat", "tree", "creamy", "food", "ripe", "kitchen", "spread"],
  },
  {
    word: "scooter",
    clues: ["ride", "street", "small", "two wheels", "fast", "travel", "kids", "balance", "metal", "foot", "push", "simple", "fun", "toy", "park", "road", "outdoor", "move", "handle", "urban"],
  },
  {
    word: "mailbox",
    clues: ["letter", "post", "mail", "box", "address", "send", "receive", "street", "home", "open", "close", "daily", "message", "paper", "outside", "metal", "red", "number", "slot", "drop"],
  },
  {
    word: "washingmachine",
    clues: ["clean", "clothes", "water", "spin", "soap", "wash", "laundry", "home", "drum", "cycle", "button", "electric", "white", "load", "dry", "family", "house", "rinse", "washroom", "machine"],
  },
  {
    word: "necklace",
    clues: ["jewelry", "neck", "wear", "gold", "silver", "chain", "fashion", "gift", "pretty", "stone", "shine", "circle", "dress", "style", "beautiful", "accessory", "string", "beads", "classic", "party"],
  },
  {
    word: "kangaroo",
    clues: ["animal", "Australia", "jump", "pouch", "strong", "tail", "brown", "wild", "grass", "nature", "hop", "mammal", "big", "legs", "baby", "cute", "land", "run", "forest", "fur"],
  },
  {
    word: "pineapple",
    clues: ["fruit", "yellow", "sweet", "tropical", "rough", "spiky", "juice", "eat", "slice", "tree", "fresh", "food", "round", "hard", "brown", "pattern", "kitchen", "healthy", "summer", "ripe"],
  },
  {
    word: "wallet",
    clues: ["money", "cash", "card", "pocket", "leather", "carry", "safe", "small", "coin", "ID", "buy", "pay", "brown", "black", "gift", "store", "fold", "daily", "important", "item"],
  },
  {
    word: "gasoline",
    clues: ["fuel", "car", "motor", "burn", "energy", "liquid", "smell", "station", "use", "engine", "travel", "danger", "fire", "tank", "pump", "power", "vehicle", "refill", "transport", "chemical"],
  },
  {
    word: "basketball",
    clues: ["sport", "ball", "team", "court", "hoop", "score", "run", "dribble", "shoot", "player", "bounce", "game", "win", "coach", "practice", "orange", "net", "skill", "pass", "jump"],
  },
  {
    word: "scissors",
    clues: ["cut", "paper", "school", "tool", "sharp", "metal", "hand", "desk", "snip", "open", "close", "craft", "work", "plastic", "blade", "small", "safe", "red", "blue", "shape"],
  },
  {
    word: "blanket",
    clues: ["warm", "sleep", "soft", "bed", "cover", "night", "cozy", "fabric", "winter", "thick", "snuggle", "home", "comfort", "cold", "rest", "room", "family", "relax", "big", "cloth"],
  },
  {
    word: "satellite",
    clues: ["space", "orbit", "signal", "communication", "sky", "technology", "metal", "science", "picture", "earth", "circle", "move", "tool", "device", "antenna", "modern", "cloud", "data", "transmit", "station"],
  },
  {
    word: "castle",
    clues: ["king", "queen", "stone", "old", "tower", "wall", "history", "big", "bridge", "moat", "knight", "medieval", "gate", "royal", "fort", "strong", "battle", "armor", "flag", "hall"],
  },
  {
    word: "honey",
    clues: ["sweet", "bee", "yellow", "jar", "food", "sticky", "natural", "flower", "taste", "breakfast", "bread", "spread", "nectar", "nature", "liquid", "thick", "gold", "sweetener", "tasty", "drip"],
  },
  {
    word: "whistle",
    clues: ["sound", "blow", "air", "coach", "referee", "loud", "small", "metal", "plastic", "signal", "training", "sport", "noise", "toot", "alarm", "call", "use", "tool", "mouth", "work"],
  },
  {
    word: "penguin",
    clues: ["bird", "cold", "black", "white", "ice", "swim", "cute", "fish", "antarctica", "snow", "wild", "walk", "animal", "nature", "slide", "family", "group", "winter", "short", "water"],
  },
  {
    word: "tornado",
    clues: ["wind", "storm", "danger", "twist", "cloud", "spin", "fast", "gray", "sky", "weather", "damage", "air", "strong", "vortex", "disaster", "nature", "movement", "circle", "funnel", "power"],
  },
  {
    word: "earphone",
    clues: ["music", "sound", "listen", "small", "wire", "plug", "ear", "device", "audio", "phone", "black", "white", "song", "portable", "speaker", "soft", "pair", "media", "volume", "tool"],
  },
  {
    word: "gloves",
    clues: ["hand", "wear", "cold", "winter", "warm", "clothes", "protect", "soft", "fabric", "snow", "outdoor", "cover", "knit", "pair", "finger", "black", "thick", "keep", "coat", "weather"],
  },
  {
    word: "snowflake",
    clues: ["winter", "cold", "white", "ice", "sky", "fall", "unique", "small", "shape", "freeze", "light", "pretty", "weather", "cloud", "soft", "nature", "flake", "touch", "cool", "air"],
  },
  {
    word: "moonlight",
    clues: ["night", "moon", "shine", "sky", "dark", "silver", "quiet", "calm", "glow", "soft", "shadow", "beauty", "cool", "bright", "evening", "walk", "reflect", "stars", "light", "outside"],
  },
  {
    word: "railway",
    clues: ["train", "track", "station", "travel", "metal", "long", "transport", "rail", "fast", "road", "carriage", "ticket", "passenger", "journey", "direction", "platform", "city", "village", "move", "route"],
  },
  {
    word: "toolbox",
    clues: ["tools", "screwdriver", "hammer", "box", "metal", "carry", "work", "garage", "repair", "fix", "build", "nails", "storage", "home", "mechanic", "open", "close", "job", "equipment", "hand"],
  },
  {
    word: "mushroom",
    clues: ["food", "grow", "forest", "white", "brown", "soft", "eat", "kitchen", "plant", "nature", "small", "round", "cook", "soup", "farm", "fresh", "tasty", "soft", "stalk", "cap"],
  },
  {
    word: "parachute",
    clues: ["sky", "fall", "safety", "jump", "air", "cloth", "open", "round", "rope", "fly", "pilot", "sport", "adventure", "height", "cloud", "wind", "slow", "travel", "equipment", "blue"],
  },
  {
    word: "headphones",
    clues: ["music", "sound", "big", "listen", "ear", "song", "studio", "device", "cable", "wireless", "black", "white", "voice", "volume", "bass", "noise", "media", "computer", "phone", "audio"],
  },
  {
    word: "popcorn",
    clues: ["snack", "corn", "movie", "eat", "bucket", "salt", "yellow", "light", "soft", "crunch", "food", "butter", "hot", "pop", "microwave", "cinema", "fun", "share", "bag", "tasty"],
  },
  {
    word: "shampoo",
    clues: ["hair", "wash", "clean", "bathroom", "foam", "liquid", "bottle", "fresh", "smell", "water", "care", "shower", "soap", "scalp", "use", "soft", "daily", "rinse", "smooth", "bath"],
  },

  {
    word: "museum",
    clues: ["history", "art", "building", "quiet", "exhibit", "tour", "paintings", "ancient", "culture", "display", "guide", "science", "visit", "collection", "statue", "glass", "room", "learning", "ticket", "public"],
  },
  {
    word: "penguin",
    clues: ["bird", "cold", "black", "white", "ice", "animal", "walk", "cute", "swim", "antarctica", "fish", "family", "group", "waddle", "nature", "snow", "wing", "ocean", "colony", "egg"],
  },
  {
    word: "blanket",
    clues: ["warm", "soft", "bed", "sleep", "cover", "winter", "fabric", "cozy", "night", "thick", "comfort", "fold", "color", "smooth", "material", "hug", "room", "hotel", "cold", "home"],
  },
  {
    word: "volcano",
    clues: ["mountain", "fire", "lava", "eruption", "earth", "rock", "danger", "smoke", "hot", "ash", "nature", "explosion", "gas", "magma", "heat", "flow", "island", "crust", "valley", "disaster"],
  },
  {
    word: "wallet",
    clues: ["money", "pocket", "cash", "card", "small", "leather", "id", "coin", "daily", "black", "fold", "safe", "bag", "item", "important", "hold", "personal", "buy", "store", "carry"],
  },
  {
    word: "mailbox",
    clues: ["letter", "house", "post", "send", "red", "delivery", "mailman", "address", "paper", "receive", "street", "lock", "message", "slot", "card", "package", "metal", "sign", "home", "box"],
  },
  {
    word: "compass",
    clues: ["north", "tool", "direction", "travel", "needle", "circle", "metal", "map", "guide", "navigation", "east", "south", "west", "adventure", "explorer", "forest", "point", "turn", "location", "magnet"],
  },
  {
    word: "telescope",
    clues: ["sky", "stars", "look", "tool", "night", "space", "astronomy", "moon", "scientist", "lens", "far", "observe", "galaxy", "planet", "view", "dark", "tripod", "distance", "object", "science"],
  },
  {
    word: "strawberry",
    clues: ["fruit", "red", "sweet", "small", "seed", "cake", "juice", "jam", "fresh", "garden", "soft", "food", "eat", "berry", "plant", "green", "dessert", "heart-shaped", "market", "snack"],
  },
  {
    word: "tractor",
    clues: ["farm", "machine", "field", "wheel", "big", "engine", "pull", "land", "soil", "farmer", "work", "heavy", "grass", "ground", "crop", "plow", "metal", "vehicle", "slow", "farmwork"],
  },
  {
    word: "calendar",
    clues: ["date", "month", "day", "year", "time", "schedule", "event", "plan", "paper", "number", "week", "mark", "note", "holiday", "daily", "office", "wall", "organize", "future", "check"],
  },
  {
    word: "oxygen",
    clues: ["air", "breath", "life", "gas", "science", "element", "clear", "earth", "lungs", "plant", "water", "oxygen", "O2", "nature", "blue", "sky", "clean", "needed", "health", "invisible"],
  },
  {
    word: "thermometer",
    clues: ["temperature", "hot", "cold", "tool", "measure", "glass", "red", "line", "health", "doctor", "fever", "scale", "metal", "number", "degree", "science", "weather", "check", "room", "heat"],
  },
  {
    word: "pirate",
    clues: ["ship", "sea", "treasure", "eye patch", "sword", "island", "captain", "crew", "gold", "map", "danger", "flag", "skull", "ocean", "adventure", "steal", "parrot", "black", "boat", "hunt"],
  },
  {
    word: "bridge",
    clues: ["river", "cross", "road", "cars", "build", "metal", "long", "city", "traffic", "structure", "support", "tower", "connect", "water", "walk", "drive", "safety", "rail", "arch", "engineering"],
  },
  {
    word: "pillow",
    clues: ["sleep", "soft", "bed", "white", "night", "rest", "cozy", "head", "comfort", "fabric", "cover", "square", "wash", "cushion", "nap", "relax", "room", "hotel", "fluffy", "cotton"],
  },
  {
    word: "dragon",
    clues: ["myth", "fire", "fly", "creature", "big", "magic", "fantasy", "kingdom", "danger", "wing", "tail", "story", "legend", "scale", "strong", "hero", "fight", "castle", "sky", "roar"],
  },
  {
    word: "chemist",
    clues: ["science", "lab", "experiment", "mix", "chemical", "white coat", "work", "research", "tube", "bottle", "study", "formula", "medicine", "doctor", "liquid", "test", "safety", "glasses", "knowledge", "reaction"],
  },
  {
    word: "airport",
    clues: ["plane", "travel", "flight", "runway", "ticket", "bag", "passport", "waiting", "terminal", "security", "arrive", "depart", "check-in", "sky", "gate", "seat", "big", "international", "board", "pilot"],
  },
  {
    word: "caterpillar",
    clues: ["insect", "green", "small", "plant", "leaf", "crawl", "soft", "nature", "grow", "future", "butterfly", "eat", "outside", "garden", "body", "segment", "cute", "slow", "animal", "worm"],
  },
  {
    word: "avocado",
    clues: ["fruit", "green", "soft", "seed", "smooth", "buttery", "salad", "healthy", "food", "tree", "fresh", "slice", "cream", "kitchen", "rich", "mexico", "eat", "market", "snack", "pit"],
  },
  {
    word: "lighthouse",
    clues: ["sea", "tower", "light", "guide", "boat", "night", "shine", "warning", "coast", "tall", "signal", "safety", "storm", "rock", "structure", "white", "view", "circle", "beam", "island"],
  },
  {
    word: "subway",
    clues: ["train", "underground", "city", "fast", "rail", "station", "crowd", "commute", "ticket", "tunnel", "ride", "public", "door", "track", "noise", "stop", "platform", "line", "map", "transport"],
  },
  {
    word: "parrot",
    clues: ["bird", "tropical", "colorful", "green", "talk", "pet", "wing", "tree", "fruit", "jungle", "sound", "feather", "fly", "beak", "smart", "animal", "nature", "cage", "learn", "copy"],
  },
  {
    word: "scissors",
    clues: ["cut", "tool", "sharp", "metal", "paper", "hand", "school", "craft", "open", "close", "finger", "blade", "small", "desk", "use", "object", "item", "shape", "edge", "snip"],
  },
  {
    word: "firefighter",
    clues: ["fire", "helmet", "rescue", "truck", "danger", "water", "team", "house", "emergency", "hose", "protect", "uniform", "work", "save", "alarm", "city", "street", "red", "help", "duty"],
  },
  {
    word: "backpack",
    clues: ["bag", "school", "carry", "zipper", "book", "strap", "shoulder", "travel", "item", "pocket", "daily", "small", "pack", "stuff", "student", "walk", "black", "fabric", "store", "light"],
  },
  {
    word: "freezer",
    clues: ["cold", "ice", "food", "kitchen", "frozen", "box", "white", "door", "store", "meat", "ice cream", "cube", "freeze", "keep", "long", "cold air", "plastic", "tray", "temperature", "preserve"],
  },
  {
    word: "stadium",
    clues: ["sport", "crowd", "big", "seat", "team", "game", "field", "ball", "arena", "match", "fans", "noise", "event", "grass", "score", "flag", "night", "light", "ticket", "players"],
  },
  {
    word: "marathon",
    clues: ["run", "long", "race", "finish", "sport", "athlete", "street", "fast", "number", "start", "water", "training", "city", "sweat", "distance", "record", "event", "crowd", "day", "winner"],
  },
  {
    word: "toaster",
    clues: ["bread", "kitchen", "heat", "breakfast", "brown", "pop", "button", "electric", "slice", "hot", "food", "counter", "small", "toast", "timer", "metal", "machine", "daily", "snack", "cook"],
  },
  {
    word: "penguin",
    clues: ["snow", "cold", "ice", "black", "white", "bird", "waddle", "cute", "swim", "antarctic", "group", "animal", "small", "flippers", "slide", "family", "fish", "cold water", "walk", "feather"],
  },
  {
    word: "compass",
    clues: ["north", "south", "east", "west", "direction", "tool", "navigation", "needle", "circle", "travel", "metal", "guide", "find", "map", "adventure", "outdoor", "explore", "point", "turn", "position"],
  },
  {
    word: "shampoo",
    clues: ["hair", "wash", "bathroom", "liquid", "soap", "clean", "foam", "smell", "bottle", "water", "shower", "care", "rub", "rinse", "fresh", "daily", "use", "product", "beauty", "shine"],
  },
  {
    word: "cucumber",
    clues: ["green", "vegetable", "fresh", "salad", "water", "long", "smooth", "slice", "eat", "healthy", "garden", "plant", "food", "seeds", "cool", "crunchy", "kitchen", "grow", "soft", "light"],
  },
  {
    word: "suitcase",
    clues: ["travel", "bag", "carry", "handle", "clothes", "trip", "airport", "wheel", "pack", "zipper", "hotel", "item", "check-in", "storage", "square", "big", "heavy", "move", "compartment", "journey"],
  },
  {
    word: "planet",
    clues: ["space", "round", "orbit", "sun", "earth", "moon", "sky", "stars", "solar system", "galaxy", "science", "object", "big", "dark", "shine", "gas", "rock", "life", "astronomy", "universe"],
  },
  {
    word: "harbor",
    clues: ["sea", "boat", "dock", "water", "ship", "port", "travel", "anchor", "fishing", "trade", "cargo", "rope", "coast", "bay", "seagull", "loading", "crew", "ocean", "container", "pier"],
  },
  {
    word: "mailman",
    clues: ["letter", "package", "bag", "uniform", "house", "walk", "bike", "street", "mailbox", "post", "daily", "send", "deliver", "route", "public", "job", "card", "parcel", "address", "service"],
  },
  {
    word: "pancake",
    clues: ["breakfast", "round", "sweet", "soft", "syrup", "butter", "pan", "kitchen", "batter", "food", "plate", "hot", "flour", "stack", "morning", "snack", "delicious", "meal", "eat", "fork"],
  },
  {
    word: "castle",
    clues: ["king", "queen", "tower", "stone", "drawbridge", "medieval", "history", "knight", "guard", "wall", "window", "gate", "kingdom", "old", "royal", "flag", "village", "story", "legend", "family"],
  },
  {
    word: "magnet",
    clues: ["metal", "stick", "pull", "north", "south", "force", "object", "science", "piece", "strong", "hold", "connect", "energy", "iron", "tool", "surface", "small", "push", "attract", "repel"],
  },
  {
    word: "notebook",
    clues: ["write", "paper", "school", "study", "book", "line", "note", "pencil", "pen", "idea", "class", "page", "cover", "open", "close", "desk", "subject", "learning", "word", "record"],
  },
  {
    word: "sunflower",
    clues: ["yellow", "flower", "tall", "garden", "field", "seed", "summer", "sun", "bright", "grow", "nature", "petal", "leaf", "stem", "farm", "plant", "outside", "beautiful", "big", "circle"],
  },

  {
    word: "elevator",
    clues: ["up", "down", "building", "button", "lift", "floor", "door", "close", "open", "metal", "box", "ride", "move", "slow", "cable", "inside", "crowd", "office", "public", "vertical"],
  },
  {
    word: "raincoat",
    clues: ["rain", "coat", "yellow", "wear", "wet", "street", "hood", "storm", "clothes", "umbrella", "water", "plastic", "walk", "drop", "coat", "weather", "protect", "outside", "wind", "jacket"],
  },
  {
    word: "microscope",
    clues: ["science", "small", "see", "tiny", "cell", "lens", "lab", "study", "glass", "tool", "observe", "research", "biology", "slide", "light", "detail", "object", "experiment", "scientist", "zoom"],
  },
  {
    word: "treasure",
    clues: ["gold", "box", "island", "pirate", "hidden", "map", "old", "dig", "jewel", "secret", "story", "adventure", "sea", "lake", "hunt", "find", "clue", "value", "worth", "lock"],
  },
  {
    word: "pineapple",
    clues: ["fruit", "yellow", "sweet", "tropical", "juice", "fresh", "spiky", "green", "food", "slice", "hard", "skin", "summer", "tree", "eat", "taste", "crown", "brown", "market", "snack"],
  },
  {
    word: "mail",
    clues: ["letter", "send", "receive", "post", "paper", "package", "mailbox", "write", "address", "stamp", "card", "deliver", "sorting", "office", "service", "box", "parcel", "messenger", "route", "item"],
  },
  {
    word: "rocket",
    clues: ["space", "fire", "launch", "astronaut", "sky", "speed", "engine", "NASA", "moon", "fuel", "flight", "travel", "ship", "metal", "smoke", "mission", "orbit", "science", "planet", "stars"],
  },
  {
    word: "painting",
    clues: ["art", "color", "brush", "canvas", "frame", "gallery", "picture", "draw", "artist", "line", "shape", "wall", "museum", "create", "design", "oil", "watercolor", "portrait", "scene", "image"],
  },
  {
    word: "kangaroo",
    clues: ["animal", "jump", "australia", "pouch", "strong", "tail", "brown", "grass", "wild", "fast", "nature", "forest", "big", "boxer", "hop", "mammal", "baby", "walk", "land", "cute"],
  },
  {
    word: "skyscraper",
    clues: ["tall", "building", "city", "glass", "office", "lift", "floor", "high", "tower", "modern", "window", "structure", "height", "street", "big", "urban", "work", "view", "sky", "architecture"],
  },
  {
    word: "flashlight",
    clues: ["light", "dark", "battery", "hand", "tool", "night", "help", "search", "shine", "beam", "button", "carry", "small", "bright", "emergency", "camp", "outdoor", "object", "power", "torch"],
  },
  {
    word: "honey",
    clues: ["sweet", "bee", "yellow", "food", "taste", "flower", "sticky", "jar", "natural", "sugar", "thick", "comb", "spread", "tea", "breakfast", "golden", "liquid", "healthy", "sweetener", "insect"],
  },
  {
    word: "dentist",
    clues: ["tooth", "doctor", "clean", "white", "clinic", "checkup", "drill", "chair", "health", "pain", "brush", "x-ray", "care", "gum", "patient", "mouth", "tool", "medicine", "smile", "teeth"],
  },
  {
    word: "diamond",
    clues: ["gem", "shine", "ring", "hard", "expensive", "clear", "cut", "sparkle", "stone", "white", "jewel", "luxury", "crystal", "mine", "gift", "value", "bright", "rare", "rock", "wedding"],
  },
  {
    word: "sculpture",
    clues: ["art", "stone", "shape", "gallery", "carve", "artist", "museum", "design", "create", "statue", "3D", "figure", "handmade", "tool", "display", "form", "material", "work", "craft", "object"],
  },
  {
    word: "giraffe",
    clues: ["tall", "animal", "yellow", "brown", "spots", "Africa", "neck", "legs", "savanna", "leaf", "tree", "wild", "run", "cute", "horn", "herbivore", "zoo", "nature", "walk", "big"],
  },
  {
    word: "harp",
    clues: ["instrument", "string", "music", "sound", "play", "finger", "soft", "classical", "concert", "gold", "wood", "seat", "tone", "angel", "melody", "performance", "tall", "beautiful", "pluck", "gentle"],
  },
  {
    word: "pyramid",
    clues: ["Egypt", "desert", "triangle", "sand", "ancient", "stone", "pharaoh", "tomb", "big", "history", "mummy", "hot", "sun", "shape", "monument", "old", "travel", "tourist", "build", "world"],
  },
  {
    word: "helicopter",
    clues: ["air", "fly", "blades", "rescue", "sky", "pilot", "sound", "fast", "machine", "seat", "transport", "hover", "military", "police", "engine", "view", "search", "move", "land", "vehicle"],
  },
  {
    word: "accordion",
    clues: ["instrument", "music", "buttons", "fold", "sound", "play", "hand", "melody", "concert", "band", "old", "folk", "air", "push", "pull", "portable", "performance", "keys", "culture", "note"],
  },
  {
    word: "sailboat",
    clues: ["sea", "boat", "wind", "water", "travel", "white", "ocean", "sail", "rope", "wave", "sun", "ship", "trip", "mast", "lake", "wood", "speed", "move", "coast", "blue"],
  },
  {
    word: "rainbow",
    clues: ["color", "sky", "rain", "sun", "arc", "beautiful", "bright", "weather", "light", "rare", "nature", "look", "curve", "peace", "multicolor", "after rain", "cloud", "shine", "blue", "magic"],
  },
  {
    word: "whistle",
    clues: ["sound", "blow", "small", "silver", "coach", "sport", "signal", "air", "tool", "noise", "mouth", "loud", "practice", "referee", "call", "police", "object", "plastic", "use", "high"],
  },
  {
    word: "wheelchair",
    clues: ["chair", "wheel", "push", "hospital", "patient", "sit", "move", "hand", "help", "care", "injury", "support", "transport", "seat", "roll", "metal", "health", "assist", "path", "device"],
  },
  {
    word: "forest",
    clues: ["trees", "green", "nature", "wild", "animal", "wood", "plants", "birds", "fresh", "air", "walk", "trail", "quiet", "leaf", "river", "camp", "mountain", "shade", "moss", "ground"],
  },
  {
    word: "companion",
    clues: ["friend", "partner", "help", "close", "together", "support", "talk", "walk", "family", "trust", "bond", "love", "pet", "life", "relationship", "care", "be with", "near", "kind", "mate"],
  },
  {
    word: "forest",
    clues: ["green", "tree", "wood", "wild", "animal", "bird", "nature", "path", "river", "cool", "fresh", "mountain", "leaf", "plant", "shade", "sound", "insect", "ground", "earth", "quiet"],
  },
  {
    word: "pillowcase",
    clues: ["bed", "cover", "soft", "fabric", "white", "night", "protect", "cotton", "wash", "sleep", "pillow", "clean", "smooth", "room", "hotel", "set", "pair", "match", "cozy", "home"],
  },
  {
    word: "battery",
    clues: ["power", "charge", "energy", "small", "device", "phone", "remote", "run", "store", "electric", "portable", "life", "replace", "plug", "tool", "light", "toy", "metal", "capacity", "cell"],
  },
  {
    word: "planetarium",
    clues: ["stars", "sky", "space", "show", "dark", "room", "dome", "screen", "galaxy", "education", "science", "light", "projector", "view", "planet", "astronomy", "solar", "moon", "learning", "seat"],
  },
  {
    word: "icicle",
    clues: ["cold", "ice", "winter", "drop", "freeze", "roof", "sharp", "long", "clear", "snow", "water", "weather", "hang", "thin", "danger", "white", "frozen", "nature", "crystal", "cool"],
  },
  {
    word: "saxophone",
    clues: ["music", "instrument", "gold", "jazz", "band", "blow", "sound", "keys", "melody", "performance", "loud", "concert", "note", "musician", "song", "shine", "metal", "tone", "play", "rhythm"],
  },
  {
    word: "pizzeria",
    clues: ["pizza", "food", "oven", "cheese", "restaurant", "slice", "menu", "dough", "bake", "eat", "serve", "table", "kitchen", "waiter", "order", "taste", "hot", "tomato", "pepperoni", "shop"],
  },
  {
    word: "necklace",
    clues: ["jewelry", "wear", "neck", "gold", "silver", "chain", "gift", "pretty", "wedding", "stone", "dress", "shine", "bead", "accessory", "fashion", "small", "value", "pendant", "string", "decor"],
  },
  {
    word: "campfire",
    clues: ["fire", "night", "warm", "camp", "wood", "light", "smoke", "outdoor", "cook", "circle", "friends", "story", "glow", "spark", "flame", "gather", "heat", "marshmallow", "stick", "ground"],
  },
  {
    word: "passport",
    clues: ["travel", "country", "document", "id", "airport", "visa", "book", "stamp", "paper", "official", "trip", "identity", "border", "check", "bag", "photo", "control", "safe", "require", "international"],
  },
  {
    word: "laundry",
    clues: ["wash", "clothes", "soap", "clean", "machine", "dry", "water", "basket", "hang", "home", "daily", "fabric", "dirty", "fold", "fresh", "house", "repeat", "detergent", "white", "pile"],
  },
  {
    word: "window",
    clues: ["glass", "open", "close", "frame", "house", "room", "light", "see", "clear", "curtain", "view", "wall", "square", "wind", "sun", "sky", "street", "look", "outside", "inside"],
  },
  {
    word: "waterfall",
    clues: ["water", "fall", "nature", "river", "rock", "forest", "sound", "wet", "fresh", "beautiful", "spray", "flow", "stream", "wild", "blue", "height", "cold", "travel", "scenery", "natural"],
  },
  {
    word: "traffic",
    clues: ["car", "road", "street", "crowd", "busy", "light", "stop", "go", "wait", "drive", "city", "horn", "signal", "bike", "bus", "lane", "speed", "travel", "rush", "jam"],
  },
  {
    word: "accordion",
    clues: ["music", "instrument", "fold", "keys", "sound", "push", "pull", "melody", "band", "old", "folk", "note", "concert", "air", "button", "perform", "culture", "tone", "portable", "hand"],
  },
  {
    word: "jacket",
    clues: ["wear", "warm", "clothes", "coat", "zipper", "pocket", "winter", "fashion", "black", "fabric", "body", "shirt", "cold", "outside", "style", "hood", "thick", "daily", "top", "sleeve"],
  },
  {
    word: "violin",
    clues: ["music", "string", "bow", "sound", "concert", "soft", "classical", "instrument", "wood", "melody", "tone", "note", "play", "musician", "orchestra", "practice", "hand", "beautiful", "art", "song"],
  },
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ========= ELEMAN DOM =========
const btnStart = document.getElementById("btnStart");
const btnAnswer = document.getElementById("btnAnswer");
const btnVoice = document.getElementById("btnVoice");

const answerInput = document.getElementById("answer");
const clueEl = document.getElementById("clue");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");

const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");

const difficultySelect = document.getElementById("difficulty");
const musicToggle = document.getElementById("musicToggle");
const highscoreEl = document.getElementById("highscore");

const tickAudio = document.getElementById("tick");
const soundCorrect = document.getElementById("soundCorrect");
const soundWrong = document.getElementById("soundWrong");
const bgMusic = document.getElementById("bgMusic");

// ========= STATE GAME =========
let currentIndex = 0;
let clueIndex = 0;
let score = 0;
let timeLeft = 20;
let timerInterval = null;
let gameRunning = false;
let difficulty = "normal";

let voiceEnabled = false; // apakah voice diaktifkan (set oleh tombol START)

// SpeechRecognition
let SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let micActive = false; // apakah mic saat ini aktif mendengarkan
let pendingRestart = null; // timeout ID untuk restart mic

// Load last score
const lastScore = localStorage.getItem("lastScore") || 0;
highscoreEl.textContent = `Last Score: ${lastScore}`;

// ========= UTIL =========
function sanitize(text) {
  return String(text || "")
    .toLowerCase()
    .trim();
}

function updateScoreDisplay() {
  scoreEl.textContent = `Score: ${score}`;
}
function updateLevelDisplay() {
  levelEl.textContent = `Level: ${currentIndex + 1} / ${data.length}`;
}

function playTick() {
  try {
    tickAudio.currentTime = 0;
    tickAudio.play();
  } catch (e) {}
}
function playCorrect() {
  try {
    soundCorrect.currentTime = 0;
    soundCorrect.play();
  } catch (e) {}
}
function playWrong() {
  try {
    soundWrong.currentTime = 0;
    soundWrong.play();
  } catch (e) {}
}

// ========= Difficulty =========
function getTimeForDifficulty(diff) {
  if (diff === "easy") return 90;
  if (diff === "hard") return 40;
  return 60; // normal -> 20s per word (lebih wajar untuk 20 clue)
}

// ========= TIMER =========
function startTimer() {
  stopTimer();
  const total = getTimeForDifficulty(difficulty);

  timeLeft = total;
  timerText.textContent = `Time: ${timeLeft}s`;
  timerFill.style.width = `100%`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = `Time: ${timeLeft}s`;
    timerFill.style.width = `${(timeLeft / total) * 100}%`;

    if (timeLeft <= 5 && timeLeft > 0) {
      playTick();
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endRound(false, "Time is over");
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ========= SHOW CLUE =========
function showClue() {
  const item = data[currentIndex];

  if (!item) return;

  if (clueIndex >= item.clues.length) {
    clueEl.textContent = `Clue habis! Jawaban: ${item.word}`;
    setTimeout(() => endRound(false, "Clue habis"), 900);
    return;
  }

  clueEl.textContent = item.clues[clueIndex];
}

// ========= END ROUND =========
function endRound(correct, reason) {
  stopTimer();
  gameRunning = false;

  // stop mic apabila aktif
  if (recognition && micActive) {
    try {
      recognition.stop();
    } catch (e) {}
    micActive = false;
  }

  if (correct) {
    playCorrect();
    score += 10000; // tetap seperti semula, bisa disesuaikan
    updateScoreDisplay();
    clueEl.textContent = `You are right: ${data[currentIndex].word}`;
  } else {
    playWrong();
    clueEl.textContent = `${reason} Jawaban: ${data[currentIndex].word}`;
  }

  setTimeout(() => {
    nextWord();
  }, 3500);
}

// ========= NEXT WORD =========
function nextWord() {
  currentIndex++;
  clueIndex = 0;

  if (currentIndex >= data.length) {
    clueEl.textContent = `Game selesai! Total Score: ${score}`;
    localStorage.setItem("lastScore", score);
    highscoreEl.textContent = `Last Score: ${score}`;
    gameRunning = false;
    stopTimer();
    // pastikan mic mati
    if (recognition && micActive) {
      try {
        recognition.stop();
      } catch (e) {}
      micActive = false;
    }
    return;
  }

  updateLevelDisplay();
  answerInput.value = "";
  startRound();
}

// ========= START ROUND =========
function startRound() {
  if (!data[currentIndex]) return;

  gameRunning = true;
  clueIndex = 0;

  updateLevelDisplay();
  showClue();
  startTimer();

  // jika voice enabled, pastikan mic berjalan
  if (recognition && voiceEnabled && !micActive) {
    startMic();
  }
}

// ========= MANUAL ANSWER =========
btnAnswer.addEventListener("click", () => {
  if (!gameRunning) return;

  const raw = answerInput.value;
  if (!raw) return;

  handleAnswer(sanitize(raw));
  answerInput.value = "";
});

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnAnswer.click();
});

// ========= HANDLE ANSWER =========
function handleAnswer(text) {
  const correct = sanitize(data[currentIndex].word);

  if (text === "pass") {
    // berikan clue selanjutnya
    clueIndex++;
    showClue();
    return;
  }

  if (text === correct) {
    endRound(true, "Benar");
    return;
  }

  // salah
  clueEl.classList.remove("shake");
  void clueEl.offsetWidth;
  clueEl.classList.add("shake");

  playWrong();
  clueIndex++;
  showClue();
}

// =======================================================
//        VOICE RECOGNITION — DIPERBAIKI
// =======================================================
if (SR) {
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true; // biar berkelanjutan

  function startMic() {
    if (!recognition || micActive === true) return;
    try {
      recognition.start();
      micActive = true;
      btnVoice.textContent = "🎤 Listening...";
    } catch (e) {
      // start bisa gagal (mis. permission denied)
      micActive = false;
      btnVoice.textContent = "🎤 Voice";
    }
  }

  function stopMic() {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (e) {}
    micActive = false;
    btnVoice.textContent = "🎤 Voice";
  }

  recognition.addEventListener("result", (ev) => {
    // ambil result terakhir yang tersedia
    const lastIndex = ev.results.length - 1;
    const transcript = ev.results[lastIndex][0].transcript || "";
    const cleaned = sanitize(transcript.replace(/[^a-zA-Z\s]/g, ""));

    // tampilkan raw (bukan sanitized) di input agar user bisa lihat
    answerInput.value = transcript;
    // tapi kirim ke logika hanya versi sanitized
    handleAnswer(cleaned);
  });

  recognition.addEventListener("start", () => {
    btnVoice.textContent = "🎤 Listening...";
    micActive = true;
  });

  recognition.addEventListener("error", (ev) => {
    // beberapa browser melempar error ketika mic belum diizinkan
    console.warn("SpeechRecognition error:", ev.error);
    micActive = false;
    btnVoice.textContent = "🎤 Voice";
  });

  recognition.addEventListener("end", () => {
    // ketika recognition berhenti sendiri, kita coba restart hanya jika game running dan voiceEnabled
    btnVoice.textContent = "🎤 Voice";
    micActive = false;

    if (pendingRestart) {
      clearTimeout(pendingRestart);
      pendingRestart = null;
    }

    if (gameRunning && voiceEnabled) {
      // beri jeda kecil supaya tidak loop start/stop terlalu cepat
      pendingRestart = setTimeout(() => {
        pendingRestart = null;
        startMic();
      }, 250);
    }
  });

  // tombol manual mic (toggle)
  btnVoice.addEventListener("click", () => {
    if (!gameRunning) return; // hanya aktif saat game berjalan

    // tombol ini juga meng-aktifkan voiceEnabled apabila user ingin voice
    voiceEnabled = true;

    if (!micActive) {
      startMic();
    } else {
      stopMic();
    }
  });
} else {
  btnVoice.disabled = true;
  btnVoice.title = "Browser tidak support voice recognition";
}

// =======================================================
//                   START GAME
// =======================================================
btnStart.addEventListener("click", () => {
  shuffle(data); // ⬅ ACak data dulu
  currentIndex = 0; // reset level
  score = 0; // reset score
  updateScoreDisplay();
  updateLevelDisplay();
  startRound();
  difficulty = difficultySelect.value;

  updateLevelDisplay();
  score = 0;
  updateScoreDisplay();

  currentIndex = 0;
  clueIndex = 0;

  if (musicToggle.checked) {
    try {
      bgMusic.currentTime = 0;
      bgMusic.play();
    } catch (e) {}
  } else {
    try {
      bgMusic.pause();
    } catch (e) {}
  }

  // set voiceEnabled true karena user klik Start — sesuai permintaan
  voiceEnabled = true;

  // jika browser memperbolehkan mulai mic dari click handler ini, startMic akan bekerja.
  if (recognition) {
    try {
      startMic();
    } catch (e) {
      // jika gagal, tetap lanjutkan game tanpa mic
      console.warn("Tidak bisa start mic otomatis:", e);
    }
  }

  startRound();
});

// =======================================================
//                   MUSIC TOGGLE
// =======================================================
musicToggle.addEventListener("change", (e) => {
  if (e.target.checked) {
    try {
      bgMusic.volume = 0.35;
      bgMusic.play();
    } catch (e) {}
  } else {
    try {
      bgMusic.pause();
    } catch (e) {}
  }
});

// =======================================================
//                   INIT UI
// =======================================================
(function init() {
  updateScoreDisplay();
  levelEl.textContent = `Level: 0 / ${data.length}`;
  difficultySelect.value = "normal";
})();
