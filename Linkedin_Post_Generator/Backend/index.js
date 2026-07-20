import express from "express";
import cors from "cors";

import { FewShotPosts } from "./few_shot.js";
import { generatePost } from "./post_generator.js";

const app = express();

app.use(cors());
app.use(express.json());

const fsPosts = new FewShotPosts();
await fsPosts.loadPosts();

app.get("/tags", (req, res) => {
    res.json(fsPosts.getTags());
});

app.post("/generate", async (req, res) => {

    const { length, language, tag } = req.body;

    const post = await generatePost(length, language, tag);

    res.json({
        post
    });

});

app.listen(5000, () => {
    console.log("Server started");
});