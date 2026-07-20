import fs from "fs/promises";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { llm } from "./llm_helper.js";

async function processPosts(rawFilePath, processedFilePath) {
    const file = await fs.readFile(rawFilePath, "utf-8");
    const posts = JSON.parse(file);

    const enrichedPosts = [];

    for (const post of posts) {
        const metadata = await extractMetadata(post.text);

        enrichedPosts.push({
            ...post,
            ...metadata
        });
    }

    const unifiedTags = await getUnifiedTags(enrichedPosts);

    for (const post of enrichedPosts) {
        const newTags = [...new Set(post.tags.map(tag => unifiedTags[tag]))];
        post.tags = newTags;
    }

    await fs.writeFile(
        processedFilePath,
        JSON.stringify(enrichedPosts, null, 4),
        "utf-8"
    );
}

async function extractMetadata(post) {
    const template = `
You are given a LinkedIn post. You need to extract number of lines, language of the post and tags.

1. Return a valid JSON. No preamble.
2. JSON object should have exactly three keys: line_count, language and tags.
3. tags is an array of text tags. Extract maximum two tags.
4. Language should be English or Hinglish (Hinglish means Hindi + English)

Here is the actual post on which you need to perform this task:

{post}
`;

    const prompt = PromptTemplate.fromTemplate(template);

    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
        post
    });

    try {
        const parser = new JsonOutputParser();
        return await parser.parse(response.content);
    } catch {
        throw new Error("Context too big. Unable to parse jobs.");
    }
}

async function getUnifiedTags(postsWithMetadata) {
    const uniqueTags = new Set();

    for (const post of postsWithMetadata) {
        for (const tag of post.tags) {
            uniqueTags.add(tag);
        }
    }

    const uniqueTagsList = [...uniqueTags].join(",");

    const template = `
I will give you a list of tags. You need to unify tags with the following requirements.

1. Tags are unified and merged to create a shorter list.
   Example 1: "Jobseekers", "Job Hunting" can be merged into "Job Search".
   Example 2: "Motivation", "Inspiration", "Drive" can be mapped to "Motivation".
   Example 3: "Personal Growth", "Personal Development", "Self Improvement" can be mapped to "Self Improvement".
   Example 4: "Scam Alert", "Job Scam" can be mapped to "Scams".

2. Each tag should follow Title Case.
   Example: "Motivation", "Job Search".

3. Output should be a valid JSON object. No preamble.

4. Output should map every original tag to its unified tag.

For example:

{{
    "Jobseekers": "Job Search",
    "Job Hunting": "Job Search",
    "Motivation": "Motivation"
}}

Here is the list of tags:

{tags}
`;

    const prompt = PromptTemplate.fromTemplate(template);

    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
        tags: uniqueTagsList
    });

    try {
        const parser = new JsonOutputParser();
        return await parser.parse(response.content);
    } catch (err) {
        console.error(response.content);
        throw new Error("Context too big. Unable to parse jobs.");
    }
}

processPosts(
    "data/raw_posts.json",
    "data/processed_posts.json"
);