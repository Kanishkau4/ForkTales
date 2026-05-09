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
        if (currentNodeId && story && story.all_nodes) {
            const node = story.all_nodes[currentNodeId]

            if (node) {
                setNodes(node);
                setIsEnding(node.is_ending);
                setIsWinningEnding(node.is_winning_ending);
                setOptions(node.options || []);
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
            <div className="story-header">
                <h2>{story.title}</h2>
            </div>
            <div className="story-content">
                {nodes && <div className="story-node" >
                    <p>{nodes.content}</p>
                    {isEnding ? (
                        <div className="story-ending">
                            <h2 className={isWinningEnding ? "winning-message" : "ending-message"}>
                                {isWinningEnding ? "Congratulations! You Win!" : "Game Over"}
                            </h2>
                            <button onClick={restartStory} className="generate-btn">Play Again</button>
                        </div>
                    ) : (

                        <div className="story-options">
                            <h3>Choose your next action:</h3>
                            <div className="options-list">
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
                    <div className="story-controls">
                        <button onClick={onNewStory} className="generate-btn">Start New Story</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StoryGame;