function initGaslight() {
    const runBtn = document.getElementById("run-btn");
    const output = document.getElementById("console-output");

    if (!runBtn || !output) return;

    runBtn.addEventListener("click", () => {
        const model = window.editor ? window.editor.getModel() : null;
        const code = model ? model.getValue() : "";
        const currentCh = getCurrentChallenge();

        // Check for common Python corruptions
        const hasSyntaxErrors = code.includes("* 0") || 
                                (code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length ||
                                (code.match(/\[/g) || []).length !== (code.match(/\]/g) || []).length;

        const missingKeyParts = currentCh.solutionKeywords.some(kw => !code.includes(kw));
        const containsSabotage = currentCh.antiKeywords.some(bad => code.includes(bad));

        if (hasSyntaxErrors || missingKeyParts || containsSabotage) {
            output.innerText = 
`❌ [FAILED TEST SUITE]
--------------------------------------------------
Traceback (most recent call last):
  AssertionError: Challenge validation failed!
  Code contains lingering syntax corruption or invalid return logic.

[Hint]: Fix any broken syntax and corrupted operators before submitting!`;
            output.style.color = "#f44336";
        } else {
            output.innerText = 
`🎉 [CHALLENGE COMPLETED SUCCESSFULLY!]
--------------------------------------------------
Test 1: PASSED
Test 2: PASSED
All test cases executed with exit code 0.

You beat the agent during the cooldown window!
Click 'Next Challenge' to start the next round.`;
            output.style.color = "#4CAF50";
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGaslight);
} else {
    initGaslight();
}