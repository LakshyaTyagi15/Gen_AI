import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
import readlinesync from 'readline-sync';
import { exec } from 'child_process';
import { promisify } from "util";
import os from 'os';

const platform = os.platform();
const asyncExecute = promisify(exec);
const History = [];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function executeCommand({ command }) {
    try {
        const { stdout, stderr } = await asyncExecute(command);
        if (stderr) {
            return `Error: ${stderr}`;
        } else {
            return `Success: ${stdout} || Task completed`;
        }
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

const executeCommandDeclaration = {
    name: "executeCommand",
    description: 'Execute a single terminal/shell command. A command can be to create a folder, file, write on a file, edit the file or delete the file.',
    parameters: {
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'It will be single terminal command. Ex - "mkdir Calculator" ',
            },
        },
        required: ['command'],
    },
};

// Tool mapping
const availableTools = {
    executeCommand: executeCommand
};

async function runAgent(userProblem) {
    History.push({
        role: 'user',
        parts: [{ text: userProblem }]
    });

    while (true) {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash',
            contents: History,
            config: {
                systemInstruction: `You are an Website builder expert. You have to create the frontend of the website by analysing the user Input.
        You have access of tool, which can run or execute any shell or terminal command.
        
        Current user operation system is: ${platform}
        Give command to the user according to its operating system support.

        <-- What is your job -->
        1: Analyse the user query to see what type of website the want to build
        2: Give them command one by one , step by step
        3: Use available tool executeCommand

        // Now you can give them command in following below
        1: First create a folder, Ex: mkdir "calulator"
        2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
        3: Then create style.css same as above
        4: Then create script.js
        5: Then write a code in html file

        You have to provide the terminal or shell command to user, they will directly execute it`,

                tools: [{ functionDeclarations: [executeCommandDeclaration] }],
            }
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const name = call.name;
            const args = call.args;

            console.log(`\n[Agent is running terminal command]: ${args.command}`);

            const funCall = availableTools[name];
            const result = await funCall(args);

            History.push({
                role: "model",
                parts: [{ functionCall: call }],
            });

            History.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: name,
                        response: { result: result }
                    }
                }],
            });
        } else {
            console.log(`\nAgent: ${response.text}\n`);

            History.push({
                role: 'model',
                parts: [{ text: response.text }]
            });
            break;
        }
    }
}

async function main() {
    console.log("I am cursor, let's create a website");

    while (true) {
        const userProblem = readlinesync.question("Ask me anything (or type 'exit' to quit):--> ");

        if (userProblem.toLowerCase() === 'exit') {
            console.log("Goodbye!");
            break;
        }

        await runAgent(userProblem);
    }
    main();
}

main();