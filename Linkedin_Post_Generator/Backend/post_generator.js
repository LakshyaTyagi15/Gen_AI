import { llm } from "./llm_helper.js";
import { FewShotPosts } from "./few_shot.js";

const fewShot = new FewShotPosts();
await fewShot.loadPosts();

function getLengthStr(length) {
    switch (length) {
        case "Short":
            return "1 to 5 lines";

        case "Medium":
            return "6 to 10 lines";

        case "Long":
            return "11 to 15 lines";

        default:
            return "6 to 10 lines";
    }
}

function getPrompt(length, language, tag) {
    const lengthStr = getLengthStr(length);

    let prompt = `
Generate a LinkedIn post using the below information. No preamble.

1) Topic: ${tag}
2) Length: ${lengthStr}
3) Language: ${language}

If Language is Hinglish then it means it is a mix of Hindi and English.
The script for the generated post should always be English.
`;

    const examples = fewShot.getFilteredPosts(length, language, tag);

    if (examples.length > 0) {
        prompt += "\n4) Use the writing style as per the following examples.";
    }

    for (let i = 0; i < examples.length && i < 2; i++) {
        prompt += `

Example ${i + 1}:

${examples[i].text}
`;
    }

    return prompt;
}

export async function generatePost(length, language, tag) {
    const prompt = getPrompt(length, language, tag);

    const response = await llm.invoke(prompt);

    return response.content;
}

async function main() {
    const post = await generatePost(
        "Medium",
        "English",
        "Mental Health"
    );

    console.log(post);
}

main();