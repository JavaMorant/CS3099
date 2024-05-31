import React, { useState } from 'react';
import "./Controls.css";

/**
 * Note: Component will automatically update the maximum year to the current year.
 * @param {int} selectedYear current filter value
 * @param {function} setSelectedYear function handler for changing year value
 * @returns Slider Component for filtering player data of the graph by year.
 */
const YearSlider = ({year, changeYear}) => {
    return (
            <div className='slider-container'>
                <input
                    className="slider"
                    type='range'
                    min='1900'
                    max={new Date().getFullYear()}
                    value={year}
                    onChange={(e) => changeYear(parseInt(e.target.value, 10))}
                />
                <p className='text-center' id='sliderVal'>{year}</p>  
            </div>
    );
};
export default YearSlider;