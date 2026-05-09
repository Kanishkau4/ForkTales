import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingState from "./LoadingStatus";
import StoryGame from "../components/StoryGame";
import { API_BASE_URL } from "../util";

function StoryLoader() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStory(id);
    }, [id]);

    const fetchStory = async (storyId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/story/${storyId}/complete`);
            setStory(response.data);
        } catch (error) {
            setError("Failed to load story");
            console.error("Error fetching story:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const formatStoryText = (text) => {
        if (!text) return "";

        return text.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ));
    };

    return (
        <div className="story-container">
            {isLoading ? (
                <LoadingState />
            ) : error ? (
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => fetchStory(id)} className="generate-btn">Try Again</button>
                    <button onClick={() => navigate('/')} className="btn btn-outline mt-2">Back to Home</button>
                </div>
            ) : (
                <StoryGame story={story} onNewStory={() => navigate('/')} />
            )}
        </div>
    );
}

export default StoryLoader;
