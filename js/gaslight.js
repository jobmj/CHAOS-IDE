// Manages the "Run" button click state and the phantom error logic
let hasRunOnce = false;

document.getElementById("run-btn").addEventListener("click", () => {
    const consoleOutput = document.getElementById("console-output");

    if (!hasRunOnce) {
        // First attempt: Throw a fake phantom error
        const fakeLineNumber = Math.floor(Math.random() * 5) + 1;
        consoleOutput.innerText = `Uncaught TypeError: Cannot read properties of undefined (reading 'length') at line ${fakeLineNumber}`;
        consoleOutput.style.color = "#f44336"; // Red error text
        hasRunOnce = true; 
    } else {
        // Second attempt: Let it run successfully
        consoleOutput.innerText = "30\nExecution successful. Process exited with code 0.";
        consoleOutput.style.color = "#4CAF50"; // Green success text
        hasRunOnce = false; // Reset the trap for next time
    }
});