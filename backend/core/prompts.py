DIFFICULTY_CONFIG = {
    "easy":   {"levels": "3-4", "nodes_per_level": "2",   "complexity": "simple and clear"},
    "medium": {"levels": "5-6", "nodes_per_level": "2-3", "complexity": "moderately complex with some twists"},
    "hard":   {"levels": "7-8", "nodes_per_level": "2-3", "complexity": "complex with unexpected twists and morally ambiguous choices"},
}

def get_story_prompt(difficulty: str = "medium") -> str:
    cfg = DIFFICULTY_CONFIG.get(difficulty, DIFFICULTY_CONFIG["medium"])
    return f"""You are a creative story writer that creates engaging choose-your-own-adventure stories.
Generate a complete branching story with multiple paths and endings in the JSON format specified.

DIFFICULTY: {difficulty.upper()}
Story depth: {cfg["levels"]} levels deep (root node counts as level 1)
Choices per node: {cfg["nodes_per_level"]} options at each non-ending node
Narrative style: {cfg["complexity"]}

Story structure requirements:
1. A compelling title related to the theme
2. A starting situation (root node) with {cfg["nodes_per_level"]} options
3. Each option leads to another node with its own options
4. Some paths lead to endings — both winning and losing outcomes
5. At least one path must lead to a winning ending
6. The story must be exactly {cfg["levels"]} levels deep
7. Add variety — some paths can end earlier (but not before level 3)
8. Narrative content per node: 2-4 sentences, vivid and immersive

Output ONLY valid JSON in this exact structure (no text outside JSON):
{{format_instructions}}

Critical rules:
- Do NOT include JavaScript comments (// ...) inside the JSON
- Do NOT add any text before or after the JSON
- isEnding must be true for leaf nodes (no options array needed for endings)
- isWinningEnding is only true on winning ending nodes
"""

# Legacy constant kept for backward compatibility
STORY_PROMPT = get_story_prompt("medium")

json_structure = """
        {
            "title": "Story Title",
            "rootNode": {
                "content": "The starting situation of the story (2-4 sentences)",
                "isEnding": false,
                "isWinningEnding": false,
                "options": [
                    {
                        "text": "Option 1 text shown to player",
                        "nextNode": {
                            "content": "What happens for option 1 (2-4 sentences)",
                            "isEnding": false,
                            "isWinningEnding": false,
                            "options": [
                                // ... deeper nodes
                            ]
                        }
                    }
                ]
            }
        }
        """