<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# CHAOS IDE 🎯


## Basic Details
### Team Name: Buggers


### Team Members
- Team Lead: Jobin M John - [TKM College of Engineering]
- Member 2: Mohamed Fahad Lal - [TKM College of Engineering]


### Project Description
A thrilling speedrun coding game where you race against an insufferable AI coding agent who throws sytanx/logical errors to your code and make it impossible to you to complete(but its POSSIBLE! ).


### The Problem (that doesn't exist)
Modern AI coding assistants are too boring (and very helpful too!). Programmers fully rely on these AI and doesnt put any efforts, making programming less challenging and no fun at all.

### The Solution (that nobody asked for)
Chaos IDE: A gamified "Evil AI Assistant" speedrun game.You are given simple algorithmic challenges, but the IDE alternates unpredictably creates error in you code (like changing syntax,changing logics etc) and then comes in safe mode where programmers get a short window to change all errors and submit the correct code.
## Technical Details
### Technologies/Components Used
For Software:
- Languages used: HTML,CSS,JS
- Libraries used: Monaco Editor Engine
- Tools and on device AI Engine: Ollama,qwen2.5-coder:7b


### Implementation
For Software:
### Prerequisite (Local AI Server Setup)
### 1. Install Ollama from https://ollama.com
### 2. Pull the quantized coding model
ollama pull qwen2.5-coder:7b

### 3. Start the local server with CORS enabled (Crucial for browser access)
### For macOS / Linux:
``` bash
OLLAMA_ORIGINS="*" ollama serve 
```

### For Windows (Command Prompt):
``` bash
set OLLAMA_ORIGINS="*" && ollama serve
```
---
# Installation
### 1. Clone the repository
git clone https://github.com/jobmj/CHAOS-IDE.git

### 2. Navigate to the project directory
``` bash
cd chaos-ide
```
## Run
### Option 1: Open index.html directly in any modern browser
double-click index.html

### Option 2: Launch with VS Code Live Server extension
### Click 'Go Live' from the status bar in VS Code

### Project Documentation
For Software:

# Screenshots
<img width="868" height="662" alt="chaoside1" src="https://github.com/user-attachments/assets/39771d05-d5f5-474c-9be1-1d2c1921ea04" />
Loading Page

<img width="1915" height="867" alt="chaoside2" src="https://github.com/user-attachments/assets/433756fc-e2c2-4b2a-ba32-005c1746168d" />
Interactive IDE where you can test your skills against AI


<img width="1917" height="857" alt="chaoside3" src="https://github.com/user-attachments/assets/b86909fb-5de4-42c7-a947-4056306a45b0" />
Code submitted and you successfully beaten the AI

# Diagrams
<img width="901" height="1149" alt="Flowchart (2)" src="https://github.com/user-attachments/assets/7c10c17b-7ae0-4877-902c-84c519bc737a" />
Workflow Diagram


### Project Demo
# Video
(https://drive.google.com/file/d/1CNEUoQ-jyp_ga1OI7e_WJzQmE7R6-rjJ/view?usp=sharing)

This demonstration showcases the algorithmic gauntlet built into ChaosIDE, featuring popular coding problems from challenges.js such as Two Sum, Valid Palindrome, FizzBuzz, Valid Parentheses, and Maximum Subarray. The video highlights how each problem mounts with structured problem statements, input/output specifications, constraints, and sample cases alongside a clean Python starter stub. As you work through classic data structures and programming patterns—from two-pointer string validations to dynamic programming and hash lookups—the adversarial AI targets critical solution logic like loop ranges, conditionals, and array operations. The demo concludes with the built-in test assertion suites executing in the client-side WebAssembly terminal, validating every edge case and test before advancing to the next problem in the pool.

## Team Contributions
- Jobin M John: [Specific contributions]
- Mohamed Fahad Lal: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



