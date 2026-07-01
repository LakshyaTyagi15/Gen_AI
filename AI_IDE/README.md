# AI IDE

A Cursor-like AI coding assistant that builds websites by executing terminal commands, powered by Google's Gemini AI.

## How It Works

You describe the website you want in plain English. The AI agent analyzes your request and builds it step-by-step by running shell commands — creating folders, files, and writing code automatically.

## Tech Stack

- **Node.js** — Runtime
- **Google Gemini AI** (`@google/genai`) — LLM with function calling
- **readline-sync** — Interactive CLI prompts

## Setup

```bash
# Install dependencies
npm install

# Add your Gemini API key to .env
echo "API_KEY=your_gemini_api_key" > .env
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Usage

```bash
npm start
```

Then describe the website you want to build. Type `exit` to quit.

## Project Structure

```
├── index.js         # Main agent logic
├── package.json     # Dependencies & scripts
├── .env             # API key (not committed)
└── .gitignore       # Ignores .env & node_modules
```

## License

ISC
