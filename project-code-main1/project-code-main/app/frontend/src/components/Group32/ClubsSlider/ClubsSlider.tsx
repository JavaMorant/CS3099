import React from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Input from '@mui/material/Input';

import * as CONSTANTS from '../../../constants/constants';
import { CareerFiltersData } from '../../../interfaces/careerFiltersData';

// Interface defining props for ClubSlider component
interface ClubSliderProps {
  // Function to update club filter based on year range
  updateClubFilter: (yearFilter: number[]) => void
  careerFilters: CareerFiltersData;
}

// React functional component for ClubSlider
const ClubSlider: React.FC<ClubSliderProps> = ({
  updateClubFilter,
  careerFilters
}) => {
  // State for the slider value
  const [value, setValue] = React.useState(30);
  // Minimum distance between slider values
  const minDistance = 1;
  // Hook for detecting dark mode
  const { isDarkMode } = useDarkMode();

  // State for storing the slider value range
  const [value1, setValue1] = React.useState<number[]>(careerFilters ?[careerFilters.clubFilter[0], careerFilters.clubFilter[1]] : [0,100]);

  // Function to handle slider change
  const handleChange1 = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    // Update slider range based on active thumb
    if (activeThumb === 0) {
      setValue1([Math.min(newValue[0], value1[1] - minDistance), value1[1]]);
      updateClubFilter([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
    } else {
      setValue1([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
      updateClubFilter([value1[0], Math.max(newValue[1], value1[0] + minDistance)]);
    }
  };

  // Function to handle input change for lower bound
  const handleInputChangeLower = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value === '' ? 0 : Number(event.target.value)
    setValue1([Math.min(newValue, value1[1] - minDistance), value1[1]]);
    updateClubFilter([Math.min(newValue, value1[1] - minDistance), value1[1]]);
  };

  // Function to handle input change for upper bound
  const handleInputChangeHigher = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value === '' ? 0 : Number(event.target.value)
    setValue1([value1[0], Math.max(newValue, value1[0] + minDistance)])
    updateClubFilter([value1[0], Math.max(newValue, value1[0] + minDistance)])
  };

  // Function to handle slider value blur
  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  }; 

  // Function to return value as text
  function valuetext(value: number) {
    return `${value}`;
  }

  // Render component JSX
  return (
    <>
      <Box sx={{ width: 350 }} >
        <Typography id="input-slider" gutterBottom style={{ paddingLeft: 16 }}>
          Number of Clubs
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
          </Grid>
          <Grid item xs>
            <Slider
              getAriaLabel={() => 'Minimum distance'}
              value={value1}
              onChange={handleChange1}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              disableSwap
              style={{ color: isDarkMode ? CONSTANTS.THEME_BUTTON_BLUE : CONSTANTS.THEME_BUTTON_DARKMODE_BLUE}}
            />
          </Grid>
          <Grid item>
            <Input
              value={value1[0]}
              size="small"
              onChange={handleInputChangeLower}
              onBlur={handleBlur}
              inputProps={{
                step: 1,
                min: 0,
                max: 100,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
              className={isDarkMode ? "slider-darkmode" : 'slider-lightmode'}
              style={{
                color: isDarkMode ? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK,
              }}
            />
          </Grid>
          <p>-</p>
          <Grid item>
            <Input
              value={value1[1]}
              size="small"
              onChange={handleInputChangeHigher}
              onBlur={handleBlur}
              inputProps={{
                step: 1,
                min: 0,
                max: 100,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
              className={isDarkMode ? "slider-darkmode" : 'slider-lightmode'}
              style={{
                color: isDarkMode ? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ClubSlider;
