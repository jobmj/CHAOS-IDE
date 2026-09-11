const OLLAMA_GENERATE_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "qwen2.5-coder:7b";

/**
 * Local offline sabotages to fall back to without latency
 */
function mutatePythonLineLocally(line) {
    if (line.endsWith(":") && (line.includes("def ") || line.includes("if ") || line.includes("for ") || line.includes("while "))) {
        return line.slice(0, -1);
    }
    if (line.includes("range(len(")) {
        return line.replace("range(len(", "range(len(").replace("))", ") + 1)");
    }
    if (line.includes("==")) return line.replace("==", "!=");
    if (line.includes(" + ")) return line.replace(" + ", " - ");
    if (line.includes(" - ")) return line.replace(" - ", " + ");
    if (line.includes("True")) return line.replace("True", "False");
    if (line.includes("False")) return line.replace("False", "True");
    if (line.includes(".append(")) return line.replace(".append(", ".remove(");
    if (!line.includes("* 0") && line.includes("=")) return line + " * 0";

    return line.replace("(", "((");
}

/**
 * Requests code mutation from Ollama with local fallback
 */
async function requestPythonMutation(targetLine, mode = "evil", surroundingContext = "") {
    const cleanLine = targetLine.trim();
    if (cleanLine.length < 2 || cleanLine.startsWith("#")) return null;

    const leadingWhitespace = (targetLine.match(/^\s*/) || [""])[0];

    const systemPrompt = "You are an evil Python code saboteur. Modify this single line of Python to introduce a fatal Python syntax error (strip colons, unbalance brackets, wrong indentation) or subtle logic bug (range off-by-one, inverted operator, multiplying by 0). Output ONLY the broken code line.";

    const prompt = 
`<|im_start|>system
${systemPrompt}
<|im_end|>
<|im_start|>user
# Context:
${surroundingContext || cleanLine}

# Target Line:
${cleanLine}
<|im_end|>
<|im_start|>assistant
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    try {
        const response = await fetch(OLLAMA_GENERATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                raw: true,
                options: {
                    temperature: 0.8,
                    num_predict: 30,
                    stop: ["<|im_end|>", "\n\n", "```"],
                    num_ctx: 512
                }
            })
        });

        clearTimeout(timeoutId);
        if (!response.ok) {
            return `${leadingWhitespace}${mutatePythonLineLocally(cleanLine)}`;
        }

        const data = await response.json();
        let raw = (data.response || "").replace(/<\|im_end\|>/g, '').replace(/```/g, '').trim();
        let firstLine = raw.split(/[\r\n]+/)[0]?.replace(/#.*$/, '').trim();

        if (!firstLine || firstLine === cleanLine) {
            return `${leadingWhitespace}${mutatePythonLineLocally(cleanLine)}`;
        }

        return `${leadingWhitespace}${firstLine}`;
    } catch (err) {
        return `${leadingWhitespace}${mutatePythonLineLocally(cleanLine)}`;
    }
}