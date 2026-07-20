import { useEffect, useState } from "react";
import "./App.css";

const lengths = [
    { value: "Short", label: "Short", detail: "~100 words" },
    { value: "Medium", label: "Medium", detail: "~180 words" },
    { value: "Long", label: "Long", detail: "~300 words" },
];

const languages = ["English", "Hinglish"];

function SparkleIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2.8 13.65 8.35 19.2 10 13.65 11.65 12 17.2l-1.65-5.55L4.8 10l5.55-1.65L12 2.8Z" fill="currentColor" />
            <path d="m18.5 15.2.75 2.55 2.55.75-2.55.75-.75 2.55-.75-2.55-2.55-.75 2.55-.75.75-2.55Z" fill="currentColor" />
        </svg>
    );
}

function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function App() {
    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState("");
    const [length, setLength] = useState("Short");
    const [language, setLanguage] = useState("English");
    const [post, setPost] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function loadTags() {
            try {
                const response = await fetch("http://localhost:5000/tags");
                if (!response.ok) throw new Error("Unable to load topics");

                const data = await response.json();
                setTags(data);
                if (data.length > 0) setTag(data[0]);
            } catch {
                setError("Couldn’t reach the generator. Make sure the backend is running.");
            } finally {
                setIsLoadingTags(false);
            }
        }

        loadTags();
    }, []);

    async function generate() {
        if (!tag || isGenerating) return;

        setError("");
        setIsGenerating(true);
        setCopied(false);

        try {
            const response = await fetch("http://localhost:5000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ length, language, tag }),
            });

            if (!response.ok) throw new Error("Unable to generate post");
            const data = await response.json();
            setPost(data.post || "");
        } catch {
            setError("Something went wrong while creating your post. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    async function copyPost() {
        if (!post) return;

        try {
            await navigator.clipboard.writeText(post);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            setError("Copy wasn’t available in this browser. Please select the text manually.");
        }
    }

    const wordCount = post.trim() ? post.trim().split(/\s+/).length : 0;

    return (
        <main className="app-shell">
            <div className="aurora aurora-one" />
            <div className="aurora aurora-two" />

            <header className="topbar">
                <a className="brand" href="#top" aria-label="Postcraft home">
                    <span className="brand-mark"><SparkleIcon /></span>
                    <span>postcraft</span>
                </a>
                <span className="topbar-label">LinkedIn post studio</span>
            </header>

            <section className="hero" id="top">
                <p className="eyebrow"><span /> AI writing assistant</p>
                <h1>Turn your ideas into<br /><em>thoughtful posts.</em></h1>
                <p className="hero-copy">Create a polished LinkedIn post in your voice, without staring at a blank page.</p>
            </section>

            <section className="studio" aria-label="Post generator">
                <aside className="control-panel">
                    <div className="panel-heading">
                        <p className="section-kicker">Post settings</p>
                        <p>Make it yours</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="topic">What are you writing about?</label>
                        <div className="select-wrap">
                            <select id="topic" value={tag} onChange={(event) => setTag(event.target.value)} disabled={isLoadingTags}>
                                {isLoadingTags && <option>Loading topics…</option>}
                                {!isLoadingTags && tags.length === 0 && <option>No topics available</option>}
                                {tags.map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </div>
                    </div>

                    <fieldset className="field-group option-group">
                        <legend>Post length</legend>
                        <div className="segmented-control">
                            {lengths.map((item) => (
                                <button
                                    className={length === item.value ? "segment active" : "segment"}
                                    key={item.value}
                                    onClick={() => setLength(item.value)}
                                    type="button"
                                >
                                    <span>{item.label}</span><small>{item.detail}</small>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="field-group option-group">
                        <legend>Writing language</legend>
                        <div className="language-options">
                            {languages.map((item) => (
                                <label className={language === item ? "language-option selected" : "language-option"} key={item}>
                                    <input type="radio" name="language" value={item} checked={language === item} onChange={() => setLanguage(item)} />
                                    <span className="radio-dot" />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {error && <p className="error-message" role="alert">{error}</p>}

                    <button className="generate-button" onClick={generate} disabled={!tag || isGenerating}>
                        <span className="button-icon"><SparkleIcon /></span>
                        {isGenerating ? "Crafting your post…" : "Generate post"}
                        {!isGenerating && <span className="arrow-icon"><ArrowIcon /></span>}
                    </button>
                </aside>

                <article className={post ? "output-panel has-content" : "output-panel"} aria-live="polite">
                    <div className="output-topline">
                        <div>
                            <p className="section-kicker">Your draft</p>
                            <p className="output-status">{post ? "Ready to refine" : "Waiting for your idea"}</p>
                        </div>
                        {post && (
                            <button className="copy-button" onClick={copyPost} type="button">
                                <CopyIcon /> {copied ? "Copied" : "Copy"}
                            </button>
                        )}
                    </div>

                    <div className="output-body">
                        {isGenerating ? (
                            <div className="generating-state">
                                <span className="generation-orb"><SparkleIcon /></span>
                                <p>Finding the right words…</p>
                                <span>Your post will appear here in a moment.</span>
                            </div>
                        ) : post ? (
                            <textarea aria-label="Generated LinkedIn post" value={post} onChange={(event) => setPost(event.target.value)} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-illustration"><SparkleIcon /></div>
                                <h2>A clear thought starts here.</h2>
                                <p>Choose a topic, set the tone, and let us turn your insight into a post worth reading.</p>
                            </div>
                        )}
                    </div>

                    <footer className="output-footer">
                        <span>{post ? `${wordCount} words` : "Your draft is editable"}</span>
                        <span className="autosave"><i /> {post ? "Ready to publish" : "One click away"}</span>
                    </footer>
                </article>
            </section>

            <p className="bottom-note">Built for ideas worth sharing <span>✦</span></p>
        </main>
    );
}

export default App;
