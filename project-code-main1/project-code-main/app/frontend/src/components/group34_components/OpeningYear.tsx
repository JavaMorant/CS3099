import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import config from './config';


const MIN = 1800;

type OpeningYearProperties = {
  changeOpeningYear: (newValue: number) => void;
};

// Custom marks for the slider
const marks: Array<{ label?: string; value: number }> | boolean = [
  { value: 1800, label: '1800' },
  { value: 1850, label: '1850' },
  { value: 1900, label: '1900' },
  { value: 1950, label: '1950' },
  { value: 2000, label: '2000' },
  { value: config.currentYear, label: config.currentYear.toString() }
];

// Main component for the opening year slider
const OpeningYearSlider = ({ changeOpeningYear }: OpeningYearProperties) => {
  const [openingYear, setOpeningYear] = useState<number>(config.currentYear);
  function handleOpeningYearChange(event: any, newValue: number | number[]) {
    setOpeningYear(newValue as number);
  }
  function submitOpeningYearChange(event: any, newValue: number | number[]) {
    changeOpeningYear(newValue as number);
  }

  function sliderAria(openingYear: number): string {
    return `opening year slider, up to year ${openingYear}`
  }

  return (
    <div className="absolute bottom-5 left-0 z-10 p-4 w-full flex justify-center">
      <div className="relative rounded-[0.3rem] w-11/12 bg-gray-200 opacity-90">
        <Box>
          <Slider
            sx={{
              width: 0.95,
              left: '2.5%'
            }}
            defaultValue={config.currentYear}
            value={openingYear}
            aria-label={sliderAria(openingYear)}
            aria-valuetext='opening year'
            marks={marks}
            valueLabelDisplay="auto"
            min={MIN}
            max={config.currentYear}
            onChange={handleOpeningYearChange}
            onChangeCommitted={submitOpeningYearChange}
          />
        </Box>
      </div>
    </div>
  );
};

export default OpeningYearSlider;
