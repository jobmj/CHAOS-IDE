let hasRunOnce = false;

const PYTHON_FAKE_ERRORS = [
    "IndexError: list index out of range",
    "TypeError: unsupported operand type(s) for +=: 'int' and 'str'",
    "IndentationError: unexpected indent (invisible phantom space on line 4)",
    "ZeroDivisionError: integer division or modulo by zero",
    "AttributeError: 'NoneType' object has no attribute 'append'"
];

function initGaslight() {
    const runBtn = document.getElementById("run-btn");
    const consoleOutput = document.getElementById("console-output");

    if (!runBtn || !consoleOutput) {
        setTimeout(initGaslight, 50);
        return;
    }

    runBtn.addEventListener("click", () => {
        if (!hasRunOnce) {
            // Click 1: Fake Python Traceback Error
            const fakeLineNumber = Math.floor(Math.random() * 5) + 2;
            const randomError = PYTHON_FAKE_ERRORS[Math.floor(Math.random() * PYTHON_FAKE_ERRORS.length)];

            consoleOutput.innerText = `Traceback (most recent call last):\n  File "main.py", line ${fakeLineNumber}, in <module>\n    total += item["price"]\n${randomError}`;
            consoleOutput.style.color = "#f44336";
            hasRunOnce = true;
        } else {
            // Click 2: Execution succeeds mysteriously
            consoleOutput.innerText = "30\n[De-Copilot]: Execution successful. Process finished with exit code 0.\n(Code magically resolved in memory without changes.)";
            consoleOutput.style.color = "#4CAF50";
            hasRunOnce = false;
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGaslight);
} else {
    initGaslight();
}