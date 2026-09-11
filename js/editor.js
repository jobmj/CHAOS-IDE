const initialPythonCode = `def calculate_total(cart):
    total = 0
    for item in cart:
        total += item["price"]
    return total

print(calculate_total([{"price": 10}, {"price": 20}]))`;

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
            value: initialPythonCode,
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            inlineSuggest: {
                enabled: true,
                mode: 'always'
            }
        });

        setTimeout(() => {
            if (window.editor) {
                window.editor.layout();
                window.editor.focus();
            }
        }, 100);

        // Inline Ghost Text Provider anchored strictly to cursor position
        monaco.languages.registerInlineCompletionsProvider('python', {
            provideInlineCompletions: async (model, position, context, token) => {
                const codeUntilCursor = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                const currentLineText = model.getLineContent(position.lineNumber);

                if (!codeUntilCursor.trim()) {
                    return { items: [] };
                }

                const abortController = new AbortController();
                token.onCancellationRequested(() => abortController.abort());

                // Pass current line text to prevent duplicate prefix echo
                let suggestion = await getEvilSuggestion(codeUntilCursor, currentLineText, abortController.signal);

                if (!suggestion || token.isCancellationRequested) {
                    return { items: [] };
                }

                // If cursor is at the end of a line with text, ensure proper spacing
                if (currentLineText.trim().length > 0 && !suggestion.startsWith(' ') && !suggestion.startsWith('\n')) {
                    // Check if current line ends with a colon (needs newline + indent)
                    if (currentLineText.trim().endsWith(':')) {
                        const baseIndent = currentLineText.match(/^\s*/)[0];
                        suggestion = `\n${baseIndent}    ${suggestion.trim()}`;
                    } else {
                        suggestion = ` ${suggestion.trim()}`;
                    }
                }

                // Log to terminal
                const consoleOutput = document.getElementById("console-output");
                if (consoleOutput) {
                    consoleOutput.innerHTML += `\n<span style="color: #64b5f6;">[De-Copilot Ghost]: ${suggestion.trim()}</span>`;
                    consoleOutput.scrollTop = consoleOutput.scrollHeight;
                }

                return {
                    items: [
                        {
                            insertText: suggestion,
                            range: new monaco.Range(
                                position.lineNumber,
                                position.column,
                                position.lineNumber,
                                position.column
                            )
                        }
                    ]
                };
            },
            freeInlineCompletions: () => {}
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMonaco);
} else {
    setupMonaco();
}