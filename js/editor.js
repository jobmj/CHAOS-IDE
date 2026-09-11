let isMutating = false;
let heatScore = 0;
let isCoolingDown = false;
let cooldownSecondsLeft = 0;
let cooldownTimerInterval = null;

let debounceTimer = null;
let activeDecorations = [];

const DIFFICULTY_CONFIG = {
    1: { name: "Mild Annoyance", debounceMs: 900, heatPerHit: 15, cooldownSec: 30, color: "#4caf50" },
    2: { name: "Script Kiddie",   debounceMs: 700, heatPerHit: 12, cooldownSec: 25, color: "#8bc34a" },
    3: { name: "Chaos Gremlin",   debounceMs: 500, heatPerHit: 10, cooldownSec: 20, color: "#ff9800" },
    4: { name: "Code Demon",      debounceMs: 350, heatPerHit: 8,  cooldownSec: 15, color: "#f44336" },
    5: { name: "APOCALYPSE",      debounceMs: 200, heatPerHit: 6,  cooldownSec: 10, color: "#9c27b0" }
};

let activeLevel = 3;
let isRandomDifficulty = false;

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
    resetHeat();
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
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            bracketPairColorization: { enabled: true },
            minimap: { enabled: false }
        });

        loadChallengeUI(currentCh);
        applyDifficulty(document.getElementById("difficulty-select").value);

        // Force container layout calculation to avoid 0px collapse
        setTimeout(() => {
            if (window.editor) {
                window.editor.layout();
                window.editor.focus();
            }
        }, 150);

        window.addEventListener("resize", () => {
            if (window.editor) window.editor.layout();
        });

        document.getElementById("difficulty-select").addEventListener("change", (e) => {
            applyDifficulty(e.target.value);
        });

        window.editor.onKeyUp((e) => {
            if (e.keyCode === monaco.KeyCode.Enter && !isCoolingDown && !isMutating) {
                setTimeout(() => triggerSabotageEvent(), 80);
            }
        });

        window.editor.onDidChangeModelContent(() => {
            if (isMutating || isCoolingDown) return;

            const conf = DIFFICULTY_CONFIG[activeLevel];
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                triggerSabotageEvent();
            }, conf.debounceMs);
        });

        document.getElementById("next-challenge-btn").addEventListener("click", () => {
            const nextCh = nextChallenge();
            loadChallengeUI(nextCh);
            if (isRandomDifficulty) {
                applyDifficulty("random");
            } else {
                resetHeat();
            }
        });
    });
}

function loadChallengeUI(challenge) {
    document.getElementById("challenge-title").innerText = challenge.title;
    document.getElementById("challenge-desc").innerText = challenge.desc;
    if (window.editor) {
        window.editor.setValue(challenge.starterCode);
        setTimeout(() => window.editor.layout(), 50);
    }
}

function resetHeat() {
    heatScore = 0;
    isCoolingDown = false;
    clearInterval(cooldownTimerInterval);

    const badge = document.getElementById('game-status');
    const label = document.getElementById('meter-state-label');
    if (badge) {
        badge.innerText = "🔥 ATTACK PHASE";
        badge.className = "badge hunting";
    }
    if (label) label.innerText = "Agent Heat:";

    updateHeatUI();
}

function triggerMeltdown() {
    isCoolingDown = true;
    const conf = DIFFICULTY_CONFIG[activeLevel];
    cooldownSecondsLeft = conf.cooldownSec;

    const badge = document.getElementById('game-status');
    const label = document.getElementById('meter-state-label');
    if (badge) {
        badge.innerText = "❄ CORE MELTDOWN (SAFE WINDOW)";
        badge.className = "badge cooling";
    }
    if (label) label.innerText = "Rebooting in:";

    cooldownTimerInterval = setInterval(() => {
        cooldownSecondsLeft--;
        heatScore = Math.max(0, Math.floor((cooldownSecondsLeft / conf.cooldownSec) * 100));
        updateHeatUI();

        if (cooldownSecondsLeft <= 0) {
            resetHeat();
        }
    }, 1000);
}

function updateHeatUI() {
    const fill = document.getElementById('meter-fill');
    const scoreText = document.getElementById('meter-score-text');

    if (fill) {
        fill.style.width = `${heatScore}%`;
        fill.style.background = isCoolingDown 
            ? "linear-gradient(90deg, #00e5ff, #2979ff)" 
            : "linear-gradient(90deg, #ff9100, #ff1744)";
    }

    if (scoreText) {
        scoreText.innerText = isCoolingDown ? `${cooldownSecondsLeft}s` : `${heatScore}%`;
    }
}

async function triggerSabotageEvent() {
    if (isMutating || isCoolingDown || !window.editor) return;

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

            const conf = DIFFICULTY_CONFIG[activeLevel];
            heatScore = Math.min(100, heatScore + conf.heatPerHit);
            updateHeatUI();

            if (heatScore >= 100) {
                triggerMeltdown();
            }
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