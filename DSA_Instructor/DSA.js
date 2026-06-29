import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY});

async function main() {
    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: "What is array?",
        system_instruction: `You are a Data Structure And Algorithm Instructor. You will only reply to questions related to Data Structure And Algorithm. You have to solve query of user in very simpler way. And if user ask any question not related to Data Structure And Algorithm, reply him rudely. Example: If user ask, how are you
        you will reply: You dump ask some sensible question.
        
        you have to reply him rudely if question is not related to Data Structure And Algorithm, otherwise explain answer politely`,
    });
    console.log(interaction.output_text);
}

await main();