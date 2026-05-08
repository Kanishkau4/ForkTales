import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../util";
import LoadingStatus from "./LoadingStatus";
import ThemeInput from "./ThemeInput";
import StoryGame from "./StoryGame";

function StoryGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [theme, setTheme] = useState("");
    const [jobId, setJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);

    const pullJobStatus = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/job/${id}`);
            const { status, story_id, error: jobError } = response.data;
            setJobStatus(status);
            if (status === "completed" && story_id) {
                fetchStory(story_id);
            } else if (status === "failed" || jobError) {
                setError(jobError || "Failed to generate story");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Failed to fetch job status");
            console.error("Error fetching job status:", error);
            setIsLoading(false);
        }
    };

    const fetchStory = async (id) => {
        try {
            setIsLoading(true);
            setError(null);
            setJobStatus("completed");
            navigate(`/story/${id}`);
        } catch (error) {
            setError("Failed to fetch story");
            console.error("Error fetching story:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const reseat = () => {
        setIsLoading(false);
        setError(null);
        setTheme("");
        setJobId(null);
        setJobStatus(null);
    }
    const handleGenerateStory = async (theme) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/story`, { theme });
            setStoryId(response.data.id);
            navigate(`/story/${response.data.id}`);
        } catch (error) {
            setError("Failed to generate story");
            console.error("Error generating story:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="story-generator">
            {isLoading ? (
                <LoadingStatus theme={theme} />
            ) : error ? (
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={handleGenerateStory} className="generate-btn">Try Again</button>
                    <button onClick={() => navigate('/')} className="btn btn-outline mt-2">Back to Home</button>
                </div>
            ) : (
                <ThemeInput onSubmit={handleGenerateStory} />
            )}
        </div>
    );
}

export default StoryGenerator;