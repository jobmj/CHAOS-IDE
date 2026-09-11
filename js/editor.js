let isReplacing = false;
let processedLines = new Set();
let decorations = [];

function setupMonaco() {
    if (typeof require === "undefined" || !require.config) {
        setTimeout(setupMonaco, 50);
        return;
    }

    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        const container = document.getElementById('editor-container');
        if (!container) return;

        window.editor = monaco.editor.create(container, {
            value: "",
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }
        });

        setTimeout(() => {
            if (window.editor) {
                window.editor.layout();
                window.editor.focus();
            }
        }, 150);

        // Intercept Enter key: run auto-correct on the line just completed
        window.editor.onKeyDown(async (e) => {
            // KeyCode 3 is Enter
            if (e.keyCode === monaco.KeyCode.Enter) {
                const model = window.editor.getModel();
                const position = window.editor.getPosition();
                const currentLineNumber = position.lineNumber;
                const lineContent = model.getLineContent(currentLineNumber);

                // Ignore empty or whitespace-only lines
                if (!lineContent.trim() || lineContent.trim().length < 3) return;

                // Fire async corruption without blocking the Enter keystroke
                setTimeout(async () => {
                    await handleLineCorruption(currentLineNumber, lineContent);
                }, 100);
            }
        });

        // Also check if the user moved away from a line without pressing Enter
        let lastLineNumber = 1;
        window.editor.onDidChangeCursorPosition((e) => {
            const currentLineNumber = e.position.lineNumber;
            if (currentLineNumber !== lastLineNumber) {
                const model = window.editor.getModel();
                const prevContent = model.getLineContent(lastLineNumber);
                if (prevContent.trim() && !processedLines.has(`${lastLineNumber}:${prevContent}`)) {
                    const lineToCheck = lastLineNumber;
                    setTimeout(async () => {
                        await handleLineCorruption(lineToCheck, prevContent);
                    }, 150);
                }
                lastLineNumber = currentLineNumber;
            }
        });
    });
}

/**
 * Executes the line corruption and performs in-place edit in Monaco
 */
async function handleLineCorruption(lineNumber, originalText) {
    if (isReplacing) return;
    const cacheKey = `${lineNumber}:${originalText.trim()}`;
    if (processedLines.has(cacheKey)) return;

    const corrupted = await corruptPreviousLine(originalText);
    if (!corrupted || corrupted === originalText) return;

    const model = window.editor.getModel();
    if (!model) return;

    // Check if the target line still has the expected text
    const currentTextOnLine = model.getLineContent(lineNumber);
    if (currentTextOnLine.trim() !== originalText.trim()) return;

    isReplacing = true;
    processedLines.add(`${lineNumber}:${corrupted.trim()}`);

    // Apply the replacement directly to the model
    model.applyEdits([
        {
            range: new monaco.Range(lineNumber, 1, lineNumber, currentTextOnLine.length + 1),
            text: corrupted
        }
    ]);

    // Briefly flash the line to show the sabotage occurred
    decorations = window.editor.deltaDecorations(decorations, [
        {
            range: new monaco.Range(lineNumber, 1, lineNumber, corrupted.length + 1),
            options: { isWholeLine: true, className: 'corrupted-line-highlight' }
        }
    ]);

    setTimeout(() => {
        decorations = window.editor.deltaDecorations(decorations, []);
    }, 600);

    isReplacing = false;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMonaco);
} else {
    setupMonaco();
}