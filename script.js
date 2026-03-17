// 1. DATA & STATE
let vault = JSON.parse(localStorage.getItem('wv_dollar_vault')) || [];
let config = { themeColor: '#00ff00', mSpeed: 1, mOpac: 0.25, dvdOn: true, dvdS: 2 };
let tabs = ['CALC', 'GIVER', 'VAULT', 'CONTROL', 'TOOLS'];

const lexiconDB = ["WHISKEY", "HOSPITAL", "ATTITUDE", "EXCELLENT", "STRENGTH", "MOTHER", "SUCCESS", "FREEDOM", "CHAMPION", "IDENTIFY", "VACATION", "PUMPKIN", "TELEPHONE", "WEDNESDAY", "BREAKTHROUGH", "INFORMATION", "STIMULUS", "MITTENS", "COOKOUT", "CONTENTED", "SHADOWING", "SYSTEMATIC"].sort();

// 2. MATRIX ANIMATION
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.width ? canvas.getContext('2d') : null;
let drops = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drops = Array(Math.floor(canvas.width / 20)).fill(1);
}

function animateMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = config.themeColor;
    ctx.font = "14px monospace";
    drops.forEach((y, i) => {
        ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += config.mSpeed;
    });
    requestAnimationFrame(animateMatrix);
}

// 3. DVD LOGO LOGIC
const dvd = document.getElementById('dvd-logo');
let bX = 50, bY = 50, bDX = config.dvdS, bDY = config.dvdS;

setInterval(() => {
    if(!config.dvdOn) { dvd.style.display = 'none'; return; }
    dvd.style.display = 'block';
    bX += bDX; bY += bDY;
    if (bX + 85 >= window.innerWidth || bX <= 0) bDX *= -1;
    if (bY + 45 >= window.innerHeight || bY <= 0) bDY *= -1;
    dvd.style.left = bX + 'px';
    dvd.style.top = bY + 'px';
}, 16);

// 4. UI ENGINE
const nav = document.getElementById('nav');
const content = document.getElementById('content');

function updateNav() {
    nav.innerHTML = '';
    tabs.forEach(t => {
        const b = document.createElement('button');
        b.textContent = t;
        b.className = (currentTab === t) ? 'active' : '';
        b.onclick = () => setTab(t);
        nav.appendChild(b);
    });
}

let currentTab = 'CALC';
function setTab(t) {
    currentTab = t;
    updateNav();
    content.innerHTML = '';
    
    if (t === 'CALC') {
        content.innerHTML = `<div class="input-wrap"><input class="wv-input" placeholder="..." autofocus autocomplete="off"><div class="del-btn" id="clear-input">×</div></div><div id="out">0</div>`;
        const i = content.querySelector(".wv-input"), o = content.querySelector("#out");
        i.oninput = (e) => {
            const w = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
            e.target.value = w;
            const s = [...w].reduce((a, b) => a + (b.charCodeAt(0) - 64), 0);
            o.textContent = s;
            if (s === 100 && w.length > 0) {
                o.className = "match-glow";
                if (!vault.some(v => v.word === w)) {
                    vault.push({ word: w, length: w.length });
                    localStorage.setItem('wv_dollar_vault', JSON.stringify(vault));
                }
            } else o.className = "";
        };
        content.querySelector("#clear-input").onclick = () => { i.value = ""; o.textContent = "0"; o.className = ""; i.focus(); };
    }
    
    if (t === 'GIVER') {
        content.innerHTML = `<div id="giver-display" style="font-size:2.5rem; margin:40px 0; text-align:center; font-weight:900;">---</div><button class="wv-btn" id="gen-btn">Generate Word</button>`;
        content.querySelector("#gen-btn").onclick = () => content.querySelector("#giver-display").textContent = lexiconDB[Math.floor(Math.random() * lexiconDB.length)];
    }
    
    if (t === 'VAULT') {
        content.innerHTML = `<div style="text-align:center; font-size:9px; opacity:0.6; margin-bottom:10px;">DOLLAR_VAULT</div>` + 
            vault.map(v => `<div class="vault-item"><span>${v.word}</span><span>${v.length} Ltrs</span></div>`).join('') +
            `<button class="wv-btn" style="margin-top:auto; color:#ff4444; border-color:#ff4444;" id="wipe-vault">Wipe Vault</button>`;
        content.querySelector("#wipe-vault").onclick = () => { if(confirm("Clear vault?")) { vault = []; localStorage.setItem('wv_dollar_vault', JSON.stringify(vault)); setTab('VAULT'); } };
    }

    if (t === 'CONTROL') {
        content.innerHTML = `<label style="font-size:9px">MATRIX SPEED</label><input type="range" id="ms" min="0" max="5" step="0.1" value="${config.mSpeed}">
            <button class="wv-btn" id="dt">Toggle DVD: ${config.dvdOn ? 'ON' : 'OFF'}</button>`;
        content.querySelector("#ms").oninput = (e) => config.mSpeed = parseFloat(e.target.value);
        content.querySelector("#dt").onclick = (e) => { config.dvdOn = !config.dvdOn; e.target.textContent = `Toggle DVD: ${config.dvdOn ? 'ON' : 'OFF'}`; };
    }

    if (t === 'TOOLS') {
        content.innerHTML = `<button class="wv-btn" id="add-mi">Initialize MyInstants</button>
            <button class="wv-btn" onclick="window.open('https://www.torahcalc.com/tools/gematria-search', '_blank')">External Search</button>
            <button class="wv-btn" onclick="vault.sort((a,b)=>a.word.localeCompare(b.word)); setTab('VAULT');">Sort Vault (A-Z)</button>`;
        content.querySelector("#add-mi").onclick = () => {
            if (!tabs.includes('SOUNDS')) { tabs.push('SOUNDS'); updateNav(); }
            setTab('SOUNDS');
        };
    }

    if (t === 'SOUNDS') {
        content.innerHTML = `<iframe src="https://www.myinstants.com"></iframe>`;
    }
}

// Init
window.addEventListener('resize', resize);
resize();
animateMatrix();
setTab('CALC');