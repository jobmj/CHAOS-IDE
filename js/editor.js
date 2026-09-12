let isMutating = false;
let activeDecorations = [];
let programmaticUpdate = false;

// Circumference for r=75 (2 * PI * 75)
const CIRCUMFERENCE = 471.24;

const DIFFICULTY_CONFIG = {
    1: { name: "Mild Annoyance", attackDurationSec: 16, cooldownSec: 14, strikeCadenceMs: 3000 },
    2: { name: "Script Kiddie",   attackDurationSec: 18, cooldownSec: 12, strikeCadenceMs: 2600 },
    3: { name: "Chaos Gremlin",   attackDurationSec: 20, cooldownSec: 10, strikeCadenceMs: 2200 },
    4: { name: "Code Demon",      attackDurationSec: 24, cooldownSec: 8,  strikeCadenceMs: 2000 },
    5: { name: "APOCALYPSE",      attackDurationSec: 28, cooldownSec: 6,  strikeCadenceMs: 1600 }
};

let selectedDifficulty = "3";
let activeLevel = 3;
let isRandomDifficulty = false;

// Game State Machine Flags
let isGameStarted = false;
let isCoolingDown = false;
let currentPhaseSecondsLeft = 0;
let phaseTotalSeconds = 20;
let masterLoopInterval = null;
let attackTimerInterval = null;

/**
 * Formats and renders HackerRank-style challenge specifications
 */
