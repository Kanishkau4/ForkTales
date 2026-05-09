function LoadingStatus({ theme }) {
    return (
        <div className="loading-container">
            <h2>Generating story for {theme}...</h2>

            <div className="loading-animation">
                <div className="spinner"></div>
            </div>

            <p className="loading-info">Please wait while we create your unique adventure...</p>
        </div>
    );
}


export default LoadingStatus;
