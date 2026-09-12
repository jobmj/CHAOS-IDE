let isMutating = false;
let activeDecorations = [];
let programmaticUpdate = false;

const CIRCUMFERENCE = 471.24;

const DIFFICULTY_CONFIG = {
    1: { name: "Mild Annoyance", attackDurationSec: 16, cooldownSec: 14, strikeCadenceMs: 3000, scoreMult: 1.0 },
    2: { name: "Script Kiddie",   attackDurationSec: 18, cooldownSec: 12, strikeCadenceMs: 2600, scoreMult: 1.2 },
    3: { name: "Chaos Gremlin",   attackDurationSec: 20, cooldownSec: 10, strikeCadenceMs: 2200, scoreMult: 1.5 },
    4: { name: "Code Demon",      attackDurationSec: 24, cooldownSec: 8,  strikeCadenceMs: 2000, scoreMult: 2.0 },
    5: { name: "APOCALYPSE",      attackDurationSec: 28, cooldownSec: 6,  strikeCadenceMs: 1600, scoreMult: 2.5 }
};

let selectedDifficulty = "3";
let activeLevel = 3;
let isRandomDifficulty = false;

// Player & Leaderboard State (No hardcoded competitors)
let playerName = "Operator_01";
let currentScore = 0;
let scoreTickInterval = null;

// Game State Machine Flags
let isGameStarted = false;
let isCoolingDown = false;
let currentPhaseSecondsLeft = 0;
let phaseTotalSeconds = 20;
let masterLoopInterval = null;
let attackTimerInterval = null;

class ChaosAudio {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playStrike() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    playCooldown() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(320, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
        } catch (e) {}
    }
}

const sfx = new ChaosAudio();

/**
 * Leaderboard & Points Management (Strictly User-Only)
 */
function getStoredLeaderboard() {
    try {
        const stored = localStorage.getItem("chaos_leaderboard");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {}
    return [];
}

function saveLeaderboard(board) {
    try {
        localStorage.setItem("chaos_leaderboard", JSON.stringify(board));
    } catch (e) {}
}

function updateLeaderboardUI() {
    const listEl = document.getElementById("leaderboard-rows");
    const liveScoreEl = document.getElementById("hud-live-score");

    if (liveScoreEl) {
        liveScoreEl.innerText = `${Math.floor(currentScore)} PTS`;
    }

    if (!listEl) return;

    let board = getStoredLeaderboard();
    
    // Update or insert only the active player
    const userEntry = board.find(item => item.name.toLowerCase() === playerName.toLowerCase());
    if (userEntry) {
        if (currentScore > userEntry.score) {
            userEntry.score = Math.floor(currentScore);
        }
    } else {
        board.push({ name: playerName, score: Math.floor(currentScore) });
    }

    // Keep sorted by score
    board.sort((a, b) => b.score - a.score);
    saveLeaderboard(board);

    // Render the active player's telemetry row
    listEl.innerHTML = board.map((entry, idx) => {
        const isSelf = entry.name.toLowerCase() === playerName.toLowerCase();
        return `
            <div class="lb-row ${isSelf ? 'active-user' : ''}">
                <div class="lb-left">
                    <span class="lb-rank">#${idx + 1}</span>
                    <span class="lb-name">${entry.name} ${isSelf ? '★' : ''}</span>
                </div>
                <span class="lb-score">${entry.score} PTS</span>
            </div>
        `;
    }).join('');
}

// Points accumulator: ticks every second during active coding
function startScoreTicker() {
    clearInterval(scoreTickInterval);
    const conf = DIFFICULTY_CONFIG[activeLevel];

    scoreTickInterval = setInterval(() => {
        if (isGameStarted) {
            // Passive survival points: 5 pts * difficulty multiplier per second
            currentScore += (5 * conf.scoreMult);
            updateLeaderboardUI();
        }
    }, 1000);
}

// Bonus points awarded when all assertions pass in gaslight.js
window.awardVerificationBonus = function() {
    const conf = DIFFICULTY_CONFIG[activeLevel];
    const bonus = Math.floor(750 * conf.scoreMult);
    currentScore += bonus;
    updateLeaderboardUI();
};

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

function setStandbyState() {
    isGameStarted = false;
    isCoolingDown = false;
    clearInterval(masterLoopInterval);
    clearInterval(attackTimerInterval);
    clearInterval(scoreTickInterval);

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
    if (valText) {
        valText.innerText = "PAUSED";
        valText.classList.remove("critical-tick");
    }
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
    startScoreTicker();

    attackTimerInterval = setInterval(() => {
        if (!isCoolingDown && !isMutating && isGameStarted) {
            triggerSabotageEvent();
        }
    }, conf.strikeCadenceMs);

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

    sfx.playCooldown();

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

function renderRadialClock(displayVal, unitText, ratio) {
    const circle = document.getElementById('gauge-circle-fill');
    const valText = document.getElementById('meter-digital-val');
    const unitEl = document.getElementById('meter-digital-unit');

    if (valText) {
        valText.innerText = displayVal;
        if (typeof displayVal === "number" && displayVal <= 5 && isGameStarted) {
            valText.classList.add("critical-tick");
        } else {
            valText.classList.remove("critical-tick");
        }
    }
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

        window.editor.onDidChangeModelContent(() => {
            if (!programmaticUpdate && !isGameStarted) {
                startAttackPhase();
            }
        });

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

            sfx.playStrike();

            // Resilience points: +25 pts * multiplier survived
            const conf = DIFFICULTY_CONFIG[activeLevel];
            currentScore += (25 * conf.scoreMult);
            updateLeaderboardUI();

            const editorBox = document.querySelector(".editor-enclosure");
            if (editorBox) {
                editorBox.classList.add("editor-glitch-active");
                setTimeout(() => editorBox.classList.remove("editor-glitch-active"), 200);
            }

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

function initLaunchModal() {
    const bootLines = [
        ">> INITIALIZING CHAOS PROTOCOL v4.0.2...",
        ">> MOUNTING ISOLATED WASM MEMORY BUS...",
        ">> COMPILING CPYTHON 3.12 KERNEL IMAGES...",
        ">> SCANNING ADVERSARIAL NEURAL PATHWAYS...",
        ">> STATUS: ALL SUBSYSTEMS NOMINAL.",
        ">> ENTER OPERATOR IDENTIFIER & ENGAGE."
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
            setTimeout(typeNextBootLine, 300);
        } else {
            setTimeout(() => {
                terminalBox.style.display = "none";
                diffStage.classList.add("active");
                const nameInput = document.getElementById("player-name-input");
                if (nameInput) nameInput.focus();
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
        sfx.init();

        const inputEl = document.getElementById("player-name-input");
        if (inputEl && inputEl.value.trim().length > 0) {
            playerName = inputEl.value.trim().substring(0, 16);
        }

        const diagUser = document.getElementById("diag-user-val");
        if (diagUser) diagUser.innerText = playerName;

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

        // Clear any old mock data from previous sessions and initialize fresh user row
        saveLeaderboard([]);
        updateLeaderboardUI();
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