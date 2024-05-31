import React, { useEffect, useRef, useState } from 'react';

import './ComparePlayerList.css';

import GenerateComparePDF from '../PDF Generator/GenerateComparePDF';
import Delete_Player from '../../../assets/group_32/delete-player.svg';
import Delete_Player_Light from '../../../assets/group_32/delete-player-light.svg';
import Colour_Picker from '../../../assets/group_32/color-picker.svg';
import Colour_Picker_Black from '../../../assets/group_32/color-picker-black.svg';
import NotesIcon from '../../../assets/group_32/notes.svg';
import FiltersIcon from '../../../assets/group_32/filters.svg';
import FiltersIcon_Light from '../../../assets/group_32/filters-light.svg';

import { useDarkMode } from '../../../context/DarkModeContext';
import { MapData } from '../../../interfaces/mapData';
import ColorPickerComponent from '../ColourPickerPopUp/ColourPickerPopUp';
import CareerFilters from '../CareerFilters/CareerFilters';
import { CareerFiltersData } from '../../../interfaces/careerFiltersData';
import { Notes } from '../../../interfaces/notes';
import NotesIconLight from '../../../assets/group_32/noteslight.svg';
import AddNotes from '../AddNotes/AddNotes';

import * as CONSTANTS from '../../../constants/constants';

/**
 * Interface for props passed to the ComparePlayerList component
 * @interface
 */
interface ComparePlayerListProps {
  Compare_players: MapData[]; // Array of player data to compare
  DeletePlayer: (playerName: string) => void; // Function to delete a player
  updatePlayerColour: (playerName: string, lineColour: string, colourName: string) => void; // Function to update player colour
  updateIsGroupUI: (isGroup: boolean) => void; // Function to update UI based on group
  updateCurrentPlayer: (player: string) => void; // Function to update current player
  updateIsDisplayed: (player: string) => void; // Function to update player display
  resetSearchResults: () => void; // Function to reset search results
  deleteAllMapData: () => void; // Function to delete all player data
  updatePlayerNotes: (player: string, notes: string) => void; // Function to update player notes
  getPlayerNotes: (player: string) => string; // Function to get player notes
  careerFilters: CareerFiltersData; // Object containing career filters
  updateClubFilter: (clubFilter: number[]) => void; // Function to update club filter
  updateYearFilter: (yearFilter: number[]) => void; // Function to update year filter
  updateColourFilter: (colourFilter: string[]) => void; // Function to update colour filter
  clearAllFilters: () => void; // Function to clear all filters
}

