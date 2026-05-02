/**
 * Celestial Horizons & Persona Generator
 * Algorithmic Engine (High Randomness Edition)
 * @author emremutlu
 */

// --- Seeded Randomness ---
class SeededRandom {
    constructor(seed) {
        this.seed = this._hash(seed);
    }
    _hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
    next() {
        this.seed |= 0; this.seed = this.seed + 0x6D2B79F5 | 0;
        let t = Math.imul(this.seed ^ this.seed >>> 15, 1 | this.seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    range(min, max) { return min + this.next() * (max - min); }
    int(min, max) { return Math.floor(this.range(min, max + 1)); }
    choice(arr) { return arr[this.int(0, arr.length - 1)]; }
    boolean(chance = 0.5) { return this.next() < chance; }
}

// --- Color Palettes ---
const HORIZON_PALETTES = [
    { name: "Nordic Night", sky: ["#0f172a", "#1e293b"], accent: "#38bdf8", terrain: ["#1e293b", "#0f172a", "#020617"], celestial: "#f1f5f9" },
    { name: "Sunset Gold", sky: ["#450a0a", "#78350f"], accent: "#facc15", terrain: ["#450a0a", "#1a0404", "#000000"], celestial: "#fde68a" },
    { name: "Vaporwave", sky: ["#2e1065", "#701a75"], accent: "#f472b6", terrain: ["#4c1d95", "#2e1065", "#1e1b4b"], celestial: "#fae8ff" },
    { name: "Deep Forest", sky: ["#064e3b", "#065f46"], accent: "#34d399", terrain: ["#064e3b", "#022c22", "#011c14"], celestial: "#d1fae5" },
    { name: "Mars Dust", sky: ["#7c2d12", "#9a3412"], accent: "#fb923c", terrain: ["#431407", "#2d0a05", "#1c0702"], celestial: "#ffedd5" }
];

const PERSONA_PALETTES = [
    { name: "Cyberpunk", bg: ["#0f172a", "#1e1b4b"], skin: ["#fca5a5", "#fecaca"], hair: ["#f472b6", "#c026d3", "#06b6d4"], clothes: ["#2dd4bf", "#0f766e", "#312e81"], detail: "#fbbf24" },
    { name: "Nordic", bg: ["#e0f2fe", "#bae6fd"], skin: ["#ffedd5", "#fed7aa"], hair: ["#fef08a", "#eab308", "#94a3b8"], clothes: ["#38bdf8", "#0284c7", "#1e293b"], detail: "#1e293b" },
    { name: "Forest", bg: ["#dcfce7", "#86efac"], skin: ["#fed7aa", "#fdba74"], hair: ["#78350f", "#450a0a", "#14532d"], clothes: ["#166534", "#14532d", "#78350f"], detail: "#facc15" },
    { name: "Midnight", bg: ["#171717", "#0a0a0a"], skin: ["#e5e5e5", "#d4d4d4"], hair: ["#a3a3a3", "#525252", "#171717"], clothes: ["#dc2626", "#991b1b", "#000000"], detail: "#ef4444" },
    { name: "Sunset", bg: ["#ffedd5", "#fbcfe8"], skin: ["#fdba74", "#f97316"], hair: ["#c2410c", "#7c2d12", "#a21caf"], clothes: ["#a21caf", "#701a75", "#be185d"], detail: "#10b981" }
];

// --- Application State ---
const state = {
    mode: 'horizon',
    canvas: null,
    ctx: null,
    seed: Math.random().toString(36).substring(7),
    currentPalette: 0,
    rng: null,
    lightX: null,
    lightY: null
};

// --- Initialization ---
function init() {
    state.canvas = document.getElementById('artCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    const seedInput = document.getElementById('seedInput');
    const randomSeedBtn = document.getElementById('randomSeedBtn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const modeRadios = document.querySelectorAll('input[name="genMode"]');

    seedInput.value = state.seed;

    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(e.target.checked) {
                state.mode = e.target.value;
                state.currentPalette = 0;
                updateUIForMode();
                render();
            }
        });
    });

    randomSeedBtn.onclick = () => {
        state.seed = Math.random().toString(36).substring(7);
        seedInput.value = state.seed;
    };

