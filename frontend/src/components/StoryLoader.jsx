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
        <div className="min-h-screen bg-[#05020a]">
            {isLoading ? (
                <LoadingState />
            ) : error ? (
                <div className="min-h-screen bg-[#05020a] flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-pixel text-white">Story Not Found</h2>
                    <p className="text-gray-500 font-retro uppercase tracking-widest">{error}</p>
                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={() => fetchStory(id)}
                            className="px-6 py-2.5 bg-[#7c3aed] text-white font-semibold text-sm rounded-xl hover:bg-[#6d28d9] shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 glass border border-white/20 font-semibold text-sm rounded-xl hover:bg-white/10 transition-all"
                        >
                            Back Home
                        </button>
                    </div>
                </div>
            ) : (
                <StoryGame story={story} onNewStory={() => navigate('/')} />
            )}
        </div>
    );
}

export default StoryLoader;
