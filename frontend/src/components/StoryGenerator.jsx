import { useEffect, useState } from "react";
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

    useEffect(() => {
        let pullInterval;
        if (jobId && (jobStatus === "pending" || jobStatus === "running")) {
            pullInterval = setInterval(() => {
                pullJobStatus(jobId);
            }, 3000);
        }
        return () => clearInterval(pullInterval);
    }, [jobId, jobStatus]);

    const generateStory = async (theme) => {
        setIsLoading(true);
        setError(null);
        setTheme(theme);
        try {
            const response = await axios.post(`${API_BASE_URL}/story/create`, { theme });
            const { job_id, status } = response.data;
            setJobId(job_id);
            setJobStatus(status);

            pullJobStatus(job_id);
        } catch (error) {
            setError(error.response?.data?.error || "Failed to generate story");
            setIsLoading(false);
        }
    }

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


    return (
        <div className="story-generator">
            {isLoading ? (
                <LoadingStatus theme={theme} />
            ) : error ? (
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => generateStory(theme)} className="generate-btn">Try Again</button>
                    <button onClick={() => navigate('/')} className="generate-btn">Back to Home</button>
                </div>
            ) : (
                <ThemeInput onSubmit={generateStory} />
            )}
        </div>
    );
}

export default StoryGenerator;