    generateBtn.onclick = () => {
        state.seed = Math.random().toString(36).substring(7);
        seedInput.value = state.seed;
        render();
    };

    downloadBtn.onclick = download;

    updateUIForMode();

    window.addEventListener('resize', resize);
    resize();
}

function updateUIForMode() {
    const title = document.getElementById('appTitle');
    const subtitle = document.getElementById('appSubtitle');
    const seedLabel = document.getElementById('seedLabel');
    const paletteLabel = document.getElementById('paletteLabel');
    const generateBtn = document.getElementById('generateBtn');
    const paletteList = document.getElementById('paletteList');

    if (state.mode === 'horizon') {
        title.innerText = 'Celestial Horizons';
        subtitle.innerText = 'Algorithmic Art Engine';
        seedLabel.innerText = 'Universe Seed';
        paletteLabel.innerText = 'Atmosphere Palette';
        generateBtn.innerText = 'Generate Horizon';
    } else {
        title.innerText = 'Persona Generator';
        subtitle.innerText = 'Algorithmic Avatars';
        seedLabel.innerText = 'Persona Seed';
        paletteLabel.innerText = 'Character Palette';
        generateBtn.innerText = 'Generate Persona';
    }

    paletteList.innerHTML = '';
    const palettes = state.mode === 'horizon' ? HORIZON_PALETTES : PERSONA_PALETTES;

    palettes.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = `palette-item ${index === state.currentPalette ? 'active' : ''}`;
        
        if (state.mode === 'horizon') {
            div.style.setProperty('--c1', p.sky[0]);
        } else {
            div.style.setProperty('--c1', p.bg[0]);
        }
        
        div.title = p.name;
        div.onclick = () => {
            state.currentPalette = index;
            document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            render(); 
        };
        paletteList.appendChild(div);
    });
}

function resize() {
    state.canvas.width = window.innerWidth * window.devicePixelRatio;
    state.canvas.height = window.innerHeight * window.devicePixelRatio;
    render();
}

function render() {
    const { ctx, canvas, seed } = state;
    state.rng = new SeededRandom(seed);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.mode === 'horizon') {
        renderHorizon();
    } else {
        renderPersona();
    }

    addTexture();
}

