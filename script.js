// 1. Initialisation de l'API Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playCyberSound = (type) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'encode' || type === 'decode') {
        oscillator.type = type === 'encode' ? 'square' : 'sawtooth';
        oscillator.frequency.setValueAtTime(type === 'encode' ? 440 : 1760, now);
        oscillator.frequency.exponentialRampToValueAtTime(type === 'encode' ? 1760 : 440, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now); oscillator.stop(now + 0.2);
    }
    else if (type === 'error') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now); oscillator.stop(now + 0.3);
    }
    else if (type === 'copy') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now); oscillator.stop(now + 0.1);
    }
    else if (type === 'reset') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now); oscillator.stop(now + 0.1);
    }
    else if (type === 'type') {
        oscillator.type = 'square';
        const randomFreq = 800 + Math.random() * 400; 
        oscillator.frequency.setValueAtTime(randomFreq, now);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        oscillator.start(now); oscillator.stop(now + 0.03);
    }
    else if (type === 'theme') {
        // Son élégant/magique pour le changement de thème
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now); oscillator.stop(now + 0.5);
    }
};

// 2. Gestion des Thèmes
const body = document.body;
const themeToggleBtn = document.getElementById('btn-theme-toggle');
const themeDropdown = document.getElementById('theme-dropdown');
const themeButtons = document.querySelectorAll('.theme-menu__btn');

// Charger le thème depuis le localStorage
const savedTheme = localStorage.getItem('appTheme') || 'theme-cyber';
body.className = savedTheme;

// Afficher/Cacher le menu
themeToggleBtn.addEventListener('click', () => {
    themeDropdown.classList.toggle('is-open');
});

// Gérer le clic en dehors du menu pour le fermer
document.addEventListener('click', (e) => {
    if (!themeToggleBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
        themeDropdown.classList.remove('is-open');
    }
});

// Appliquer le thème sélectionné
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const newTheme = btn.getAttribute('data-theme');
        body.className = newTheme;
        localStorage.setItem('appTheme', newTheme);
        themeDropdown.classList.remove('is-open');
        playCyberSound('theme'); // Joue le son magique
    });
});

// 3. Fonctions Base64 Modernes
const safeEncodeBase64 = (str) => {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
};

const safeDecodeBase64 = (str) => {
    const cleanStr = str.replace(/\s+/g, '');
    const binString = atob(cleanStr);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new TextDecoder().decode(bytes);
};

// 4. Sélection DOM (Convertisseur)
const inputArea = document.getElementById('input-data');
const outputArea = document.getElementById('output-data');
const btnEncode = document.getElementById('btn-encode');
const btnDecode = document.getElementById('btn-decode');
const btnCopy = document.getElementById('btn-copy');
const btnResetInput = document.getElementById('btn-reset-input');
const btnResetOutput = document.getElementById('btn-reset-output');

// 5. Effet Machine à écrire
let typingTimeout = null;

const typeWriterEffect = (text, element) => {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    element.value = '';
    let index = 0;
    const maxDurationMs = 1500; 
    const tickRateMs = 25; 
    let charsPerTick = Math.ceil(text.length / (maxDurationMs / tickRateMs));
    if (charsPerTick < 1) charsPerTick = 1;

    const typeTick = () => {
        if (index < text.length) {
            element.value += text.substring(index, index + charsPerTick);
            index += charsPerTick;
            playCyberSound('type');
            element.scrollTop = element.scrollHeight;
            typingTimeout = setTimeout(typeTick, tickRateMs);
        }
    };
    
    typeTick();
};

// 6. Écouteurs d'événements
btnEncode.addEventListener('click', () => {
    const data = inputArea.value;
    if (!data) return;

    try {
        const result = safeEncodeBase64(data);
        playCyberSound('encode');
        typeWriterEffect(result, outputArea);
    } catch (e) {
        if (typingTimeout) clearTimeout(typingTimeout);
        outputArea.value = "ERREUR SYSTÈME : Encodage impossible.";
        playCyberSound('error');
    }
});

btnDecode.addEventListener('click', () => {
    const data = inputArea.value;
    if (!data) return;

    try {
        const result = safeDecodeBase64(data);
        playCyberSound('decode');
        typeWriterEffect(result, outputArea);
    } catch (e) {
        if (typingTimeout) clearTimeout(typingTimeout);
        outputArea.value = "ERREUR SYSTÈME : La source n'est pas un Base64 valide.";
        playCyberSound('error');
    }
});

btnCopy.addEventListener('click', async () => {
    const textToCopy = outputArea.value;
    if (!textToCopy || textToCopy.startsWith("ERREUR SYSTÈME")) {
        playCyberSound('error');
        return;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        playCyberSound('copy');
        
        const originalText = btnCopy.textContent;
        btnCopy.textContent = "[COPIÉ !]";
        btnCopy.classList.add('btn-icon--success');
        
        setTimeout(() => {
            btnCopy.textContent = originalText;
            btnCopy.classList.remove('btn-icon--success');
        }, 1500);
    } catch (err) {
        playCyberSound('error');
    }
});

btnResetInput.addEventListener('click', () => {
    inputArea.value = '';
    playCyberSound('reset');
});

btnResetOutput.addEventListener('click', () => {
    if (typingTimeout) clearTimeout(typingTimeout);
    outputArea.value = '';
    playCyberSound('reset');
});