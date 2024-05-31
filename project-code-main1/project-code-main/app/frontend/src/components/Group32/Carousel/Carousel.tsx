import React, { useState } from 'react';
import { TeamInfo } from '../../../interfaces/teamInfo'; 

import './Carousel.css';
import Tooltip from '@mui/material/Tooltip'; 
import Info from '../../../assets/group_32/info.svg'; 
import InfoLight from '../../../assets/group_32/info-light.svg'
import { useDarkMode } from '../../../context/DarkModeContext';

// Define the expected props for the carousel component
interface CarouselProps {
    data: TeamInfo[]; // Array of TeamInfo objects
    updateCenter: (rawCoords: [number, number]) => void; // Function to update center coordinates
}

const Carousel: React.FC<CarouselProps> = ({ data, updateCenter }) => {
    
    const [currentIndex, setCurrentIndex] = useState(0); // State to track current index in the carousel
    const { isDarkMode } = useDarkMode();
    
    // Function to update center coordinates
    const handleUpdateCenter = (rawCoords: [number, number]) => {
        updateCenter(rawCoords); // Call the updateCenter function with raw coordinates
    };

    /**
     * Function to navigate to the next item in the carousel
     */
    const nextItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length); // Update currentIndex to next index
        
        const index = (currentIndex + 1) % data.length;
        let coords = data[index].StadiumCoords; // Coordinates of the next item's stadium
        if (coords !== null && coords) {
            handleUpdateCenter(coords); // Update center if coordinates are available
        }
    };

    /**
     * Function to navigate to the previous item in the carousel
     */
    const prevItem = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - 1 < 0 ? data.length - 1 : prevIndex - 1
        ); // Update currentIndex to previous index
        
        const index = currentIndex - 1 < 0 ? data.length - 1 : currentIndex - 1;
        let coords = data[index].StadiumCoords; // Coordinates of the previous item's stadium
        if (coords !== null) {
            handleUpdateCenter(coords); // Update center if coordinates are available
        }
    };

    /**
     * Function to render the carousel component.
     */
    return (
        <div className="carousel">
            <div className="carousel-item">
                <div className='nav-buttons'>
                    <button onClick={prevItem} className='prev-button control-button'>Previous</button>
                    <button onClick={nextItem} className='next-button control-button'>Next</button>
                    <div>
                        <Tooltip title={"The map will update location when WikiData provides coordinates for the given team"} placement="top" arrow slotProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: 'offset',
                                        options: {
                                            offset: [0, -8],
                                        },
                                    },
                                ],
                            },
                        }}
                        role="tooltip" aria-label="Information tooltip" tabIndex={0}>
                            <img src={isDarkMode ? Info : InfoLight} alt="Info" />
                        </Tooltip>
                    </div>
                </div>
                <h2 className="carousel-team">{currentIndex + 1}). {data[currentIndex].Team_name}</h2>
                <p>Appearances: {data[currentIndex].Appearances}</p>
                <p>Goals: {data[currentIndex].Goals}</p>
            </div>
        </div>
    );
};

export default Carousel;
