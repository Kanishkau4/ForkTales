import React from 'react';
import AnimatedSprite from './AnimatedSprite';
import mushroomRun from '../assets/sprites/Mushroom-Run.png';

function LoadingStatus({ theme }) {
    return (
        <div className="relative min-h-screen bg-[#05020a] flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Purple glow background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(124,58,237,0.12),transparent)]" />

            <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-md">
                {/* Sprite with glow */}
                <div className="relative">
                    <div className="absolute -inset-8 bg-[#7c3aed]/20 rounded-full blur-3xl animate-pulse" />
                    <AnimatedSprite
                        spriteUrl={mushroomRun}
                        frameCount={8}
                        width={96}
                        height={96}
                        animationDuration="0.6s"
                        className="relative z-10"
                    />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-xl font-pixel text-white animate-pulse leading-snug">
                            Crafting Your Story...
                        </h2>
                    </div>
                    {theme && (
                        <p className="text-sm font-retro text-gray-400 tracking-widest uppercase">
                            Theme: <span className="text-[#a78bfa] font-semibold">{theme}</span>
                        </p>
                    )}
                    <p className="text-xs text-gray-600">
                        Our AI is building your unique adventure. This may take 10–20 seconds.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] animate-[shimmer_1.8s_ease-in-out_infinite]" />
                </div>

                {/* Steps */}
                <div className="space-y-2 text-left w-full">
                    {[
                        "Generating story structure...",
                        "Creating branching paths...",
                        "Writing narrative content...",
                        "Finalizing your adventure...",
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]/40 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                            {step}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}

export default LoadingStatus;
