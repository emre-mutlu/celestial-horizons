/**
 * Celestial Horizons - Algorithmic Illustration Engine
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
    // Mulberry32
    next() {
        this.seed |= 0; this.seed = this.seed + 0x6D2B79F5 | 0;
        let t = Math.imul(this.seed ^ this.seed >>> 15, 1 | this.seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    range(min, max) { return min + this.next() * (max - min); }
    int(min, max) { return Math.floor(this.range(min, max + 1)); }
}

// --- Color Palettes ---
const PALETTES = [
    { name: "Nordic Night", sky: ["#0f172a", "#1e293b"], accent: "#38bdf8", terrain: ["#1e293b", "#0f172a", "#020617"], celestial: "#f1f5f9" },
    { name: "Sunset Gold", sky: ["#450a0a", "#78350f"], accent: "#facc15", terrain: ["#450a0a", "#1a0404", "#000000"], celestial: "#fde68a" },
    { name: "Vaporwave", sky: ["#2e1065", "#701a75"], accent: "#f472b6", terrain: ["#4c1d95", "#2e1065", "#1e1b4b"], celestial: "#fae8ff" },
    { name: "Deep Forest", sky: ["#064e3b", "#065f46"], accent: "#34d399", terrain: ["#064e3b", "#022c22", "#011c14"], celestial: "#d1fae5" },
    { name: "Mars Dust", sky: ["#7c2d12", "#9a3412"], accent: "#fb923c", terrain: ["#431407", "#2d0a05", "#1c0702"], celestial: "#ffedd5" }
];

// --- Application State ---
const state = {
    canvas: null,
    ctx: null,
    seed: Math.random().toString(36).substring(7),
    currentPalette: 0,
    rng: null
};

// --- Initialization ---
function init() {
    state.canvas = document.getElementById('artCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    window.addEventListener('resize', resize);
    resize();

    // DOM Elements
    const seedInput = document.getElementById('seedInput');
    const randomSeedBtn = document.getElementById('randomSeedBtn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const paletteList = document.getElementById('paletteList');

    seedInput.value = state.seed;

    // Palette Injection
    PALETTES.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = `palette-item ${index === state.currentPalette ? 'active' : ''}`;
        div.style.setProperty('--c1', p.sky[0]);
        div.style.setProperty('--c2', p.accent);
        div.title = p.name;
        div.onclick = () => {
            state.currentPalette = index;
            document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            render();
        };
        paletteList.appendChild(div);
    });

    randomSeedBtn.onclick = () => {
        state.seed = Math.random().toString(36).substring(7);
        seedInput.value = state.seed;
        render();
    };

    generateBtn.onclick = () => {
        state.seed = seedInput.value || Math.random().toString(36).substring(7);
        render();
    };

    downloadBtn.onclick = download;

    render();
}

function resize() {
    state.canvas.width = window.innerWidth * window.devicePixelRatio;
    state.canvas.height = window.innerHeight * window.devicePixelRatio;
    render();
}

// --- Rendering Engine ---
function render() {
    const { ctx, canvas, seed, currentPalette } = state;
    state.rng = new SeededRandom(seed);
    const palette = PALETTES[currentPalette];

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, palette.sky[0]);
    skyGrad.addColorStop(1, palette.sky[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Stars
    renderStars(palette);

    // 3. Celestial Body
    renderCelestial(palette);

    // 4. Mountains (Recursive Midpoint Displacement)
    const layers = 4;
    for (let i = 0; i < layers; i++) {
        const layerColor = palette.terrain[Math.min(i, palette.terrain.length - 1)];
        const layerAlpha = 1 - (i * 0.15);
        renderMountainLayer(i, layers, layerColor, layerAlpha);
    }

    // 5. Grain Texture
    addTexture();
}

function renderStars(palette) {
    const { ctx, canvas, rng } = state;
    const count = 300;
    ctx.fillStyle = palette.celestial;
    for (let i = 0; i < count; i++) {
        const x = rng.range(0, canvas.width);
        const y = rng.range(0, canvas.height * 0.6);
        const size = rng.range(0.5, 2);
        const opacity = rng.range(0.1, 0.8);
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
}

function renderCelestial(palette) {
    const { ctx, canvas, rng } = state;
    const x = rng.range(canvas.width * 0.2, canvas.width * 0.8);
    const y = rng.range(canvas.height * 0.15, canvas.height * 0.35);
    const radius = rng.range(40, 100);

    // Outer Glow
    const glow = ctx.createRadialGradient(x, y, radius, x, y, radius * 3);
    glow.addColorStop(0, palette.accent + '33');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = palette.celestial;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle craters or features
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < 5; i++) {
        const cx = x + rng.range(-radius * 0.5, radius * 0.5);
        const cy = y + rng.range(-radius * 0.5, radius * 0.5);
        const cr = rng.range(2, radius * 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderMountainLayer(index, total, color, alpha) {
    const { ctx, canvas, rng } = state;
    const points = [];
    const segments = Math.pow(2, 7); // 128 segments
    const width = canvas.width;
    const height = canvas.height;
    
    // Base height for this layer
    const baseHeight = height * (0.4 + (index / total) * 0.5);
    const roughness = 0.5 - (index * 0.05);
    let displacement = height * (0.2 - (index * 0.03));

    points[0] = baseHeight + rng.range(-displacement, displacement);
    points[segments] = baseHeight + rng.range(-displacement, displacement);

    // Midpoint Displacement Algorithm
    for (let i = 1; i < segments; i *= 2) {
        for (let j = (segments / i) / 2; j < segments; j += segments / i) {
            points[j] = (points[j - (segments / i) / 2] + points[j + (segments / i) / 2]) / 2 + rng.range(-displacement, displacement);
        }
        displacement *= roughness;
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i <= segments; i++) {
        ctx.lineTo((i / segments) * width, points[i]);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

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
    link.download = `celestial-horizon-${state.seed}.png`;
    link.href = state.canvas.toDataURL('image/png');
    link.click();

    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', init);
