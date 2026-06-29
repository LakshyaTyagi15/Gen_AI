// ===== Configuration =====
const GEMINI_API_KEY = process.env.API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are a Data Structure And Algorithm Instructor. You will only reply to questions related to Data Structure And Algorithm. You have to solve query of user in very simpler way. And if user ask any question not related to Data Structure And Algorithm, reply him rudely. Example: If user ask, how are you
you will reply: You dump ask some sensible question.

you have to reply him rudely if question is not related to Data Structure And Algorithm, otherwise explain answer politely.

When explaining code, always use markdown code blocks with the programming language specified. Use bullet points, numbered lists, and bold text to make explanations clear and structured.`;

// ===== DOM Elements =====
const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearChat");
const welcomeScreen = document.getElementById("welcomeScreen");

// ===== Chat History (for multi-turn conversation) =====
let chatHistory = [];

// ===== Event Listeners =====
sendBtn.addEventListener("click", handleSend);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// Auto-resize textarea
userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
});

// Clear chat
clearBtn.addEventListener("click", () => {
    chatHistory = [];
    chatArea.innerHTML = "";
    chatArea.appendChild(createWelcomeScreen());
    userInput.focus();
});

// Suggestion chips
document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        userInput.value = chip.dataset.query;
        handleSend();
    });
});

// ===== Main Send Handler =====
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    // Hide welcome screen
    if (welcomeScreen) {
        welcomeScreen.remove();
    }

    // Add user message
    appendMessage("user", text);
    userInput.value = "";
    userInput.style.height = "auto";
    sendBtn.disabled = true;

    // Add to history
    chatHistory.push({ role: "user", parts: [{ text }] });

    // Show typing indicator
    const typingEl = showTypingIndicator();

    try {
        const response = await callGeminiAPI(text);
        typingEl.remove();
        appendMessage("bot", response);
        chatHistory.push({ role: "model", parts: [{ text: response }] });
    } catch (error) {
        typingEl.remove();
        appendMessage("bot", `Error: ${error.message}. Please try again.`, true);
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// ===== Gemini API Call =====
async function callGeminiAPI(userMessage) {
    const requestBody = {
        system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: chatHistory,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
        },
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
            errData?.error?.message || `API request failed (${response.status})`
        );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated. The AI could not process your request.");
    }

    return data.candidates[0].content.parts[0].text;
}

// ===== Append Message to Chat =====
function appendMessage(role, content, isError = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", role);

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = role === "user" ? "Y" : "AI";

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    if (isError) bubble.classList.add("error-bubble");

    if (role === "bot" && !isError) {
        bubble.innerHTML = renderMarkdown(content);
        addCopyButtons(bubble);
    } else {
        bubble.textContent = content;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatArea.appendChild(messageDiv);
    scrollToBottom();
}

// ===== Simple Markdown Renderer =====
function renderMarkdown(text) {
    // Escape HTML
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || "code";
        return `<div class="code-block-header"><span>${language}</span><button class="copy-btn" data-code="${encodeURIComponent(code.trim())}">Copy</button></div><pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Headers
    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Unordered lists
    html = html.replace(/^[\*\-] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // Line breaks (convert remaining newlines)
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");

    // Wrap in paragraph
    html = "<p>" + html + "</p>";

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/<p>(<h[1-4]>)/g, "$1");
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, "$1");
    html = html.replace(/<p>(<ul>)/g, "$1");
    html = html.replace(/(<\/ul>)<\/p>/g, "$1");
    html = html.replace(/<p>(<div class="code-block-header">)/g, "$1");
    html = html.replace(/(<\/pre>)<\/p>/g, "$1");

    return html;
}

// ===== Add Copy Buttons to Code Blocks =====
function addCopyButtons(bubble) {
    bubble.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const code = decodeURIComponent(btn.dataset.code);
            navigator.clipboard.writeText(code).then(() => {
                btn.textContent = "Copied!";
                setTimeout(() => (btn.textContent = "Copy"), 2000);
            });
        });
    });
}

// ===== Typing Indicator =====
function showTypingIndicator() {
    const typing = document.createElement("div");
    typing.classList.add("typing-indicator");
    typing.innerHTML = `
        <div class="avatar">AI</div>
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    chatArea.appendChild(typing);
    scrollToBottom();
    return typing;
}

// ===== Scroll to Bottom =====
function scrollToBottom() {
    requestAnimationFrame(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
    });
}

// ===== Recreate Welcome Screen =====
function createWelcomeScreen() {
    const welcome = document.createElement("div");
    welcome.classList.add("welcome-screen");
    welcome.id = "welcomeScreen";
    welcome.innerHTML = `
        <div class="welcome-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        </div>
        <h2>Welcome to DSA Instructor</h2>
        <p>Your AI-powered Data Structures & Algorithms tutor. Ask me anything about DSA!</p>
        <div class="suggestion-chips">
            <button class="chip" data-query="What is a linked list and how does it differ from an array?">Linked List vs Array</button>
            <button class="chip" data-query="Explain Binary Search Tree with an example">Binary Search Tree</button>
            <button class="chip" data-query="What is the time complexity of QuickSort?">QuickSort Complexity</button>
            <button class="chip" data-query="Explain BFS and DFS graph traversal algorithms">BFS vs DFS</button>
            <button class="chip" data-query="What is dynamic programming? Explain with a simple example.">Dynamic Programming</button>
            <button class="chip" data-query="Explain the concept of a stack and its applications">Stack Applications</button>
        </div>
    `;

    // Re-bind chip listeners
    welcome.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            userInput.value = chip.dataset.query;
            handleSend();
        });
    });

    return welcome;
}
