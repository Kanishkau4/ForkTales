function LoadingStatus({ theme }) {
    return (
        <div className="text-center text-4xl font-bold loading-container">
            <h1>Generating story for {theme}...</h1>

            <div className="flex justify-center my-8">
                {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="dot text-4xl mx-2 animate-bounce">
                        ●
                    </span>
                ))}
            </div>
            <p className="text-xl opacity-70 loading-info">Please wait while we generate your story...</p>
        </div>
    )
}


export default LoadingStatus;
