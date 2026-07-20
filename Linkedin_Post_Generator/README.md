# LinkedIn Post Generator

A full-stack application that creates LinkedIn posts from a selected topic, post length, and language. The frontend provides a focused writing workspace, while the Express backend uses Groq through LangChain to generate the post.

## Features

- Generate posts for available topics from the bundled example data
- Choose short, medium, or long post formats
- Generate in English or Hinglish
- Edit and copy generated posts from the browser
- Modern, responsive React interface

## Tech stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **AI:** LangChain + Groq

## Project structure

```text
.
├── Backend/                 # Express API and post-generation logic
│   ├── data/                # Source and processed LinkedIn post examples
│   ├── index.js             # API server entry point
│   └── package.json
├── Frontend/vite-project/   # React + Vite application
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- A [Groq API key](https://console.groq.com/keys)

## Getting started

1. Clone the repository and enter the project directory.

   ```bash
   git clone <your-repository-url>
   cd Linkedin_Post_Generator
   ```

2. Set up the backend.

   ```bash
   cd Backend
   npm install
   ```

   Create a file named `.env` inside `Backend` and add your Groq API key:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

   Start the API server:

   ```bash
   node index.js
   ```

   The backend runs at `http://localhost:5000`.

3. In a separate terminal, start the frontend.

   ```bash
   cd Frontend/vite-project
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available API routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/tags` | Returns the available post topics. |
| `POST` | `/generate` | Generates a LinkedIn post from `tag`, `length`, and `language`. |

Example request body for `POST /generate`:

```json
{
  "tag": "Mental Health",
  "length": "Medium",
  "language": "English"
}
```

## Frontend commands

Run these from `Frontend/vite-project`.

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Lint the frontend source
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes | API key used by the backend to generate posts. |

Never commit `.env` files or API keys. They are excluded by the included `.gitignore`.

## License

This project is available for personal and educational use.
