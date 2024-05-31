import React, { ChangeEvent, useEffect, useState } from 'react';
import { CompactPicker } from 'react-color';
import Tick from '../../../assets/group_32/tick.svg';
import TickBlack from '../../../assets/group_32/tick-black.svg'
import { ColourGroups } from '../../../interfaces/colourGroups';
import { useDarkMode } from '../../../context/DarkModeContext';

import * as CONSTANTS from '../../../constants/constants';

// Interface defining props for ColourPickerPopUp component
interface ColourPickerPopUpProps {
    // Function to dismiss the colour picker
    dismissPicker: () => void;
    // Function to update player colour
    updatePlayerColour: (playerName: string, lineColour: string, colourName: string) => void;
    // Initial colour value
    startColour: string;
    // Name of the player
    playerName: string;
}

// React functional component for ColourPickerPopUp
const ColourPickerPopUp: React.FC<ColourPickerPopUpProps> = ({
    dismissPicker,
    startColour,
    playerName,
    updatePlayerColour,
}) => {
    // Hook for detecting dark mode
    const { isDarkMode } = useDarkMode();
    // State for the colour name in the picker
    const [pickerColourName, setPickerColourName] = useState(""); 
    // State for the colour selected in the picker
    const [pickerColour, setPickerColor] = useState(startColour);

    // Function to handle changes in the colour name input
    const handleColourNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPickerColourName(e.target.value);
    };

    // Effect to update picker colour name on component mount
    useEffect(() => {
        updatePickerColourName(startColour);
    }, []);

    // Function to update picker colour name based on the colour value
    const updatePickerColourName = (colour: string) => {
        const retrievedColourGroups = localStorage.getItem('colourGroupNames');

        if (retrievedColourGroups) {
            const colourGroupNames: ColourGroups[] = JSON.parse(retrievedColourGroups);

            const foundGroup = colourGroupNames.find(group => group.colourHex === colour);

            if (foundGroup) {
                setPickerColourName(foundGroup.colourName);
            } else {
                setPickerColourName("");
            }
        } else {
            setPickerColourName("");
        }
    }

    // Function to handle colour change in the picker
    const handleColorChange = (newColor: { hex: React.SetStateAction<string>; }) => {
        updatePickerColourName(newColor.hex.toString());
        setPickerColor(newColor.hex);
    };

    // Function to dismiss the colour picker and update player colour
    const dismiss = () => {
        updatePlayerColour(playerName, pickerColour, pickerColourName)
        dismissPicker();
    };

    return (
        <>
            <CompactPicker color={pickerColour} onChange={handleColorChange} />
            <div className="showPicker control-buttons">
                <button className='error' onClick={dismiss} style={{ backgroundColor: pickerColour }} tabIndex={0} autoFocus>
                    <img src={pickerColour === CONSTANTS.THEME_WHITE ? TickBlack : Tick} alt="Tick" />
                </button>
            </div>
            <input
                type="text"
                className='colourInput'
                placeholder="Enter Colour Group Name..."
                value={pickerColourName}
                onChange={handleColourNameChange}
                style={{ backgroundColor: isDarkMode ? CONSTANTS.THEME_BLACK : CONSTANTS.THEME_WHITE, color: isDarkMode ? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK }} 
            />
        </>
    );
};

export default ColourPickerPopUp;