// Define the expected props for the ComparePlayerList component
const ComparePlayerList: React.FC<ComparePlayerListProps> = ({
  getPlayerNotes, updatePlayerNotes, deleteAllMapData,
  resetSearchResults, Compare_players, DeletePlayer,
  updatePlayerColour, updateIsGroupUI, updateCurrentPlayer,
  updateIsDisplayed, careerFilters, updateClubFilter,
  updateYearFilter,
  updateColourFilter,
  clearAllFilters }) => {

  // Hooks and state initialization
  const { isDarkMode } = useDarkMode();
  let numberPlayers = Compare_players.length;
  const [showPicker, setShowPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerNotes, setPlayerNotes] = useState("");
  const [pickerColour, setPickerColor] = useState(CONSTANTS.THEME_WHITE);
  const popupRef = useRef<HTMLDivElement>(null);
  const [showPlayerNotes, setShowPlayerNotes] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<MapData[]>([]);

  /**
   * Handles the deletion of a player.
   * @param {React.MouseEvent<HTMLButtonElement>} event - The button click event
   */
  const handleDeletePlayer: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const currentPlayerName = event.currentTarget.getAttribute('data-playername');
    if (currentPlayerName) {
      if (showPlayerNotes && playerName == currentPlayerName) {
        setShowPlayerNotes(false);
      }
      setPlayerName(currentPlayerName);
      DeletePlayer(currentPlayerName);
      numberPlayers - 1; 
      const lastSearchedPlayerName = localStorage.getItem('lastSearchedPlayer') || "";
      if (lastSearchedPlayerName === currentPlayerName) {
        resetSearchResults();
      }

    }
  };

  /**
   * Handles the viewing of a player.
   * @param {React.MouseEvent<HTMLButtonElement>} event - The button click event
   */
  const handleViewPlayer: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const currentPlayerName = event.currentTarget.getAttribute('data-playername');
    if (currentPlayerName) {
      updateCurrentPlayer(currentPlayerName);
      updateIsGroupUI(false);
    }
  };

  /**
   * Handles the showing of color picker for a player.
   * @param {React.MouseEvent<HTMLButtonElement>} event - The button click event
   */
  const handleShowPicker: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const currentPlayerName = event.currentTarget.getAttribute('data-playername');
    const currentColour = event.currentTarget.getAttribute('data-colour');
    if (currentPlayerName && currentColour) {
      setPlayerName(currentPlayerName);
      setPickerColor(currentColour);
    }
    setShowPicker(!showPicker);
  };

  /**
   * Handles unchecking of a player.
   * @param {object} event - The event object
   */
  const handleUncheck = (event: { currentTarget: { getAttribute: (arg0: string) => any; }; }) => {
    const currentPlayerName = event.currentTarget.getAttribute('data-playername');
    if (currentPlayerName) {
      updateIsDisplayed(currentPlayerName);
    }
  }

  /**
   * Dismisses the color picker.
   */
  const dismissPicker = () => {
    setShowPicker(!showPicker)
  };
  
  /**
   * Handles the ESC key down event.
   * @param {object} event - The event object
   */
  const handleESCKeyDown = (event: {
    currentTarget: any; key: string; }) => {
    const currentPlayerName = event.currentTarget.getAttribute('data-playername');
    const currentColour = event.currentTarget.getAttribute('data-colour');
    if (currentPlayerName && currentColour) {
      setPlayerName(currentPlayerName);
      setPickerColor(currentColour);
    }
    if (event.key === 'Escape') {
      setShowPicker(!showPicker)
    }
  };

  // Function to focus on color picker when shown
  useEffect(() => {
    if (showPicker && popupRef.current) {
      popupRef.current.focus();
    }
  }, [showPicker]);

  /**
   * Determines whether a player should be shown based on filters.
   * @param {MapData} player - The player data
   * @returns {boolean} - Whether the player should be shown
   */
  const shouldShow = (player: MapData) => {
    let shouldShow = true;

    if (careerFilters) {
      const { colourFilter, yearFilter, clubFilter } = careerFilters;

      if (colourFilter && colourFilter.length > 0 && !colourFilter.includes(player.lineColour)) {
        shouldShow = false;
      }

      if (yearFilter && yearFilter.length === 2) {
        const [startYear, endYear] = yearFilter;
        if (Number(player.startDate) < startYear || Number(player.endDate) > endYear) {
          shouldShow = false;
        }
      }

      if (clubFilter && clubFilter.length === 2) {
        const [minClubs, maxClubs] = clubFilter;
        if (player.numberClubs < minClubs || player.numberClubs > maxClubs) {
          shouldShow = false;
        }
      }
    }

    return shouldShow;
  };
  
  /**
   * Closes player notes.
   */
  const closeNotes = () => {
    setShowPlayerNotes(false);
  }

  /**
   * Handles showing of player notes.
   * @param {React.MouseEvent<HTMLButtonElement>} event - The button click event
   */
  const handleShowNotes: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const currentPlayerName = event.currentTarget.getAttribute('data-playername');
    setPlayerNotes("");

    const retrievedNotes = localStorage.getItem('notes');
    if (retrievedNotes) {
      const deserializedNotes = JSON.parse(retrievedNotes);
      const allNotes = deserializedNotes;

      const player = allNotes.find((note: Notes) => note.playerName === playerName);

      if (player) {
          setPlayerNotes(player.notes);
      } 
    }

    if (currentPlayerName) {
      const currentPlayerNotes = getPlayerNotes(currentPlayerName);
      setPlayerName(currentPlayerName);
      setShowPlayerNotes(!showPlayerNotes);
      if (currentPlayerNotes) {
        setPlayerNotes(currentPlayerNotes);
      }
    }
  };

  /**
   * Toggles showing of filters.
   */
  const shouldShowSetting = () => {
    setShowFilters(!showFilters)
  }

  /**
   * Closes filters.
   */
  const closeFilters = () => {
    setShowFilters(false)
  }

  return (
    <div className="career-search career-table">
      {numberPlayers > 0 && (
        <div className='settings-filters'>
          <button className='settings-button settings-filters' onClick={shouldShowSetting}>
            <img src={isDarkMode ? FiltersIcon : FiltersIcon_Light} className="filtersicon" alt="icon" />
            <h1>Advanced Filters</h1>
          </button>
          <div style={{paddingLeft: 10}}> 
            <GenerateComparePDF player1={Compare_players[0]} player2={Compare_players[1]} />
          </div>
        </div>
      )}
      {(showFilters && (numberPlayers > 0)) && (
        <CareerFilters
          updateColourFilter={updateColourFilter}
          updateYearFilter={updateYearFilter}
          updateClubFilter={updateClubFilter}
          clearAllFilters={clearAllFilters}
          deleteAllMapData={deleteAllMapData}
          closeFilters={closeFilters} 
          careerFilters={careerFilters}/>
      )}
      {showPicker && (
        <div className={`popup-container ${showPicker ? 'show-popup' : ''}`} ref={popupRef} onKeyDown={handleESCKeyDown}>
          <ColorPickerComponent
            updatePlayerColour={updatePlayerColour}
            dismissPicker={dismissPicker}
            playerName={playerName}
            startColour={pickerColour}
          />
        </div>
      )}
      {showPlayerNotes && (
        <AddNotes playerName={playerName} playerNotes={playerNotes} updatePlayerNotes={updatePlayerNotes} closeNotes={closeNotes} />
      )}
      { numberPlayers > 0 && (
        <div className='element-left-padding'>
      <table className="player-table" >
        <thead>
          <tr>
            <th>Show</th>
            <th>Name</th>
            <th>Notes</th>
            <th>Clubs</th>
            <th>Years</th>
            <th>Picker</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody className={isDarkMode? "player-row player-row-darkmode" : "player-row player-row-lightmode"}>
        {Compare_players.map((player) => (shouldShow(player) ? (
            <tr key={player.playerName}>
              <td className='element-left-padding'>
              <label htmlFor={`playerCheckbox-${player.playerName}`} className="visually-hidden">Checkbox {player.playerName}</label>
                  <input 
                      type="checkbox" 
                      id={`playerCheckbox-${player.playerName}`}
                      checked={player.isDisplayed}
                      data-playername={player.playerName}
                      onChange={handleUncheck}
                      style={{ accentColor: isDarkMode ? CONSTANTS.THEME_BUTTON_BLUE : CONSTANTS.THEME_BUTTON_DARKMODE_BLUE}}
                  />
              </td>
              <td>
                <button onClick={handleViewPlayer} 
                data-playername={player.playerName} 
                className={isDarkMode ? 'player-row-name player-row-name-dark' : 'player-row-name player-row-name-light'}>
                  {player.playerName}
                  </button>
              </td>
              <td>
              <button 
                  onClick={handleShowNotes} 
                  data-playername={player.playerName}
                  className='player-buttons'
                  style={{ backgroundColor: 'transparent' }}>
                    <img src={isDarkMode ? NotesIconLight : NotesIcon} alt="Notes"/>
                </button> 
              </td>
              <td className="text-info">{player.numberClubs}</td>
              <td className="text-info">
                {player.startDate}-
                {player.endDate}
              </td>         
              <td>
                <button 
                  onClick={handleShowPicker} 
                  data-playername={player.playerName}
                  data-colour = {player.lineColour}
                  className='player-buttons'
                  style={{ backgroundColor: player.lineColour }}>
                  <img src={player.lineColour===CONSTANTS.THEME_WHITE ? Colour_Picker_Black : Colour_Picker} alt="ColourPicker"/>
                </button>
              </td>
              
              <td>
                <button onClick={handleDeletePlayer} data-playername={player.playerName} className='player-buttons'>
                  <img src={isDarkMode ? Delete_Player : Delete_Player_Light} alt="Delete"/>
                </button>
              </td>
            </tr>
          ) : null
        ))}
        </tbody>
      </table>
      </div>
      )}
    </div>
  );
}

export default ComparePlayerList;
