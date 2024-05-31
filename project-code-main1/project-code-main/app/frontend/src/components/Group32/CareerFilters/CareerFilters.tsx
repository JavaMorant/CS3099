import React from 'react';
import { useDarkMode } from '../../../context/DarkModeContext'; 
import './CareerFilters.css';

import ClubSlider from '../ClubsSlider/ClubsSlider';
import PlayerYearSlider from '../PlayerYearSlider/PlayerYearSlider'; 
import ColourSelect from '../ColourSelect/ColourSelect';
import { CareerFiltersData } from '../../../interfaces/careerFiltersData';

// Declaring interface for CareerFiltersProps
interface CareerFiltersProps {
    deleteAllMapData: () => void; // Function to delete all map data
    closeFilters: () => void; // Function to close filters
    updateClubFilter: (clubFilter: number[]) => void; // Function to update club filter
    updateYearFilter: (yearFilter: number[]) => void; // Function to update year filter
    updateColourFilter: (colourFilter: string[]) => void; // Function to update colour filter
    clearAllFilters: () => void; // Function to clear all filters
    careerFilters: CareerFiltersData;
}

// Functional component CareerFilters with CareerFiltersProps as props
const CareerFilters: React.FC<CareerFiltersProps> = ({
    deleteAllMapData,
    closeFilters,
    updateClubFilter,
    updateYearFilter,
    updateColourFilter,
    clearAllFilters,
    careerFilters
}) => {
    // Using custom hook useDarkMode to get dark mode status
    const { isDarkMode } = useDarkMode();

    // Function to clear all filters and close filters panel
    const clearAndCloseAllFilters = () => {
        clearAllFilters();
        closeFilters();
    }

    return (
        <>
        <div className='filters-outline'>
            <div className={isDarkMode ? 'advanced-filters filters-dark' : 'advanced-filters filters-light'}>
                <ClubSlider updateClubFilter={updateClubFilter} careerFilters={careerFilters}/>
                <PlayerYearSlider updateYearFilter={updateYearFilter} careerFilters={careerFilters}/>
                <ColourSelect updateColourFilter={updateColourFilter}careerFilters={careerFilters}/>
                <div className="filter-container">
                    <div className="delete-all-container">
                        <button onClick={deleteAllMapData} className='clear-all'>Delete All Players</button>
                    </div>
                    <button onClick={clearAndCloseAllFilters} className='clear-all'>Clear All Filters</button>
                </div>
            </div>
        </div>
        </>
    );
};

export default CareerFilters; 