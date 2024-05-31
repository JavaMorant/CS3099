import React, { useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import StadiumForm from './StadiumForm';
import { Slider, Popover, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import config from './config';
import './MapFilteringDiv.css';


type Option = {
  label: string;
  value: string;
};

type MapFilteringDivProperties = {
  changeSelectedLeague: (values: Array<{ value: string; label: string }>) => void;
  changeSelectedCountry: (values: Array<{ value: string; label: string }>) => void;
  changeMinCapacity: (newValue: number) => void;
  changeMaxCapacity: (newValue: number) => void;
  selectedLeague: any;
  selectedCountry: Option[];
  optionsLeague: Option[];
  optionsCountry: Option[];
  refetch: () => void;
};


// Main component for the filtering
const MapFilteringDiv = ({
  changeMinCapacity,
  changeMaxCapacity,
  changeSelectedLeague,
  changeSelectedCountry,
  selectedLeague,
  selectedCountry,
  optionsLeague,
  optionsCountry,
  refetch
}: MapFilteringDivProperties) => {
  const [capacity, setCapacity] = useState<number[]>([1, 150000]);

  // Change the capacity depending on the value of slider
  function handleCapacityChange(event: Event, newValue: number | number[], activeThumb: number) {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < config.minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], config.maxCapacity - config.minDistance);
        setCapacity([clamped, clamped + config.minDistance]);
      } else {
        const clamped = Math.max(newValue[1], config.minDistance);
        setCapacity([clamped - config.minDistance, clamped]);
      }
    } else {
      setCapacity(newValue as number[]);
    }
  }
  function submitCapacityChange(
    event: Event | React.SyntheticEvent<Element, Event>,
    value: number | number[]
  ) {
    if (Array.isArray(value)) {
      changeMinCapacity(value[0]);
      changeMaxCapacity(value[1]);
    }
  }

  function sliderAria(capacity : number[]) : string {
    return `capacity filter slider, from ${capacity[0]} people to ${capacity[1]} people`;
  }

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // set element id for popover according to open state
  const open = Boolean(anchorEl);
  const id = open ? 'filtering-popover' : undefined;

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-10 m-4">
        <div
          className={
            'hover:bg-gray-400 shadow-[0_0_4px_-1px_rgba(0,0,0,0.7)] rounded-xl '
            + (open ? ' bg-gray-400' : ' bg-gray-100')
          }>
          <IconButton           aria-label="Open filter options"
onClick={handleClick} sx={{ '&:hover': { bgcolor: 'transparent' } }}>
            <FilterListIcon />
          </IconButton>
        </div>
        <Popover
          aria-label="filter options"
          anchorEl={anchorEl}
          id={id}
          title='Filter'
          className="rootElement"
          sx={{ top: '3px', maxWidth: '300px'}} 
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}>
          <div className="p-5 bg-gray-200 flex flex-col gap-4 border-none rounded">          
            <div>
              <h2 className="text-lg font-bold">Stadium Filtering</h2>
            </div>
            <div>
              <h1 id="leagueLabel" aria-label='Select League:'>Select League:</h1>
              <MultiSelect
                options={optionsLeague}
                value={selectedLeague}
                onChange={changeSelectedLeague}
                labelledBy="leagueLabel"
              />
            </div>
            <div>
              <h1 id="countryLabel" aria-label='Select Country:'>Select Country:</h1>
              <MultiSelect
                options={optionsCountry}
                value={selectedCountry}
                onChange={changeSelectedCountry}
                labelledBy="countryLabel"
              />
            </div>
            <div>
              <h1>Capacity:</h1>
              <Slider
                value={capacity}
                min={config.minCapacity}
                max={config.maxCapacity}
                step={config.step}
                marks
                onChange={handleCapacityChange}
                onChangeCommitted={submitCapacityChange}
                valueLabelDisplay="auto"
                disableSwap
                getAriaLabel={() => {return sliderAria(capacity)}}
              />
            </div>
            <div>
              <StadiumForm optionsLeague={optionsLeague} refetch={refetch} />
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default MapFilteringDiv;
