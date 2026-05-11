DIFFICULTY_CONFIG = {
    "easy":   {"levels": "3-4", "choices": "exactly 2", "style": "simple, direct, and heroic"},
    "medium": {"levels": "5-6", "choices": "2 to 3", "style": "moderately complex with subplots and character choices"},
    "hard":   {"levels": "7-8", "choices": "3", "style": "extremely complex with psychological depth, hard moral dilemmas, and intricate branching"},
}

def get_story_prompt(difficulty: str = "medium") -> str:
    cfg = DIFFICULTY_CONFIG.get(difficulty, DIFFICULTY_CONFIG["medium"])
    return f"""You are a master interactive fiction writer.
Generate a branching adventure story in JSON format.

DIFFICULTY LEVEL: {difficulty.upper()}
1. DEPTH: The story MUST be between {cfg["levels"]} levels deep.
2. BRANCHING: Each non-ending node MUST have {cfg["choices"]} choices.
3. NARRATIVE STYLE: {cfg["style"]}
4. STRUCTURE:
   - Level 1: Root Node
   - Level 2 to {int(cfg["levels"].split("-")[-1])-1}: Branching nodes
   - Level {cfg["levels"]}: Final resolution nodes (endings)
5. VARIETY: Ensure a mix of winning and losing endings. Not all paths should be the same length, but the maximum depth must respect the limit.

Story structure requirements:
1. A compelling title related to the theme
2. A starting situation (root node) with {cfg["choices"]} options
3. Each option leads to another node with its own options
4. Some paths lead to endings (both winning and losing outcomes)
5. At least one path must lead to a winning ending
6. The story must be exactly {cfg["levels"]} levels deep
7. Add variety - some paths can end earlier (but not before level 3)
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