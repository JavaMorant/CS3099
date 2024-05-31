import React from 'react';
import gif from "../../../assets/images/loading.png"

/**
 * 
 * @returns Loading screen (with gif, or 'loading...' if gif fails)
 */
const LoadingScreen = () => {
    return (
        <div className='bg-white flex flex-col h-screen relative items-center justify-center'>
            <img src={gif} alt="loading..."/>
        </div>
    )
}

export default LoadingScreen;