// === HORIZON GENERATOR ===
function renderHorizon() {
    const { ctx, canvas, rng } = state;
    const palette = HORIZON_PALETTES[state.currentPalette];

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, palette.sky[0]);
    skyGrad.addColorStop(1, palette.sky[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    renderStars(palette);
    
    // Multiple celestial bodies randomly
    const bodyCount = rng.int(1, 3);
    for(let i=0; i<bodyCount; i++) {
        renderCelestial(palette, i === 0);
    }

    // Mountains with highly randomized layer count
    const layers = rng.int(3, 8);
    for (let i = 0; i < layers; i++) {
        const layerColor = palette.terrain[rng.int(0, palette.terrain.length - 1)];
        renderMountainLayer(i, layers, layerColor, 1.0);
    }
}

function drawGrid() {
    const { ctx, canvas, rng } = state;
    const gridSize = rng.choice([20, 25, 30, 35]); 
    
    // Subtle dots at grid intersections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for(let x=0; x<canvas.width; x+=gridSize) {
        for(let y=0; y<canvas.height; y+=gridSize) {
            if (rng.boolean(0.85)) { 
                ctx.beginPath();
                ctx.arc(x, y, rng.range(0.5, 1.0), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Lines with varied dashed/solid styles and occasional skipped lines
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=gridSize) {
        if (rng.boolean(0.1)) continue; 
        ctx.strokeStyle = rng.boolean(0.2) ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)';
        ctx.setLineDash(rng.boolean(0.5) ? [2, 4] : []);
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=gridSize) {
        if (rng.boolean(0.1)) continue;
        ctx.strokeStyle = rng.boolean(0.2) ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)';
        ctx.setLineDash(rng.boolean(0.5) ? [2, 4] : []);
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
    ctx.setLineDash([]); 

    // Occasional sci-fi crosshairs
    const crosshairCount = rng.int(5, 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for(let i=0; i<crosshairCount; i++) {
        const cx = Math.floor(rng.range(0, canvas.width) / gridSize) * gridSize;
        const cy = Math.floor(rng.range(0, canvas.height) / gridSize) * gridSize;
        const s = rng.choice([4, 8]);
        ctx.beginPath();
        ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
        ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
        ctx.stroke();
    }
}

function renderStars(palette) {
    const { ctx, canvas, rng } = state;
    // High variability in star density
    const count = rng.choice([
        rng.int(30, 80),    // Very sparse
        rng.int(150, 400),  // Medium
        rng.int(600, 1200)  // Very dense
    ]);
    ctx.fillStyle = palette.celestial;
    for (let i = 0; i < count; i++) {
        const x = rng.range(0, canvas.width);
        const y = rng.range(0, canvas.height * rng.range(0.4, 0.9));
        const size = rng.range(0.5, 2.5);
        ctx.globalAlpha = rng.range(0.2, 0.9);
        
        if (rng.boolean(0.2)) {
            // Sparkle / 4-point star
            ctx.beginPath();
            ctx.moveTo(x, y - size*3);
            ctx.quadraticCurveTo(x, y, x + size*3, y);
            ctx.quadraticCurveTo(x, y, x, y + size*3);
            ctx.quadraticCurveTo(x, y, x - size*3, y);
            ctx.quadraticCurveTo(x, y, x, y - size*3);
            ctx.fill();
        } else {
            // Normal dot star
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1.0;
}

function renderCelestial(palette, isMain) {
    const { ctx, canvas, rng } = state;
    const x = rng.range(canvas.width * 0.1, canvas.width * 0.9);
    const y = rng.range(canvas.height * 0.1, canvas.height * 0.5);
    const radius = isMain ? rng.range(60, 150) : rng.range(10, 40);

    if (isMain) {
        state.lightX = x;
        state.lightY = y;
        
        const glow = ctx.createRadialGradient(x, y, radius, x, y, radius * 3);
        glow.addColorStop(0, palette.accent + '44');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = isMain ? palette.celestial : rng.choice(palette.sky);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function renderMountainLayer(index, total, color, alpha) {
    const { ctx, canvas, rng } = state;
    const points = [];
    const segments = Math.pow(2, rng.int(6, 8)); // 64 to 256 segments
    const width = canvas.width;
    const height = canvas.height;
    
    const baseHeight = height * (rng.range(0.2, 0.6) + (index / total) * 0.4);
    const roughness = rng.range(0.3, 0.7) - (index * 0.02);
    let displacement = height * rng.range(0.1, 0.4);

    points[0] = baseHeight + rng.range(-displacement, displacement);
    points[segments] = baseHeight + rng.range(-displacement, displacement);

    for (let i = 1; i < segments; i *= 2) {
        for (let j = (segments / i) / 2; j < segments; j += segments / i) {
            points[j] = (points[j - (segments / i) / 2] + points[j + (segments / i) / 2]) / 2 + rng.range(-displacement, displacement);
        }
        displacement *= roughness;
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i <= segments; i++) {
        ctx.lineTo((i / segments) * width, points[i]);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Dynamic Rim Lighting from Celestial Body
    if (state.lightX !== null) {
        let currentStroke = [];
        const strokes = [];
        
        for (let i = 0; i < segments; i++) {
            const x1 = (i / segments) * width;
            const y1 = points[i];
            const x2 = ((i + 1) / segments) * width;
            // Calculate MACRO slope to ignore the fractal micro-jaggedness
            // This prevents the line from breaking at every tiny bump
            const step = Math.max(1, Math.floor(segments / 16));
            const lookBehind = Math.max(0, i - step);
            const lookAhead = Math.min(segments, i + step);
            const macroY1 = points[lookBehind];
            const macroY2 = points[lookAhead];

            // Determine if the macro-slope faces the light source
            const facesLight = (x1 < state.lightX && macroY1 > macroY2) || (x1 > state.lightX && macroY2 > macroY1);
            
            if (facesLight) {
                if (currentStroke.length === 0) {
                    currentStroke.push({x: x1, y: y1});
                }
                currentStroke.push({x: x2, y: y2});
            } else {
                if (currentStroke.length > 0) {
                    strokes.push(currentStroke);
                    currentStroke = [];
                }
            }
        }
        if (currentStroke.length > 0) strokes.push(currentStroke);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let stroke of strokes) {
            // Eliminate short glares entirely. Only keep medium/long strokes.
            // Segments count is between 64 and 256. A length of 10 ensures it spans a decent chunk.
            if (stroke.length < 10) continue;
            
            const cx = (stroke[0].x + stroke[stroke.length-1].x) / 2;
            const cy = (stroke[0].y + stroke[stroke.length-1].y) / 2;
            
            const dist = Math.hypot(cx - state.lightX, cy - state.lightY);
            const maxDist = canvas.width * 0.8;
            const baseIntensity = Math.max(0, 1 - (dist / maxDist));
            
            if (baseIntensity < 0.05) continue;
            
            // Create a gradient so the stroke fades out smoothly at both ends
            const grad = ctx.createLinearGradient(stroke[0].x, stroke[0].y, stroke[stroke.length-1].x, stroke[stroke.length-1].y);
            const peakOpacity = baseIntensity * rng.range(0.3, 1.0); // varied brightness
            
            grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
            grad.addColorStop(0.2, `rgba(255, 255, 255, ${peakOpacity})`);
            grad.addColorStop(0.8, `rgba(255, 255, 255, ${peakOpacity})`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = rng.range(0.3, 1.0); // Even thinner lines
            
            // Add a soft glow (blur)
            ctx.shadowColor = `rgba(255, 255, 255, ${peakOpacity})`;
            ctx.shadowBlur = rng.range(3, 8); // Tighter glow to keep it extremely thin
            
            ctx.stroke();
            
            // Reset shadow to not affect other drawings
            ctx.shadowBlur = 0;
        }
    }

    // Add random trees to the front-most layers
    if (index >= total - 2) {
        const treeCount = rng.int(10, 40);
        ctx.fillStyle = rng.choice(['#000000', color, palette.terrain[0]]);
        ctx.globalAlpha = 1.0;
        for(let t = 0; t < treeCount; t++) {
            const pxIndex = rng.int(0, segments);
            const tx = (pxIndex / segments) * width;
            const ty = points[pxIndex] + rng.range(0, height*0.02); // sink slightly into ground
            
            // Abstract geometric pine tree
            const twidth = width * rng.range(0.005, 0.015);
            const theight = height * rng.range(0.05, 0.15);
            
            // Randomly flip tree direction slightly for wind effect
            const wind = rng.range(-twidth*0.5, twidth*0.5);
            
            ctx.beginPath();
            ctx.moveTo(tx + wind, ty - theight);
            ctx.lineTo(tx + twidth, ty);
            ctx.lineTo(tx - twidth, ty);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1.0;
}

// === PERSONA GENERATOR ===
function renderPersona() {
    const { ctx, canvas, rng } = state;
    const palette = PERSONA_PALETTES[state.currentPalette];

    const cx = canvas.width / 2 + rng.range(-50, 50); // Slight off-center randomness
    const cy = canvas.height / 2 + rng.range(-30, 30);
    const scale = Math.min(canvas.width, canvas.height) * rng.range(0.3, 0.5);

    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, palette.bg[0]);
    bgGrad.addColorStop(1, palette.bg[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Random graphic backdrop elements
    if (rng.boolean(0.5)) {
        ctx.fillStyle = palette.clothes[0] + '33';
        ctx.beginPath();
        if (rng.boolean()) {
            ctx.arc(cx, cy, scale * 1.5, 0, Math.PI * 2);
        } else {
            ctx.rect(cx - scale*1.2, cy - scale*1.2, scale*2.4, scale*2.4);
        }
        ctx.fill();
    }

    renderBody(cx, cy, scale, palette);
    renderHead(cx, cy, scale, palette);
    renderFace(cx, cy, scale, palette);
    renderHair(cx, cy, scale, palette);
}

function renderBody(cx, cy, scale, palette) {
    const { ctx, rng } = state;
    ctx.fillStyle = rng.choice(palette.clothes);
    ctx.beginPath();
    
    const shoulderWidth = scale * rng.range(0.5, 1.5);
    const bodyHeight = state.canvas.height;
    const bodyType = rng.int(0, 4);
    
    if (bodyType === 0) {
        // Round shoulders going to the bottom
        ctx.moveTo(cx - shoulderWidth, cy + bodyHeight);
        ctx.lineTo(cx - shoulderWidth, cy + scale * 1.0);
        ctx.ellipse(cx, cy + scale * 1.0, shoulderWidth, scale * rng.range(0.5, 1.0), 0, Math.PI, 0);
        ctx.lineTo(cx + shoulderWidth, cy + bodyHeight);
        ctx.closePath();
    } else if (bodyType === 1) {
        ctx.roundRect(cx - shoulderWidth, cy + scale * 0.4, shoulderWidth * 2, bodyHeight, [scale * rng.range(0, 0.5), scale * rng.range(0, 0.5), 0, 0]);
    } else if (bodyType === 2) {
        ctx.moveTo(cx - shoulderWidth, cy + bodyHeight);
        ctx.lineTo(cx - shoulderWidth * rng.range(0.2, 0.8), cy + scale * 0.4);
        ctx.lineTo(cx + shoulderWidth * rng.range(0.2, 0.8), cy + scale * 0.4);
        ctx.lineTo(cx + shoulderWidth, cy + bodyHeight);
        ctx.closePath();
    } else {
        // Blobby shoulders
        ctx.moveTo(cx - shoulderWidth*1.5, cy + bodyHeight);
        ctx.bezierCurveTo(cx - shoulderWidth, cy + scale*0.5, cx + shoulderWidth, cy + scale*0.5, cx + shoulderWidth*1.5, cy + bodyHeight);
        ctx.closePath();
    }
    ctx.fill();

    // Collar / Details
    if (rng.boolean(0.7)) {
        ctx.fillStyle = rng.choice(palette.clothes);
        ctx.beginPath();
        if (rng.boolean()) {
            ctx.arc(cx, cy + scale * rng.range(0.3, 0.6), scale * rng.range(0.2, 0.5), 0, Math.PI, false);
        } else {
            ctx.moveTo(cx, cy + scale * rng.range(0.8, 1.2));
            ctx.lineTo(cx - scale*0.4, cy + scale * 0.4);
            ctx.lineTo(cx + scale*0.4, cy + scale * 0.4);
            ctx.closePath();
        }
        ctx.fill();
    }
}

function renderHead(cx, cy, scale, palette) {
    const { ctx, rng } = state;
    ctx.fillStyle = rng.choice(palette.skin);
    
    const headWidth = scale * rng.range(0.4, 0.9);
    const headHeight = scale * rng.range(0.5, 1.0);
    const headType = rng.int(0, 3);

    ctx.beginPath();
    if (headType === 0) {
        ctx.ellipse(cx, cy - scale * 0.1, headWidth, headHeight, 0, 0, Math.PI * 2);
    } else if (headType === 1) {
        ctx.roundRect(cx - headWidth, cy - scale * 0.1 - headHeight, headWidth * 2, headHeight * 2, scale * rng.range(0.1, 0.5));
    } else if (headType === 2) {
        ctx.moveTo(cx, cy - scale * 0.1 - headHeight);
        ctx.lineTo(cx + headWidth, cy - scale * 0.1 - headHeight * 0.5);
        ctx.lineTo(cx + headWidth, cy - scale * 0.1 + headHeight * 0.5);
        ctx.lineTo(cx, cy - scale * 0.1 + headHeight);
        ctx.lineTo(cx - headWidth, cy - scale * 0.1 + headHeight * 0.5);
        ctx.lineTo(cx - headWidth, cy - scale * 0.1 - headHeight * 0.5);
        ctx.closePath();
    } else {
        // Blobby abstract head
        ctx.moveTo(cx, cy - headHeight);
        ctx.bezierCurveTo(cx + headWidth*1.5, cy - headHeight*0.8, cx + headWidth*0.8, cy + headHeight, cx, cy + headHeight*0.9);
        ctx.bezierCurveTo(cx - headWidth*1.2, cy + headHeight, cx - headWidth*1.5, cy - headHeight*0.5, cx, cy - headHeight);
        ctx.closePath();
    }
    ctx.fill();
}

function renderFace(cx, cy, scale, palette) {
    const { ctx, rng } = state;
    
    const eyeOffsetX = scale * rng.range(0.15, 0.45);
    const eyeOffsetY = cy - scale * rng.range(-0.1, 0.35);
    const eyeSize = scale * rng.range(0.02, 0.2);
    const eyeType = rng.int(0, 4);
    
    ctx.fillStyle = '#1e293b'; 
    
    // Eyes
    for(let dir of [-1, 1]) {
        // Alien cyclops chance
        if (dir === 1 && rng.boolean(0.1)) continue; 
        
        const x = cx + eyeOffsetX * dir + rng.range(-10, 10);
        const y = eyeOffsetY + rng.range(-10, 10);

        ctx.beginPath();
        if (eyeType === 0) {
            ctx.arc(x, y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (eyeType === 1) {
            ctx.lineWidth = scale * rng.range(0.02, 0.05);
            ctx.lineCap = 'round';
            ctx.moveTo(x - eyeSize, y);
            ctx.lineTo(x + eyeSize, y);
            ctx.stroke();
        } else if (eyeType === 2) {
            ctx.lineWidth = scale * 0.03;
            ctx.lineCap = 'round';
            ctx.arc(x, y, eyeSize, Math.PI, 0);
            ctx.stroke();
        } else if (eyeType === 3) {
            ctx.strokeRect(x - eyeSize, y - eyeSize*0.5, eyeSize*2, eyeSize);
        } else {
            ctx.ellipse(x, y, eyeSize * rng.range(0.6, 1.2), eyeSize * rng.range(0.8, 1.5), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + eyeSize*0.2, y - eyeSize*0.4, eyeSize*0.3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#1e293b';
        }
    }

    // Abstract facial marks (Blush / Tattoos)
    if (rng.boolean(0.6)) {
        ctx.fillStyle = rng.choice([palette.detail, 'rgba(244, 114, 182, 0.5)']);
        ctx.beginPath();
        if(rng.boolean()) {
            ctx.arc(cx - eyeOffsetX, eyeOffsetY + eyeSize * 2, eyeSize, 0, Math.PI*2);
            ctx.arc(cx + eyeOffsetX, eyeOffsetY + eyeSize * 2, eyeSize, 0, Math.PI*2);
        } else {
            ctx.rect(cx - eyeOffsetX*1.5, eyeOffsetY + eyeSize*1.5, eyeOffsetX*3, eyeSize*0.5);
        }
        ctx.fill();
    }

    // Mouth
    const mouthY = cy + scale * rng.range(0.1, 0.4);
    const mouthWidth = scale * rng.range(0.05, 0.3);
    const mouthType = rng.int(0, 4);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = scale * rng.range(0.02, 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();

    if (mouthType === 0) {
        ctx.moveTo(cx - mouthWidth, mouthY + rng.range(-10, 10));
        ctx.lineTo(cx + mouthWidth, mouthY + rng.range(-10, 10));
        ctx.stroke();
    } else if (mouthType === 1) {
        ctx.arc(cx, mouthY - mouthWidth*rng.range(0.5,1.5), mouthWidth, 0, Math.PI);
        ctx.stroke();
    } else if (mouthType === 2) {
        ctx.fillStyle = '#1e293b';
        ctx.ellipse(cx, mouthY, mouthWidth, mouthWidth * rng.range(0.2, 1.5), rng.range(-0.2, 0.2), 0, Math.PI * 2);
        ctx.fill();
    } else if (mouthType === 3) {
        ctx.arc(cx, mouthY + mouthWidth, mouthWidth, Math.PI, 0);
        ctx.stroke();
    } else {
        // Squiggly mouth
        ctx.moveTo(cx - mouthWidth, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + mouthWidth, cx + mouthWidth, mouthY - mouthWidth*0.5);
        ctx.stroke();
    }
}

function renderHair(cx, cy, scale, palette) {
    const { ctx, rng } = state;
    
    // Hair is optional, high randomness
    if (rng.boolean(0.15)) return;

    ctx.fillStyle = rng.choice(palette.hair);
    const hairType = rng.int(0, 4);
    const headTop = cy - scale * rng.range(0.6, 1.2);
    const headWidth = scale * rng.range(0.5, 1.0);

    ctx.beginPath();
    if (hairType === 0) {
        const clumps = rng.int(8, 25);
        for(let i=0; i<clumps; i++) {
            const hx = cx + rng.range(-headWidth*1.5, headWidth*1.5);
            const hy = headTop + rng.range(-scale*0.5, scale*0.8);
            const hr = rng.range(scale*0.1, scale*0.6);
            ctx.moveTo(hx, hy);
            ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        }
        ctx.fill();
    } else if (hairType === 1) {
        // Wild spikes
        ctx.moveTo(cx - headWidth*1.2, headTop + scale*0.5);
        const spikes = rng.int(3, 9);
        for(let i=0; i<spikes; i++) {
            ctx.lineTo(cx - headWidth*1.2 + (headWidth * 2.4 * (i/spikes)) + rng.range(-20, 20), headTop - rng.range(scale*0.1, scale*1.2));
            ctx.lineTo(cx - headWidth*1.2 + (headWidth * 2.4 * ((i+1)/spikes)), headTop + scale*0.2);
        }
        ctx.lineTo(cx + headWidth*1.2, headTop + scale*0.5);
        ctx.fill();
    } else if (hairType === 2) {
        // Geometric block
        ctx.rect(cx - headWidth*rng.range(0.8, 1.3), headTop - scale*rng.range(0.1, 0.8), headWidth*rng.range(1.6, 2.6), scale*rng.range(0.5, 1.5));
        ctx.fill();
    } else if (hairType === 3) {
        // Triangle hat / hair
        ctx.moveTo(cx, headTop - scale*rng.range(0.5, 1.5));
        ctx.lineTo(cx + headWidth*1.2, headTop + scale*0.5);
        ctx.lineTo(cx - headWidth*1.2, headTop + scale*0.5);
        ctx.closePath();
        ctx.fill();
    } else {
        // Huge blob
        ctx.ellipse(cx + rng.range(-30,30), headTop + rng.range(-20,20), headWidth*rng.range(1,1.8), scale*rng.range(0.5,1.5), rng.range(-0.5, 0.5), 0, Math.PI*2);
        ctx.fill();
    }

    // Accessories (Glasses/Horns)
    if (rng.boolean(0.4)) {
        ctx.strokeStyle = rng.choice([palette.detail, '#ffffff', '#000000']);
        ctx.lineWidth = scale * rng.range(0.02, 0.08);
        const gw = scale * rng.range(0.2, 0.4);
        const ey = cy - scale * rng.range(0.05, 0.25);
        
        ctx.beginPath();
        const accType = rng.int(0, 2);
        if(accType === 0) {
            // Glasses
            ctx.arc(cx - gw*1.2, ey, gw, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + gw*1.2, ey, gw, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - gw*0.2, ey);
            ctx.lineTo(cx + gw*0.2, ey);
            ctx.stroke();
        } else if (accType === 1) {
            // Cyber Visor
            ctx.fillStyle = ctx.strokeStyle;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(cx - gw*3, ey - gw*0.8, gw*6, gw*1.5);
            ctx.globalAlpha = 1.0;
        } else {
            // Horns/Antennae
            ctx.moveTo(cx - headWidth*0.5, headTop);
            ctx.lineTo(cx - headWidth*0.8, headTop - scale*0.5);
            ctx.moveTo(cx + headWidth*0.5, headTop);
            ctx.lineTo(cx + headWidth*0.8, headTop - scale*0.5);
            ctx.stroke();
        }
    }
}

// === SHARED EFFECTS ===
function addTexture() {
    const { ctx, canvas } = state;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
}

function download() {
    const link = document.createElement('a');
    link.download = `${state.mode}-${state.seed}.png`;
    link.href = state.canvas.toDataURL('image/png');
    link.click();

    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', init);
