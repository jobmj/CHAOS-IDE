let isMutating = false;
let activeDecorations = [];

// Circumference for r=75 (2 * PI * 75)
const CIRCUMFERENCE = 471.24;

// Phase timings & cadence configuration
const DIFFICULTY_CONFIG = {
    1: { name: "Mild Annoyance", attackDurationSec: 16, cooldownSec: 14, strikeCadenceMs: 3000 },
    2: { name: "Script Kiddie",   attackDurationSec: 18, cooldownSec: 12, strikeCadenceMs: 2600 },
    3: { name: "Chaos Gremlin",   attackDurationSec: 20, cooldownSec: 10, strikeCadenceMs: 2200 },
    4: { name: "Code Demon",      attackDurationSec: 24, cooldownSec: 8,  strikeCadenceMs: 2000 },
    5: { name: "APOCALYPSE",      attackDurationSec: 28, cooldownSec: 6,  strikeCadenceMs: 1600 }
};

let activeLevel = 3;
let isRandomDifficulty = false;

// Game Loop State
let isCoolingDown = false;
let currentPhaseSecondsLeft = 0;
let phaseTotalSeconds = 20;
let masterLoopInterval = null;
let attackTimerInterval = null;

function applyDifficulty(val) {
    if (val === "random") {
        isRandomDifficulty = true;
        activeLevel = Math.floor(Math.random() * 5) + 1;
    } else {
        isRandomDifficulty = false;
        activeLevel = parseInt(val, 10);
    }

    const diagLvl = document.getElementById("diag-lvl-val");
    if (diagLvl) {
        diagLvl.innerText = isRandomDifficulty ? `🎲 LVL ${activeLevel}` : `LVL ${activeLevel}`;
    }

    startAttackPhase();
}

function startAttackPhase() {
    isCoolingDown = false;
    clearInterval(masterLoopInterval);
    clearInterval(attackTimerInterval);

    const conf = DIFFICULTY_CONFIG[activeLevel];
    phaseTotalSeconds = conf.attackDurationSec;
    currentPhaseSecondsLeft = conf.attackDurationSec;

    // UI Updates
    const badge = document.getElementById('game-status');
    const statusText = document.getElementById('threat-status-text');
    const meterLabel = document.getElementById('meter-label');
    const diagDef = document.getElementById('diag-def-val');
    const gaugeCircle = document.getElementById('gauge-circle-fill');

    if (badge) {
        badge.className = "threat-pill hunting";
        if (statusText) statusText.innerText = "ATTACK ACTIVE";
    }
    if (meterLabel) meterLabel.innerText = "CORE OVERLOAD";
    if (diagDef) {
        diagDef.innerText = "MUTATING";
        diagDef.style.color = "var(--neon-cyan)";
    }
    if (gaugeCircle) {
        gaugeCircle.classList.remove("cooling-mode");
    }

    renderRadialClock(currentPhaseSecondsLeft, "SEC REMAIN", 0);

    // 1. Attack Timer: runs automatic strikes every 2-3 seconds
    attackTimerInterval = setInterval(() => {
        if (!isCoolingDown && !isMutating) {
            triggerSabotageEvent();
        }
    }, conf.strikeCadenceMs);

    // 2. Phase Countdown Loop: updates the clock and fills the gauge like sand
    masterLoopInterval = setInterval(() => {
        currentPhaseSecondsLeft--;

        // Ratio fills from 0.0 to 1.0
        const progressRatio = (phaseTotalSeconds - currentPhaseSecondsLeft) / phaseTotalSeconds;
        renderRadialClock(currentPhaseSecondsLeft, "SEC ATTACK", progressRatio);

        if (currentPhaseSecondsLeft <= 0) {
            startCooldownPhase();
        }
    }, 1000);
}

