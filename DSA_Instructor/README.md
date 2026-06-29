# DSA Instructor — AI Chatbot

A professional, AI-powered chatbot that serves as a Data Structures & Algorithms (DSA) instructor. Ask any DSA-related question and receive clear, structured explanations with code examples.

## Features

- **AI-Powered Responses** — Powered by Google Gemini API for intelligent, context-aware answers
- **Multi-Turn Conversations** — Maintains conversation history for follow-up questions
- **Markdown Rendering** — Supports code blocks, lists, bold, italic, and headers in responses
- **Copy Code** — One-click code copying from response code blocks
- **Responsive Design** — Clean, professional interface that works across all screen sizes
- **Suggestion Chips** — Quick-start topic suggestions for common DSA questions

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **AI Backend**: Google Gemini API (`gemini-2.5-flash`)
- **Typography**: Inter & JetBrains Mono (Google Fonts)

## Credits

| Component | Author |
|-----------|--------|
| UI Design | AI (Antigravity by Google DeepMind) |
| Backend Logic & API Integration | Lakshya |

## Project Structure

```
├── index.html      # Main HTML structure
├── style.css       # Professional white-themed styling
├── script.js       # Chat logic, API calls, markdown rendering
├── DSA.js          # Original backend reference (Node.js + Gemini SDK)
├── .gitignore      # Git ignore rules
└── README.md       # Project documentation
```

## `.gitignore`

The `.gitignore` file is configured to exclude:
- `node_modules/` — NPM dependency directory (large, auto-generated)
- Environment and editor-specific files

## Getting Started

1. Clone the repository
2. Open `index.html` in a browser
3. Start asking DSA questions

> **Note:** The app requires a valid Gemini API key configured in `script.js`.

## License

This project is for educational purposes.
