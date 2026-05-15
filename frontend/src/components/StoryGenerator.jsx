import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../util";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
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
    const { user } = useAuth();
    const { language } = useLanguage();

    useEffect(() => {
        let pullInterval;
        if (jobId && (jobStatus === "pending" || jobStatus === "running")) {
            pullInterval = setInterval(() => {
                pullJobStatus(jobId);
            }, 3000);
        }
        return () => clearInterval(pullInterval);
    }, [jobId, jobStatus]);

    const generateStory = async (theme, difficulty = "medium") => {
        setIsLoading(true);
        setError(null);
        setTheme(theme);
        try {
            const response = await axios.post(`${API_BASE_URL}/story/create`, { 
                theme, 
                difficulty,
                language,
                user_id: user?.id,
                user_email: user?.email
            });
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
        <div className="min-h-screen bg-[#05020a]">
            {isLoading ? (
                <LoadingStatus theme={theme} />
            ) : error ? (
                <div className="min-h-screen bg-[#05020a] flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-pixel text-white">Generation Failed</h2>
                    <p className="text-gray-500 max-w-md">{error}</p>
                    <div className="flex gap-4 pt-2">
                        <button onClick={() => generateStory(theme)} className="px-6 py-2.5 bg-[#7c3aed] text-white font-semibold text-sm rounded-xl hover:bg-[#6d28d9] shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all">
                            Try Again
                        </button>
                        <button onClick={reseat} className="px-6 py-2.5 glass border border-white/20 font-semibold text-sm rounded-xl hover:bg-white/10 transition-all">
                            Back to Home
                        </button>
                    </div>
                </div>
            ) : (
                <ThemeInput onSubmit={generateStory} />
            )}
        </div>
    );
}

export default StoryGenerator;