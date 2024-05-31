import React, { useState } from 'react';
import { Box, Grid, Input, Slider, Typography } from '@mui/material';
import { useDarkMode } from '../../../context/DarkModeContext';

import * as CONSTANTS from '../../../constants/constants';
import { CareerFiltersData } from '../../../interfaces/careerFiltersData';

interface PlayerYearSliderProps {
  updateYearFilter: (yearFilter: number[]) => void; // Function to update year filter
  careerFilters: CareerFiltersData;
}

/**
 * React functional component for a player year slider.
 * @param {PlayerYearSliderProps} props - Props passed to the component
 */
const PlayerYearSlider: React.FC<PlayerYearSliderProps> = ({ updateYearFilter,careerFilters }) => {
  // State initialization
  const [value1, setValue1] = useState<number[]>(careerFilters ? [careerFilters.yearFilter[0], careerFilters.yearFilter[1]] : [1800, 2024]);
  const { isDarkMode } = useDarkMode();

  /**
   * Handles the change event of the year slider.
   * @param {Event} event - The event object
   * @param {number | number[]} newValue - The new value of the slider
   * @param {number} activeThumb - The active thumb of the slider
   */
  const handleChange1 = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setValue1([Math.min(newValue[0], value1[1]), value1[1]]);
      updateYearFilter([Math.min(newValue[0], value1[1]), value1[1]]);
    } else {
      setValue1([value1[0], Math.max(newValue[1], value1[0])]);
      updateYearFilter([value1[0], Math.max(newValue[1], value1[0])]);
    }
  };

  /**
   * Handles the input change event for the lower year input.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleInputChangeLower = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value === '' ? 0 : Number(event.target.value);
    newValue = Math.max(1800, Math.min(newValue, value1[1]));
    setValue1([newValue, value1[1]]);
    updateYearFilter([newValue, value1[1]]);
  };

  /**
   * Handles the input change event for the higher year input.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleInputChangeHigher = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value === '' ? 0 : Number(event.target.value);
    newValue = Math.min(2024, Math.max(newValue, value1[0]));
    setValue1([value1[0], newValue]);
    updateYearFilter([value1[0], newValue]);
  };

  /**
   * Formats the value for the slider tooltip.
   * @param {number} value - The value of the slider
   * @returns {string} - The formatted value as a string
   */
  function valuetext(value: number) {
    return `${value}`;
  }

  return (
    <Box sx={{ width: 350 }} style={{paddingLeft: 16}}>
      <Typography id="input-slider" gutterBottom>
        Career Years
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            getAriaLabel={() => 'Minimum distance'}
            value={value1}
            onChange={handleChange1}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            disableSwap
            min={1800}
            max={2024}
            style={{ color: isDarkMode ? CONSTANTS.THEME_BUTTON_BLUE : CONSTANTS.THEME_BUTTON_DARKMODE_BLUE}}
            
          />
        </Grid>
        <Grid item>
          <Input
            value={value1[0]}
            size="small"
            onChange={handleInputChangeLower}
            inputProps={{
              step: 10,
              min: 1800,
              max: 2024,
              type: 'number',
              'aria-labelledby': 'input-slider',
              
            }}
            className={isDarkMode? "slider-darkmode" : 'slider-lightmode'}
            style={{
              color: isDarkMode? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK
            }}
          />
        </Grid>
        <p>-</p>
        <Grid item>
          <Input
            value={value1[1]}
            size="small"
            onChange={handleInputChangeHigher}
            inputProps={{
              step: 10,
              min: 1800,
              max: 2024,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            className={isDarkMode? "slider-darkmode" : 'slider-lightmode'}
            style={{
              color: isDarkMode? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlayerYearSlider;
