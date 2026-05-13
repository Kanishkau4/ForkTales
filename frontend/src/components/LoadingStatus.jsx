import React, { useMemo } from 'react';
import AnimatedSprite from './AnimatedSprite';

// Mushroom
import mushroomRun  from '../assets/sprites/Mushroom-Run.png';

// Human Soldier
import soldierWalk  from '../assets/sprites/Human_Soldier_Sword_Shield_Walk.png';

// Monster Slime
import slimeWalk  from '../assets/sprites/Monster_Slime_Walk.png';

const SPRITE_ROSTER = [
    {
        name: "Mushroom",
        sizeMultiplier: 1,
        walk: { src: mushroomRun,  frames: 8,  duration: "0.8s" },
    },
    {
        name: "Human Soldier",
        sizeMultiplier: 1.4,
        walk: { src: soldierWalk,  frames: 8,  duration: "0.7s" },
    },
    {
        name: "Monster Slime",
        sizeMultiplier: 1.3,
        walk: { src: slimeWalk,  frames: 8, duration: "0.7s" },
    },
];

function LoadingStatus({ theme }) {
    // Pick a random character for the loading screen
    const character = useMemo(
        () => SPRITE_ROSTER[Math.floor(Math.random() * SPRITE_ROSTER.length)],
        []
    );

    return (
        <div className="relative min-h-screen bg-[#05020a] flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Purple glow background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(124,58,237,0.12),transparent)]" />

            <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-md">
                {/* Sprite with glow */}
                <div className="relative">
                    <div className="absolute -inset-8 bg-[#7c3aed]/20 rounded-full blur-3xl animate-pulse" />
                    <AnimatedSprite
                        spriteUrl={character.walk.src}
                        frameCount={character.walk.frames}
                        width={Math.round(96 * character.sizeMultiplier)}
                        height={Math.round(96 * character.sizeMultiplier)}
                        animationDuration={character.walk.duration}
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