function renderProblemSpec(ch) {
    const titleEl = document.getElementById("spec-title");
    const catEl = document.getElementById("spec-category");
    const diffBadge = document.getElementById("spec-diff-badge");
    const bodyEl = document.getElementById("spec-body");

    if (titleEl) titleEl.innerText = ch.title;
    if (catEl) catEl.innerText = ch.category;
    
    if (diffBadge) {
        diffBadge.innerText = ch.difficultyTag || "EASY";
        diffBadge.className = `spec-difficulty-badge badge-${(ch.difficultyTag || 'easy').toLowerCase()}`;
    }

    if (!bodyEl) return;

    let html = `
        <div>
            <div class="spec-section-title">Problem Statement</div>
            <p>${ch.desc.replace(/\n/g, '<br>')}</p>
        </div>

        <div>
            <div class="spec-section-title">Input Format</div>
            <p>${ch.inputFormat}</p>
        </div>

        <div>
            <div class="spec-section-title">Output Format</div>
            <p>${ch.outputFormat}</p>
        </div>

        <div>
            <div class="spec-section-title">Constraints</div>
            <ul class="spec-constraints-list">
                ${ch.constraints.map(c => `<li><code>${c}</code></li>`).join('')}
            </ul>
        </div>

        <div>
            <div class="spec-section-title">Sample Cases</div>
            ${ch.sampleCases.map((sc, i) => `
                <div class="spec-sample-box" style="margin-bottom: 8px;">
                    <div class="sample-label">Sample Input ${i + 1}</div>
                    <pre class="sample-code">${sc.input}</pre>
                    <div class="sample-label" style="margin-top: 4px;">Sample Output ${i + 1}</div>
                    <pre class="sample-code">${sc.output}</pre>
                    ${sc.explanation ? `<div class="sample-label" style="margin-top: 4px;">Explanation</div><p style="font-size: 11px; color: #9bb0db;">${sc.explanation}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;

    bodyEl.innerHTML = html;
}

/**
 * Loads problem and resets editor into standby
 */
function loadChallengeUI(challenge) {
    renderProblemSpec(challenge);

    if (window.editor) {
        programmaticUpdate = true;
        window.editor.setValue(challenge.starterCode);
        programmaticUpdate = false;
        setTimeout(() => window.editor.layout(), 50);
    }

    setStandbyState();
}

/**
 * Freezes the timers and agent until user types their first keystroke
 */
function setStandbyState() {
    isGameStarted = false;
    isCoolingDown = false;
    clearInterval(masterLoopInterval);
    clearInterval(attackTimerInterval);

    const badge = document.getElementById('game-status');
    const statusText = document.getElementById('threat-status-text');
    const meterLabel = document.getElementById('meter-label');
    const diagDef = document.getElementById('diag-def-val');
    const gaugeCircle = document.getElementById('gauge-circle-fill');

    if (badge) {
        badge.className = "threat-pill standby";
        if (statusText) statusText.innerText = "STANDBY // AWAITING FIRST KEYSTROKE";
    }
    if (meterLabel) meterLabel.innerText = "CORE TEMPERATURE";
    if (diagDef) {
        diagDef.innerText = "IDLE";
        diagDef.style.color = "var(--neon-amber)";
    }
    if (gaugeCircle) {
        gaugeCircle.className = "gauge-fill standby-mode";
        gaugeCircle.style.stroke = "url(#standbyGrad)";
        gaugeCircle.style.filter = "none";
        gaugeCircle.style.strokeDashoffset = CIRCUMFERENCE;
    }

    const valText = document.getElementById('meter-digital-val');
    const unitEl = document.getElementById('meter-digital-unit');
    if (valText) valText.innerText = "PAUSED";
    if (unitEl) unitEl.innerText = "TYPE TO START";
}

function startAttackPhase() {
    isGameStarted = true;
    isCoolingDown = false;
    clearInterval(masterLoopInterval);
    clearInterval(attackTimerInterval);

    const conf = DIFFICULTY_CONFIG[activeLevel];
    phaseTotalSeconds = conf.attackDurationSec;
    currentPhaseSecondsLeft = conf.attackDurationSec;

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
        gaugeCircle.className = "gauge-fill";
        gaugeCircle.style.stroke = "url(#attackGrad)";
        gaugeCircle.style.filter = "none";
    }

    renderRadialClock(currentPhaseSecondsLeft, "SEC REMAIN", 0);

    // 1. Attack cadence timer
    attackTimerInterval = setInterval(() => {
        if (!isCoolingDown && !isMutating && isGameStarted) {
            triggerSabotageEvent();
        }
    }, conf.strikeCadenceMs);

    // 2. Overload countdown loop
    masterLoopInterval = setInterval(() => {
        currentPhaseSecondsLeft--;
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
        gaugeCircle.className = "gauge-fill cooling-mode";
        gaugeCircle.style.stroke = "url(#cooldownGrad)";
        gaugeCircle.style.filter = "none";
    }

    renderRadialClock(currentPhaseSecondsLeft, "SEC SAFE", 1);

    masterLoopInterval = setInterval(() => {
        currentPhaseSecondsLeft--;
        const drainRatio = Math.max(0, currentPhaseSecondsLeft / phaseTotalSeconds);
        renderRadialClock(currentPhaseSecondsLeft, "SEC SAFE", drainRatio);

        if (currentPhaseSecondsLeft <= 0) {
            startAttackPhase();
        }
    }, 1000);
}

/**
 * Handles circular gauge progress and crisp stroke dashoffset (glow-free)
 */
function renderRadialClock(displayVal, unitText, ratio) {
    const circle = document.getElementById('gauge-circle-fill');
    const valText = document.getElementById('meter-digital-val');
    const unitEl = document.getElementById('meter-digital-unit');

    if (valText) valText.innerText = displayVal;
    if (unitEl) unitEl.innerText = unitText;

    if (circle) {
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        const offset = CIRCUMFERENCE - (clampedRatio * CIRCUMFERENCE);
        circle.style.strokeDashoffset = offset;
        circle.style.filter = "none";
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

        setTimeout(() => {
            if (window.editor) window.editor.layout();
        }, 150);

        window.addEventListener("resize", () => {
            if (window.editor) window.editor.layout();
        });

        // First Keystroke Trigger Guard
        window.editor.onDidChangeModelContent(() => {
            if (!programmaticUpdate && !isGameStarted) {
                startAttackPhase();
            }
        });

        // Instant attack trigger on Enter if active
        window.editor.onKeyUp((e) => {
            if (e.keyCode === monaco.KeyCode.Enter && isGameStarted && !isCoolingDown && !isMutating) {
                setTimeout(() => triggerSabotageEvent(), 80);
            }
        });

        document.getElementById("next-challenge-btn").addEventListener("click", () => {
            const nextCh = nextChallenge();
            loadChallengeUI(nextCh);
        });

        document.getElementById("clear-btn").addEventListener("click", () => {
            const out = document.getElementById("console-output");
            if (out) out.innerText = "";
        });
    });
}

async function triggerSabotageEvent() {
    if (isMutating || isCoolingDown || !isGameStarted || !window.editor) return;

    const model = window.editor.getModel();
    if (!model) return;

    const totalLines = model.getLineCount();
    const candidateLines = [];

    for (let i = 1; i <= totalLines; i++) {
        const text = model.getLineContent(i).trim();
        if (text.length >= 3 && !text.startsWith("#") && !text.startsWith('"""') && !text.startsWith(":")) {
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
            }, 450);
        }
    } finally {
        isMutating = false;
    }
}

/**
 * Launch Sequence: Terminal Boot -> Difficulty Select
 */
function initLaunchModal() {
    const bootLines = [
        ">> INITIALIZING CHAOS PROTOCOL v4.0.2...",
        ">> MOUNTING ISOLATED WASM MEMORY BUS...",
        ">> COMPILING CPYTHON 3.12 KERNEL IMAGES...",
        ">> SCANNING ADVERSARIAL NEURAL PATHWAYS...",
        ">> STATUS: ALL SUBSYSTEMS NOMINAL.",
        ">> SELECT THREAT PROFILE TO ENGAGE."
    ];

    const streamEl = document.getElementById("boot-stream");
    const terminalBox = document.getElementById("boot-terminal-box");
    const diffStage = document.getElementById("difficulty-stage-box");
    let lineIdx = 0;

    function typeNextBootLine() {
        if (lineIdx < bootLines.length) {
            const line = document.createElement("div");
            line.innerText = bootLines[lineIdx];
            streamEl.appendChild(line);
            terminalBox.scrollTop = terminalBox.scrollHeight;
            lineIdx++;
            setTimeout(typeNextBootLine, 320);
        } else {
            setTimeout(() => {
                terminalBox.style.display = "none";
                diffStage.classList.add("active");
            }, 500);
        }
    }

    typeNextBootLine();

    const diffButtons = document.querySelectorAll(".diff-card-btn");
    diffButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            diffButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedDifficulty = btn.getAttribute("data-diff");
        });
    });

    const startBtn = document.getElementById("launch-btn");
    startBtn.addEventListener("click", () => {
        if (selectedDifficulty === "random") {
            isRandomDifficulty = true;
            activeLevel = Math.floor(Math.random() * 5) + 1;
        } else {
            isRandomDifficulty = false;
            activeLevel = parseInt(selectedDifficulty, 10);
        }

        const diagLvl = document.getElementById("diag-lvl-val");
        if (diagLvl) {
            diagLvl.innerText = isRandomDifficulty ? `🎲 LVL ${activeLevel}` : `LVL ${activeLevel}`;
        }

        document.getElementById("launch-overlay").classList.add("hidden");

        setStandbyState();

        if (window.editor) {
            window.editor.layout();
            window.editor.focus();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initLaunchModal();
        setupMonaco();
    });
} else {
    initLaunchModal();
    setupMonaco();
}