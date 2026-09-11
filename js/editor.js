let isMutating = false;
let hasStartedTyping = false;
let isEvilMode = true; // Tracks which phase we are in
let phaseTimer = null; // Controls the phase switching
let debounceTimer = null;
let activeDecorations = [];

const DIFFICULTY_CONFIG = {
    1: { name: "Mild Annoyance", debounceMs: 900, color: "#4caf50" },
    2: { name: "Script Kiddie",   debounceMs: 700, color: "#8bc34a" },
    3: { name: "Chaos Gremlin",   debounceMs: 500, color: "#ff9800" },
    4: { name: "Code Demon",      debounceMs: 350, color: "#f44336" },
    5: { name: "APOCALYPSE",      debounceMs: 200, color: "#9c27b0" }
};

let activeLevel = 3;
let isRandomDifficulty = false;

// --- Speedrun Timer Logic ---
let startTime = 0;
let timerInterval = null;

function startSpeedrunTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    const timerDisplay = document.getElementById("speedrun-timer");
    
    timerInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        if (timerDisplay) {
            timerDisplay.innerText = elapsedTime.toFixed(2) + "s";
        }
    }, 50);
}

function stopSpeedrunTimer() {
    clearInterval(timerInterval);
    return ((Date.now() - startTime) / 1000).toFixed(2);
}

// --- Phase Loop Logic ---
function updatePhaseUI(text, className) {
    const badge = document.getElementById('game-status');
    if (badge) {
        badge.innerText = text;
        badge.className = className;
    }
}

function startPhaseLoop() {
    clearTimeout(phaseTimer);

    if (isEvilMode) {
        // We are in EVIL MODE. Set next phase to Good Mode after 2 to 3 seconds.
        updatePhaseUI("🔥 ATTACK PHASE", "badge hunting");
        const duration = 15000; 
        
        phaseTimer = setTimeout(() => {
            isEvilMode = false;
            startPhaseLoop();
        }, duration);
    } else {
        // We are in GOOD MODE. Set next phase to Evil Mode after 3 to 4 seconds.
        updatePhaseUI("❄ SAFE WINDOW", "badge cooling");
        const duration = 10000; 
        
        phaseTimer = setTimeout(() => {
            isEvilMode = true;
            startPhaseLoop();
        }, duration);
    }
}

// --- Initialization & UI ---
function applyDifficulty(val) {
    if (val === "random") {
        isRandomDifficulty = true;
        activeLevel = Math.floor(Math.random() * 5) + 1;
    } else {
        isRandomDifficulty = false;
        activeLevel = parseInt(val, 10);
    }

    const conf = DIFFICULTY_CONFIG[activeLevel];
    const diffBadge = document.getElementById("diff-display");
    if (diffBadge) {
        diffBadge.innerText = isRandomDifficulty ? `🎲 LVL ${activeLevel}` : `LVL ${activeLevel}`;
        diffBadge.style.backgroundColor = conf.color;
    }
}

function loadChallengeUI(challenge) {
    document.getElementById("challenge-title").innerText = challenge.title;
    document.getElementById("challenge-desc").innerText = challenge.desc;
    if (window.editor) {
        window.editor.setValue(challenge.starterCode);
        setTimeout(() => window.editor.layout(), 50);
    }
    
    // Reset flags and UI for a new round
    hasStartedTyping = false;
    isEvilMode = true; 
    clearTimeout(phaseTimer);
    updatePhaseUI("🔥 AWAITING INPUT", "badge hunting");
    
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById("speedrun-timer");
    if (timerDisplay) {
        timerDisplay.innerText = "0.00s";
    }
}

function setupMonaco() {
    if (typeof require === "undefined" || !require.config) {
        setTimeout(setupMonaco, 50);
        return;
    }

    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        const container = document.getElementById('editor-container');
        if (!container) return;

        const currentCh = getCurrentChallenge();

        window.editor = monaco.editor.create(container, {
            value: currentCh.starterCode,
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }
        });

        loadChallengeUI(currentCh);
        applyDifficulty(document.getElementById("difficulty-select").value);

        window.editor.onKeyUp((e) => {
            if (e.keyCode === monaco.KeyCode.Enter && isEvilMode && !isMutating) {
                setTimeout(() => triggerSabotageEvent(), 80);
            }
        });

        window.editor.onDidChangeModelContent((event) => {
            if (event.isFlush || isMutating) return;

            // Trigger on very first keystroke
            if (!hasStartedTyping) {
                hasStartedTyping = true;
                startSpeedrunTimer();
                startPhaseLoop(); // Kick off the chaos loop!
            }

            // ONLY trigger sabotage if we are actively in Evil Mode
            if (isEvilMode) {
                const conf = DIFFICULTY_CONFIG[activeLevel];
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    triggerSabotageEvent();
                }, conf.debounceMs);
            }
        });

        document.getElementById("next-challenge-btn").addEventListener("click", () => {
            const nextCh = nextChallenge();
            loadChallengeUI(nextCh);
            if (isRandomDifficulty) applyDifficulty("random");
        });
    });
}

async function triggerSabotageEvent() {
    // FIX: Using !isEvilMode instead of the deleted isCoolingDown variable
    if (isMutating || !isEvilMode || !window.editor) return;

    const model = window.editor.getModel();
    if (!model) return;

    const totalLines = model.getLineCount();
    const candidateLines = [];

    for (let i = 1; i <= totalLines; i++) {
        const text = model.getLineContent(i).trim();
        if (text.length >= 3 && !text.startsWith("#")) {
            candidateLines.push(i);
        }
    }

    if (candidateLines.length === 0) return;

    const targetLineNumber = candidateLines[Math.floor(Math.random() * candidateLines.length)];
    const originalText = model.getLineContent(targetLineNumber);

    isMutating = true;

    try {
        const mutatedText = await requestPythonMutation(originalText, "evil");

        if (mutatedText && mutatedText.trim() !== originalText.trim() && model.getLineContent(targetLineNumber) === originalText) {
            model.applyEdits([
                {
                    range: new monaco.Range(targetLineNumber, 1, targetLineNumber, originalText.length + 1),
                    text: mutatedText
                }
            ]);

            activeDecorations = window.editor.deltaDecorations(activeDecorations, [
                {
                    range: new monaco.Range(targetLineNumber, 1, targetLineNumber, mutatedText.length + 1),
                    options: { isWholeLine: true, className: "corrupted-line-highlight" }
                }
            ]);

            setTimeout(() => {
                activeDecorations = window.editor.deltaDecorations(activeDecorations, []);
            }, 550);
        }
    } finally {
        isMutating = false;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMonaco);
} else {
    setupMonaco();
}