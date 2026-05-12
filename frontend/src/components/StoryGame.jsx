import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import AnimatedSprite from "./AnimatedSprite";
import mushroomIdle from "../assets/sprites/Mushroom-Idle.png";
import mushroomRun from "../assets/sprites/Mushroom-Run.png";
import mushroomDie from "../assets/sprites/Mushroom-Die.png";
import mushroomHit from "../assets/sprites/Mushroom-Hit.png";

const TypewriterText = ({ text, speed = 15 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (!text) return;
        setDisplayedText("");
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span>
            {displayedText}
            {displayedText.length < text.length && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#7c3aed] animate-pulse"></span>
            )}
        </span>
    );
};

function StoryGame({ story, onNewStory }) {

    const [nodes, setNodes] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState("start");
    const [options, setOptions] = useState([]);
    const [isEnding, setIsEnding] = useState(false);
    const [isWinningEnding, setIsWinningEnding] = useState(false);
    const [bgUrl, setBgUrl] = useState("");

    useEffect(() => {
        if (story && story.root_node) {
            const rootNodeID = story.root_node.id;
            setCurrentNodeId(rootNodeID);

            // Generate a thematic background from cover or pollinations
            if (story.root_node.background_image) {
                setBgUrl(story.root_node.background_image);
            } else {
                const theme = encodeURIComponent(story.theme || "adventure");
                const title = encodeURIComponent(story.title || "story");
                const randomSeed = Math.floor(Math.random() * 999999);
                setBgUrl(`https://image.pollinations.ai/prompt/16-bit+pixel+art+epic+background+for+${theme}+titled+${title}?width=1920&height=1080&nologo=true&seed=${randomSeed}`);
            }
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

                // Use backend generated image if available, otherwise fallback
                if (node.background_image) {
                    setBgUrl(node.background_image);
                } else {
                    const theme = encodeURIComponent(story.theme || "adventure");
                    const scene = encodeURIComponent(node.content.substring(0, 80));
                    const randomSeed = Math.floor(Math.random() * 999999);
                    setBgUrl(`https://image.pollinations.ai/prompt/16-bit+pixel+art+background+for+${theme}+${scene}?width=1920&height=1080&nologo=true&seed=${randomSeed}`);
                }
            }
        }
    }, [currentNodeId, story]);

    useEffect(() => {
        let interval;
        if (isWinningEnding) {
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isWinningEnding]);

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

    if (isEnding) {
        return (
            <div className="relative min-h-screen flex flex-col p-4 md:p-8 bg-[#05020a] selection:bg-[#7c3aed] selection:text-white items-center justify-center text-center">
                {/* Background */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 opacity-20"
                        style={{ backgroundImage: `url("${bgUrl}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#05020a]" />
                </div>

                <div className={`relative z-10 p-8 md:p-12 bg-[#0e0e14]/90 backdrop-blur-2xl border ${isWinningEnding ? 'border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.15)]' : 'border-white/10 shadow-2xl'} rounded-3xl max-w-2xl w-full`}>

                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className={`absolute -inset-6 rounded-full blur-2xl animate-pulse ${isWinningEnding ? 'bg-green-500/20' : 'bg-red-500/20'}`} />
                            <AnimatedSprite
                                spriteUrl={isWinningEnding ? mushroomHit : mushroomDie}
                                frameCount={isWinningEnding ? 5 : 15}
                                width={120}
                                height={120}
                                animationDuration={isWinningEnding ? "0.8s" : "1.5s"}
                                className="relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        {isWinningEnding ? "Adventure Complete" : "GAME OVER"}
                    </h1>

                    <p className="text-base md:text-lg text-gray-400 leading-relaxed font-light mb-10 max-w-lg mx-auto">
                        {nodes?.content}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={restartStory}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-white/20 uppercase tracking-wider text-sm"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={onNewStory}
                            className={`px-6 py-3 text-white font-medium rounded-xl transition-all uppercase tracking-wider text-sm hover:-translate-y-0.5 ${isWinningEnding ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_16px_rgba(22,163,74,0.4)]' : 'bg-[#7c3aed] hover:bg-[#6d28d9] shadow-[0_0_16px_rgba(124,58,237,0.4)]'}`}
                        >
                            Start New Story
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col p-4 md:p-8 bg-[#05020a] selection:bg-[#7c3aed] selection:text-white">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 opacity-[0.25]"
                    style={{ backgroundImage: `url("${bgUrl}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#05020a]/40 via-[#05020a]/20 to-[#05020a]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,rgba(5,2,10,0.85)_100%)]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col h-full flex-1 justify-center py-10">

                {/* Story Title Header */}
                <div className="text-center mb-10 space-y-2">
                    <h2 className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-[0.3em] opacity-80">Currently Playing</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-2xl">{story?.title || "Untold Tale"}</h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent mx-auto mt-4 opacity-50" />
                </div>
                {/* Main Story Content */}
                <div className="bg-[#0e0e14]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-6 md:p-10 mb-8 flex flex-col md:flex-row gap-6 md:gap-10 relative items-center md:items-start max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Top Glow */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#7c3aed]/10 blur-3xl rounded-full pointer-events-none" />

                    {/* Character Sprite on Left */}
                    <div className="hidden md:flex flex-col items-center justify-center shrink-0 pt-2 sticky top-0">
                        <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full mb-3 border border-white/10 text-[10px] font-bold text-[#a78bfa] uppercase tracking-widest text-center shadow-lg">
                            Narrator
                        </div>
                        <AnimatedSprite
                            spriteUrl={mushroomIdle}
                            frameCount={7}
                            width={96}
                            height={96}
                            animationDuration="1.2s"
                            className="drop-shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                        />
                        <div className="w-16 h-2 bg-black/60 rounded-[50%] blur-[2px] mt-2" />
                    </div>

                    <div className="prose prose-invert max-w-none flex-1 w-full">
                        <div className="md:hidden flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <AnimatedSprite
                                spriteUrl={mushroomIdle}
                                frameCount={7}
                                width={40}
                                height={40}
                                animationDuration="1.2s"
                            />
                            <span className="text-xs font-bold text-[#a78bfa] uppercase tracking-widest">Narrator</span>
                        </div>
                        <p className="text-lg md:text-2xl text-gray-200 leading-relaxed font-light tracking-wide md:leading-[1.8] min-h-[100px]">
                            {nodes?.content ? <TypewriterText text={nodes?.content} /> : ""}
                        </p>
                    </div>
                </div>

                {/* Options List */}
                <div className="w-full max-w-2xl mx-auto space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2 text-center md:text-left flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                        Choose your path
                    </h3>
                    <div className="flex flex-col gap-3">
                        {options.map((option) => (
                            <button
                                key={option.node_id}
                                onClick={() => chooseOption(option.node_id)}
                                className="group w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#7c3aed]/50 backdrop-blur-md rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] flex items-center gap-4 hover:-translate-y-1"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/5 text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors border border-white/10 group-hover:border-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm md:text-base text-gray-300 group-hover:text-white transition-colors leading-snug">
                                    {option.text}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StoryGame;