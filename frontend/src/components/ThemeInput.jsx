import { useState } from "react";

function ThemeInput({ onSubmit }) {
    const [theme, setTheme] = useState("");
    const [error, setError] = useState("");

    const handlesubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!theme.trim()) {
            setError("Please enter a theme for your story");
            return;
        }
        onSubmit(theme);
    }

    return (
        <div className="theme-input-container">
            <h2>Generate Your Own Story</h2>
            <p className="text-muted">Enter a theme and we'll create a unique interactive story for you</p>

            <form onSubmit={handlesubmit} className="input-group mt-4">
                <input
                    type="text"
                    placeholder="Enter theme (e.g: space, mystery, etc.)"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="input-field"
                />
                <button type="submit" className="generate-btn">Generate Story</button>
            </form>
            {error && <p className="error-text mt-2">{error}</p>}

            <div className="examples">
                <h3>Examples:</h3>
                <ul className="examples-list">
                    <li>Space Exploration</li>
                    <li>Magic Forest</li>
                    <li>Robot Detective</li>
                    <li>Time Travel</li>
                    <li>Ocean Adventure</li>
                </ul>
            </div>
        </div>
    )
}

export default ThemeInput;