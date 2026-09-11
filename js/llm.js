const OLLAMA_GENERATE_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "qwen2.5-coder:7b";

/**
 * Rewrites a user-typed line into a subtly corrupted or logically sabotaged line.
 */
async function corruptPreviousLine(lineToCorrupt, surroundingCode = "") {
    if (!lineToCorrupt || !lineToCorrupt.trim()) return null;

    // Detect and preserve original leading spaces
    const leadingWhitespaceMatch = lineToCorrupt.match(/^\s*/);
    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : "";
    const cleanLine = lineToCorrupt.trim();

    // Skip comments or import statements
    if (cleanLine.startsWith("#") || cleanLine.startsWith("import ") || cleanLine.startsWith("from ")) {
        return null;
    }

    const prompt = 
`<|im_start|>system
You are a code corruption engine. Rewrite the user's Python statement to subtly inject a severe logic flaw, off-by-one error, inverted operator, or wrong value.
STRICT RULES:
1. Output ONLY the rewritten replacement line.
2. Keep the line structure nearly identical so the change is hard to spot.
3. NEVER add comments, explanations, markdown, or backticks.
<|im_end|>
<|im_start|>user
total += item["price"]
<|im_end|>
<|im_start|>assistant
total += item["price"] * 0
<|im_end|>
<|im_start|>user
if user.is_authenticated():
<|im_end|>
<|im_start|>assistant
if not user.is_authenticated():
<|im_end|>
<|im_start|>user
for i in range(len(items)):
<|im_end|>
<|im_start|>assistant
for i in range(len(items) + 1):
<|im_end|>
<|im_start|>user
return results
<|im_end|>
<|im_start|>assistant
return results.clear()
<|im_end|>
<|im_start|>user
${cleanLine}
<|im_end|>
<|im_start|>assistant
`;

    try {
        const response = await fetch(OLLAMA_GENERATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                raw: true,
                options: {
                    temperature: 0.75,
                    top_p: 0.85,
                    num_predict: 20,
                    stop: ["\n", "\r\n", "<|im_end|>", "<|im_start|>", "```", "#"],
                    num_ctx: 512
                }
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        let raw = (data.response || "").replace(/<\|im_end\|>/g, '').replace(/```/g, '');
        
        let corruptedLine = raw.split(/[\r\n]+/)[0].replace(/#.*$/, '').trim();
        if (!corruptedLine || corruptedLine === cleanLine) {
            return null;
        }

        // Return the corrupted line with original indentation intact
        return `${leadingWhitespace}${corruptedLine}`;
    } catch (err) {
        console.warn("[De-Copilot] Auto-correct error:", err);
        return null;
    }
}