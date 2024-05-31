import React, { useEffect, useState } from 'react';
import { ColourGroups } from '../../../interfaces/colourGroups';
import { useDarkMode } from '../../../context/DarkModeContext';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import * as CONSTANTS from '../../../constants/constants';
import { MapData } from '../../../interfaces/mapData';
import { CareerFiltersData } from '../../../interfaces/careerFiltersData';

// Define the props expected by the ColourSelect component
interface ColourSelectProps {
  // Function to update the colour filter, taking an array of strings as input
  updateColourFilter: (colourFilter: string[]) => void;
  careerFilters: CareerFiltersData;
}

// Define the ColourSelect component
const ColourSelect: React.FC<ColourSelectProps> = ({
  updateColourFilter,
  careerFilters
}) => {
  // Hook to get the current state of dark mode
  const { isDarkMode } = useDarkMode();

  // State hook to store the currently selected colours
  const [currentColours, setCurrentColours] = useState<string[]>(() => {
    // Retrieve stored data from localStorage, if available
    const storedData = localStorage.getItem('currentColours');
    // Parse stored data if it exists, otherwise default to an empty array
    return storedData ? JSON.parse(storedData) : [];
  });

  // State hook to store the names of colour groups
  const [colourGroupNames, setColourGroupNames] = useState<ColourGroups[]>(() => {
    // Retrieve stored data from localStorage, if available
    const storedData = localStorage.getItem('colourGroupNames');
    // Parse stored data if it exists, otherwise default to an empty array
    return storedData ? JSON.parse(storedData) : [];
  });

  // State hook to store the list of colour names
  const [listColourName, setlistColourName] = React.useState<string[]>([]);

  // State hook to store the options of colour groups
  const [colourOptionsGroups, setColourOptionsGroups] = useState<ColourGroups[]>([]);

  // Effect hook to run code when currentColours state changes
  useEffect(() => {
    // Retrieve colour group names from localStorage
    const retrievedColourGroups = localStorage.getItem('colourGroupNames');

    // Update state with retrieved colour group names and filter colour options accordingly
    if (retrievedColourGroups) {
      const colourGroupNamesLocal: ColourGroups[] = JSON.parse(retrievedColourGroups);
      setColourGroupNames(colourGroupNamesLocal);
      setColourOptionsGroups(colourGroupNames.filter(colour => currentColours.includes(colour.colourHex)));
    } 

    // Retrieve map data from localStorage
    const retrievedMapData = localStorage.getItem('mapData');

    // Update currentColours state with unique line colors from retrieved map data
    if (retrievedMapData) {
      const deserializedMapData = JSON.parse(retrievedMapData);            
      const uniqueLineColors: string[] = Array.from(new Set(deserializedMapData.map((item: MapData) => item.lineColour)));
      setCurrentColours(uniqueLineColors);
    }

    // Filter listColourName based on currentColours and update the colour filter
    const filteredList = listColourName.filter(item => currentColours.includes(item));
    setlistColourName(filteredList);
    updateColourFilter(listColourName);

  }, [currentColours]);

  useEffect(() => {
    setlistColourName(careerFilters ? careerFilters.colourFilter : []);
  }, []);

  // Handler function for handling changes in the select input
  const handleChange = (event: SelectChangeEvent<typeof listColourName>) => {
    const {
      target: { value },
    } = event;

    // Split selected values by commas if it's a string, otherwise use the array
    const selectedColours = typeof value === 'string' ? value.split(',') : value;
    
    // Update listColourName state with selected colours
    setlistColourName(
      selectedColours
    );

    // Update the colour filter with the selected colours
    updateColourFilter(listColourName);
  };

  // Define constants for the select input
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  return (
    <>
      <div>
        <FormControl sx={{ m: 1, width: 350 }}>
          <InputLabel id="demo-multiple-checkbox-label" sx={{ color: isDarkMode? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK}} >Colour Group Select</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={listColourName}
            onChange={handleChange}
            input={<OutlinedInput label="Colour Group Select" />}
            renderValue={(selected) => {
              const selectedColours = colourOptionsGroups.filter(colour => selected.includes(colour.colourHex));
              return selectedColours.map(colour => colour.colourName).join(', ');
            }}
            MenuProps={MenuProps}
            sx={{ color: isDarkMode? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK, '& fieldset': { borderColor: isDarkMode? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK } }}
          >
            {colourOptionsGroups.map((colour) => (
              <MenuItem key={colour.colourHex} value={colour.colourHex}>
                <Checkbox checked={listColourName.indexOf(colour.colourHex) > -1} style={ { color: colour.colourHex, fill:colour.colourHex }} />
                <ListItemText primary={colour.colourName}/>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div> 
    </>
  );
};

export default ColourSelect;