function startCooldownPhase() {
    isCoolingDown = true;
    clearInterval(masterLoopInterval);
    clearInterval(attackTimerInterval);

    const conf = DIFFICULTY_CONFIG[activeLevel];
    phaseTotalSeconds = conf.cooldownSec;
    currentPhaseSecondsLeft = conf.cooldownSec;

    // UI Updates
    const badge = document.getElementById('game-status');
    const statusText = document.getElementById('threat-status-text');
    const meterLabel = document.getElementById('meter-label');
    const diagDef = document.getElementById('diag-def-val');
    const gaugeCircle = document.getElementById('gauge-circle-fill');

    if (badge) {
        badge.className = "threat-pill cooling";
        if (statusText) statusText.innerText = "❄ SAFE COOLDOWN";
    }
    if (meterLabel) meterLabel.innerText = "COOLING DURATION";
    if (diagDef) {
        diagDef.innerText = "SAFE WINDOW";
        diagDef.style.color = "var(--neon-green)";
    }
    if (gaugeCircle) {
        gaugeCircle.classList.add("cooling-mode");
    }

    renderRadialClock(currentPhaseSecondsLeft, "SEC SAFE", 1);

    // Cooldown loop: meter smoothly drains back from 1.0 down to 0.0
    masterLoopInterval = setInterval(() => {
        currentPhaseSecondsLeft--;

        const drainRatio = Math.max(0, currentPhaseSecondsLeft / phaseTotalSeconds);
        renderRadialClock(currentPhaseSecondsLeft, "SEC SAFE", drainRatio);

        if (currentPhaseSecondsLeft <= 0) {
            startAttackPhase();
        }
    }, 1000);
}

function renderRadialClock(displayVal, unitText, ratio) {
    const circle = document.getElementById('gauge-circle-fill');
    const valText = document.getElementById('meter-digital-val');
    const unitEl = document.getElementById('meter-digital-unit');

    if (valText) valText.innerText = displayVal;
    if (unitEl) unitEl.innerText = unitText;

    if (circle) {
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        // Offset starts at 471.24 (empty) and moves to 0 (full)
        const offset = CIRCUMFERENCE - (clampedRatio * CIRCUMFERENCE);
        circle.style.strokeDashoffset = offset;
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
            fontFamily: "'Fira Code', Consolas, monospace",
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            bracketPairColorization: { enabled: true },
            minimap: { enabled: false }
        });

        loadChallengeUI(currentCh);
        applyDifficulty(document.getElementById("difficulty-select").value);

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

        // Instant attack trigger on Enter key press
        window.editor.onKeyUp((e) => {
            if (e.keyCode === monaco.KeyCode.Enter && !isCoolingDown && !isMutating) {
                setTimeout(() => triggerSabotageEvent(), 80);
            }
        });

        document.getElementById("next-challenge-btn").addEventListener("click", () => {
            const nextCh = nextChallenge();
            loadChallengeUI(nextCh);
            if (isRandomDifficulty) {
                applyDifficulty("random");
            } else {
                startAttackPhase();
            }
        });

        document.getElementById("clear-btn").addEventListener("click", () => {
            const out = document.getElementById("console-output");
            if (out) out.innerText = "";
        });
    });
}

function loadChallengeUI(challenge) {
    const titleEl = document.getElementById("challenge-title");
    const descEl = document.getElementById("challenge-desc");
    const catEl = document.getElementById("challenge-cat");

    if (titleEl) titleEl.innerText = challenge.title;
    if (descEl) descEl.innerText = challenge.desc;
    if (catEl) catEl.innerText = challenge.category || "MISSION DIRECTIVE";

    if (window.editor) {
        window.editor.setValue(challenge.starterCode);
        setTimeout(() => window.editor.layout(), 50);
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
        // Target code lines that aren't pure comments or empty
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

            // Flash neon red laser pulse along corrupted line only
            activeDecorations = window.editor.deltaDecorations(activeDecorations, [
                {
                    range: new monaco.Range(targetLineNumber, 1, targetLineNumber, mutatedText.length + 1),
                    options: { 
                        isWholeLine: true, 
                        className: "corrupted-line-highlight",
                        glyphMarginClassName: "corrupted-line-glyph"
                    }
                }
            ]);

            setTimeout(() => {
                activeDecorations = window.editor.deltaDecorations(activeDecorations, []);
            }, 450);
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