import { useState, useEffect } from "react";

function StoryGame({ story, onNewStory }) {
    const [nodes, setNodes] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState("start");
    const [options, setOptions] = useState([]);
    const [isEnding, setIsEnding] = useState(false);
    const [isWinningEnding, setIsWinningEnding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (story && story.root_node) {
            const rootNodeID = story.root_node.id;
            setCurrentNodeId(rootNodeID);
        }
    }, [story]);

    useEffect(() => {
        if (currentNodeId && story && story.story_nodes) {
            const node = story.story_nodes[currentNodeId]

            setNodes(node);
            setIsEnding(node.is_ending);
            setIsWinningEnding(node.is_winning_ending);

            if (!node.is_ending && node.options && node.options.length > 0) {
                setOptions(node.options)
            } else {
                setOptions([])
            }
        }
    }, [currentNodeId, story]);

    const chooseOption = (optionId) => {
        setCurrentNodeId(optionId);
    };

    const restartStory = () => {
        if (story && story.root_node) {
            setCurrentNodeId(story.root_node.id);
            setIsEnding(false);
            setIsWinningEnding(false);
        }
    };

    return (
        <div className="story-game">
            <div className="story-card">
                <h2 className="story-header">{story.title}</h2>
                <div className="story-content">
                    {nodes && <div className="story-node" >
                        <p>{nodes.content}</p>
                        {isEnding ? (
                            <div className="story-endings">
                                <h2 className="ending-text">
                                    {isWinningEnding ? "Congratulations! You Win!" : "Game Over"}
                                </h2>
                                <button onClick={restartStory} className="generate-btn">Play Again</button>
                            </div>
                        ) : (

                            <div className="story-options">
                                <h4>Choose your next action:</h4>
                                <div className="options-grid">
                                    {options.map((option) => (
                                        <button key={option.node_id} onClick={() => chooseOption(option.node_id)} className="option-btn">
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>}
                    {isEnding && (
                        <div className="story-footer">
                            <button onClick={onNewStory} className="generate-btn">Start New Story</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StoryGame;