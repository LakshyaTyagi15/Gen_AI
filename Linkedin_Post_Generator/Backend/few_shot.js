import fs from "fs/promises";

export class FewShotPosts {
    constructor(filePath = "data/processed_posts.json") {
        this.posts = [];
        this.uniqueTags = [];
        this.filePath = filePath;
    }

    async loadPosts() {
        const file = await fs.readFile(this.filePath, "utf-8");
        this.posts = JSON.parse(file);

        for (const post of this.posts) {
            post.length = this.categorizeLength(post.line_count);
        }

        const allTags = this.posts.flatMap(post => post.tags);
        this.uniqueTags = [...new Set(allTags)];
    }

    getFilteredPosts(length, language, tag) {
        return this.posts.filter(post =>
            post.tags.includes(tag) &&
            post.language === language &&
            post.length === length
        );
    }

    categorizeLength(lineCount) {
        if (lineCount < 5) {
            return "Short";
        } else if (lineCount <= 10) {
            return "Medium";
        } else {
            return "Long";
        }
    }

    getTags() {
        return this.uniqueTags;
    }
}

async function main() {
    const fsPosts = new FewShotPosts();

    await fsPosts.loadPosts();

    // console.log(fsPosts.getTags());

    const posts = fsPosts.getFilteredPosts(
        "Medium",
        "Hinglish",
        "Job Search"
    );

    console.log(posts);
}

main();