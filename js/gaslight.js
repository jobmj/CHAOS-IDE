let pyodideInstance = null;
let isPythonLoading = true;
let pyodideBootError = null;

function printToTerminal(text, color = "#00f0ff") {
    const output = document.getElementById("console-output");
    if (output) {
        output.innerText = text;
        output.style.color = color;
    }
}

async function streamOutput(text, color = "#00f0ff") {
    const out = document.getElementById("console-output");
    if (!out) return;
    out.style.color = color;
    out.innerText = "";
    
    const lines = text.split("\n");
    for (let line of lines) {
        out.innerText += line + "\n";
        out.parentElement.scrollTop = out.parentElement.scrollHeight;
        await new Promise(r => setTimeout(r, 40));
    }
}

/**
 * Initializes Pyodide asynchronously in background without blocking Monaco or circular meter
 */
async function initPyodideRuntime() {
    printToTerminal(">> [SYSTEM]: INITIALIZING NEON WEBASSEMBLY RUNTIME...", "#00f0ff");

    if (window.location.protocol === "file:") {
        const errorMsg = 
`>> [SECURITY PROTOCOL VIOLATION]:
WebAssembly execution is blocked on file:// by modern browsers.
Serve this directory with a local HTTP server:
  Run: python -m http.server 8000
  Open: http://localhost:8000`;
        printToTerminal(errorMsg, "#ff003c");
        isPythonLoading = false;
        pyodideBootError = "file:// protocol blocked";
        return;
    }

    try {
        let loaderFn = window.loadPyodide;
        if (!loaderFn && typeof require !== "undefined" && require.defined) {
            try {
                loaderFn = require("pyodide")?.loadPyodide;
            } catch (e) {}
        }

        if (typeof loaderFn !== "function") {
            throw new Error("Pyodide script tag failed to initialize global loader.");
        }

        printToTerminal(">> [RUNTIME]: COMPILING CPYTHON 3.12 KERNEL (~8MB)...", "#ff9100");

        pyodideInstance = await loaderFn({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
        });

        await pyodideInstance.runPythonAsync("import sys");

        isPythonLoading = false;
        printToTerminal(
`>> [RUNTIME READY]: CPython 3.12 WebAssembly Kernel Online.
>> Survive the attack phase, repair injected mutations, and click 'Run & Verify'.`, 
            "#00ff66"
        );
    } catch (err) {
        isPythonLoading = false;
        pyodideBootError = String(err);
        printToTerminal(`>> [FATAL BOOT ERROR]:\n${err}`, "#ff003c");
    }
}

/**
 * Runs code through Pyodide against current challenge assertions
 */
async function executePythonCode(userCode, testSuiteCode) {
    if (pyodideBootError) {
        return {
            passed: false,
            stdout: "",
            stderr: `Execution aborted: Runtime failed to initialize.\n${pyodideBootError}`
        };
    }

    if (isPythonLoading || !pyodideInstance) {
        return {
            passed: false,
            stdout: "",
            stderr: "Python WebAssembly engine is still compiling. Stand by..."
        };
    }

    const testRunnerWrapper = `
import sys
import io
import traceback

sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

execution_result = {
    "passed": False,
    "stdout": "",
    "stderr": ""
}

try:
${userCode.split('\n').map(l => '    ' + l).join('\n')}

${testSuiteCode.split('\n').map(l => '    ' + l).join('\n')}

    execution_result["passed"] = True
    execution_result["stdout"] = sys.stdout.getvalue()
except Exception:
    execution_result["passed"] = False
    execution_result["stderr"] = traceback.format_exc()

execution_result
`;

    try {
        const resultPyProxy = await pyodideInstance.runPythonAsync(testRunnerWrapper);
        const result = {
            passed: resultPyProxy.get("passed"),
            stdout: resultPyProxy.get("stdout"),
            stderr: resultPyProxy.get("stderr")
        };
        resultPyProxy.destroy();
        return result;
    } catch (err) {
        return {
            passed: false,
            stdout: "",
            stderr: String(err)
        };
    }
}

function initSubmissionHandler() {
    const runBtn = document.getElementById("run-btn");
    if (!runBtn) return;

    runBtn.addEventListener("click", async () => {
        if (!window.editor) return;

        const userCode = window.editor.getValue();
        const currentCh = getCurrentChallenge();

        runBtn.disabled = true;
        const originalText = runBtn.innerText;
        runBtn.innerText = "VERIFYING...";

        printToTerminal(`>> [EXECUTING]: Running ${currentCh.title} through test matrix...\n------------------------------------------------------------\n`, "#00f0ff");

        const res = await executePythonCode(userCode, currentCh.testScript);

        runBtn.disabled = false;
        runBtn.innerText = originalText;

        if (res.passed) {
            const finalMsg = `[STATUS: MISSION ACCOMPLISHED]\n============================================================\n${res.stdout}\n>> ALL TEST CASES PASSED WITH EXIT CODE 0.\n>> Defense protocol held! Click 'Next Mission' to advance.`;
            await streamOutput(finalMsg, "#00ff66");
        } else {
            const errorMsg = `[STATUS: COMPILATION / ASSERTION BREACH]\n============================================================\n${res.stderr || "Unknown runtime execution error."}\n\n>> [HINT]: Inspect line mutations and clean syntax flaws before re-verifying.`;
            await streamOutput(errorMsg, "#ff003c");
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSubmissionHandler();
        setTimeout(initPyodideRuntime, 50);
    });
} else {
    initSubmissionHandler();
    setTimeout(initPyodideRuntime, 50);
}