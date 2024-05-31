import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import ReactSwitch from 'react-switch';
import {ThreeDots} from 'react-loading-icons'

import './Group32.css';

import { MapData } from '../../interfaces/mapData';
import { TeamInfo } from '../../interfaces/teamInfo';
import { MapInfo } from '../../interfaces/mapInfo';

import Person from '../../assets/group_32/person.svg';
import Person_Light from '../../assets/group_32/person-light.svg';
import Group from '../../assets/group_32/group.svg';
import Group_Light from '../../assets/group_32/group-light.svg';
import Add_To_Map from '../../assets/group_32/add-to-map.svg';
import Add_To_Map_Light from '../../assets/group_32/add-to-map-light.svg';
import DarkMode from '../../assets/group_32/darkmode.svg';
import LightMode from '../../assets/group_32/lightmode.svg';

import { useDarkMode } from '../../context/DarkModeContext';

import { useGetTeamData } from '../../api/hooks/playerData.hooks';

import ComparePlayerList from '../../components/Group32/ComparePlayerList/ComparePlayerList';
import SpeechToText from '../../components/Group32/SpeechToText/SpeechToText';
import Map from '../../components/Map32/Map';
import CareerSearch from '../../components/Group32/CareerSearch/CareerSearch';

import * as CONSTANTS from '../../constants/constants';
import { CareerFiltersData } from '../../interfaces/careerFiltersData';
import { ColourGroups } from '../../interfaces/colourGroups';
import { Notes } from '../../interfaces/notes';
import { useLocation } from 'react-router-dom';

/**
 * Renders data visualisation from Group32
*/
const Group32 = () => {
  const location = useLocation();
  const passedSearchText = location.state?.passedSearchText;
  let arg = passedSearchText? passedSearchText: '';

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const center = new mapboxgl.LngLat(-1, 50);
  const initialMapInfo: MapInfo = { center: center, theme: false }
  const [mapInfo, setMapInfo] = useState<MapInfo>(initialMapInfo);

  const [mapData, setMapData] = useState<MapData[]>(() => {
    const storedData = localStorage.getItem('mapData');
    return storedData ? JSON.parse(storedData) : [];
  });

  const [isGroup, setIsGroup] = useState<boolean>(true);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [searchText, setSearchText] = useState(arg);

  const [currentColours, setCurrentColours] = useState<string[]>(() => {
    const storedData = localStorage.getItem('currentColours');
    return storedData ? JSON.parse(storedData) : [];
  });

  const [colourGroupNames, setColourGroupNames] = useState<ColourGroups[]>(() => {
    const storedData = localStorage.getItem('colourGroupNames');
    return storedData ? JSON.parse(storedData) : [];
  });

  const [careerFilters, setCareerFilters] = useState<CareerFiltersData>(() => {
    const storedData = localStorage.getItem('careerFilters');
    return storedData ? JSON.parse(storedData) : {
      yearFilter: [1800, 2024],
      clubFilter: [0, 100],
      colourFilter: []
    };
  });

  const [lastSearchedPlayer, setLastSearchedPlayer] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<TeamInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { refetch: refetchCareer } = useGetTeamData(searchText);
  const [showSearchMessage, setShowSearchMessage] = useState<boolean>(true);

  const [notes, setNotes] = useState<Notes[]>(() => {
    const storedData = localStorage.getItem('notes');
    return storedData ? JSON.parse(storedData) : [];
  });

  const buttonRef = useRef(null);

  /**
   * A React hook that performs side effects after the component renders.
   * It serializes various data and saves it to the local storage. 
   * @param effect The callback function containing the side effects to be executed.
   * @param dependencies mapData, mapInfo, searchResults, colourGroupNames, notes, careerFilters
   * @returns void
   */
  useEffect(() => {
    const serializedMapData = JSON.stringify(mapData);
    const serializedMapInfo = JSON.stringify(mapInfo);
    const serialiseSearchResults = JSON.stringify(searchResults);
    const serialiseColourGroupNames = JSON.stringify(colourGroupNames);
    const serialiseNotes = JSON.stringify(notes);
    const serialiseCareerFilters = JSON.stringify(careerFilters);
    
    const uniqueLineColors: string[] = Array.from(new Set(mapData.map((item: MapData) => item.lineColour)));
    setCurrentColours(uniqueLineColors);
    
    localStorage.setItem('mapData', serializedMapData);
    localStorage.setItem('mapInfo', serializedMapInfo);
    localStorage.setItem('searchResults', serialiseSearchResults);
    localStorage.setItem('lastSearchedPlayer', lastSearchedPlayer);
    localStorage.setItem('colourGroupNames', serialiseColourGroupNames)
    localStorage.setItem('notes', serialiseNotes);
    localStorage.setItem('careerFilters', serialiseCareerFilters);

  }, [mapData, mapInfo, searchResults, colourGroupNames, notes, careerFilters]);

  /**
   * Effect to retrieve map data from local storage when component mounts
   * @param effect The callback function containing the side effects to be executed.
   * @returns void
   */
  useEffect(() => {
      const retrievedMapData = localStorage.getItem('mapData');
      const retrievedMapInfo = localStorage.getItem('mapInfo');
      const retrievedSearchResults = localStorage.getItem('searchResults');
      const retrievedNotes = localStorage.getItem('notes');
      const retrievedCareerFilters = localStorage.getItem('careerFilters');
      
      if (retrievedMapData) {
          const deserializedMapData = JSON.parse(retrievedMapData);
          setMapData(deserializedMapData);
          const uniqueLineColors: string[] = Array.from(new Set(deserializedMapData.map((item: MapData) => item.lineColour)));
          setCurrentColours(uniqueLineColors);
      }

    // Deserialize data and set map data state
    if (retrievedMapData) {
      const deserializedMapData = JSON.parse(retrievedMapData);
      setMapData(deserializedMapData);
      const uniqueLineColors: string[] = Array.from(new Set(deserializedMapData.map((item: MapData) => item.lineColour)));
      setCurrentColours(uniqueLineColors);
    }

    if (retrievedMapInfo) {
      const deserializedMapInfo = JSON.parse(retrievedMapInfo);
      setMapInfo(deserializedMapInfo);
    }

    if (retrievedCareerFilters) {
      const deserializedCareerFilters = JSON.parse(retrievedCareerFilters);
      setCareerFilters(deserializedCareerFilters);
    }

    if (retrievedNotes) {
      const deserializedNotes = JSON.parse(retrievedNotes);
      setNotes(deserializedNotes);
    }

    if (retrievedSearchResults) {
      const deserializedSearchResults = JSON.parse(retrievedSearchResults);
      setSearchResults(deserializedSearchResults);
    }
  }, []);

  /**
 * A React hook that filters map data based on career filters and updates the state accordingly.
 * @param dependencies careerFilters contains career filter options like colourFilter, yearFilter, and clubFilter.
 * @returns void
 */
  useEffect(() => { 
    let shouldUpdate = false
    const filteredMapData: MapData[] = mapData.map((player: MapData) => {
      let shouldShow: boolean = true;

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

      if (player.isDisplayed != shouldShow) {
        shouldUpdate = true;
      }
    
      return {
        ...player,
        isDisplayed: shouldShow
      };

    });
    if (shouldUpdate) {
      setMapData(filteredMapData);
    }
  }, [careerFilters]);

  /**
   * Sets Error message to empty when dismissing the error
   */
  const dismissError = () => {
    setErrorMessage(''); 
  };

  
  /**
  * A React hook that filters which players are shown on the map depending on if the user is viewing the group page
  * @param dependencies isGroup if the user is on the group page.
  * @returns void
  */
  useEffect(() => { 
    let shouldUpdate = false
    const filteredMapData: MapData[] = mapData.map((player: MapData) => {
    let shouldShow: boolean = true;
  
      if (!isGroup) {
        if(player.playerName != currentPlayer){
          shouldShow = false;
        }

        if (player.isDisplayed != shouldShow){
          shouldUpdate = true;
        }
        if (shouldShow == true){
          setShowSearchMessage(false);
        }
      }

      if (isGroup) {
        shouldShow = true
        if (player.isDisplayed != shouldShow){
          shouldUpdate = true;
        }
      }
    
      return {
        ...player,
        isDisplayed: shouldShow
      };
    
    });
    if (shouldUpdate) {
      setMapData(filteredMapData);
    }
  }, [isGroup]);

  /**
   * Updates if the user is on the group or single player visualisation
   * @param isShowingGroup boolean if on group page
   */
  const updateIsGroupUI = (isShowingGroup: boolean) => {
    setIsGroup(isShowingGroup)
    if (isShowingGroup) {
      setCurrentPlayer("");
    }
  }

  /**
   * Updates who the current player is
   * @param player 
   */
  const updateCurrentPlayer = (player: string) => {
    setCurrentPlayer(player);
  }

  /**
   * Gets the current player being shown
   * @returns currentPlayer
   */
  const getCurrentPlayer = () => {
    return currentPlayer;
  }

  /**
   * The name of the player based on the search text
   * @returns searchText
   */
  const getPlayerName = () => {
    return searchText;
  }

  /**
   * Updates the map data to add a new player
   * @param TeamInfo 
   * @param playerName 
   */
  const updateMapData = (TeamInfo: TeamInfo[], playerName: string) => {
    if (playerName.length > 0){
    const numberTeam = TeamInfo.length || 0;
    const startDate = TeamInfo[0].StartDate?.substring(0, 4) || "Unknown";
    const currentYear = new Date().getFullYear().toString();
    const endDate = Number(TeamInfo[TeamInfo.length - 1].EndDate.substring(0, 4)) < 3000 ? TeamInfo[TeamInfo.length - 1].EndDate.substring(0, 4) : currentYear
    setMapData((prevMapData) => [
      ...prevMapData,
      {playerName: playerName, lineColour: CONSTANTS.THEME_BLACK, teamData: TeamInfo, isDisplayed: true, numberClubs: numberTeam, startDate: startDate, endDate: endDate},
    ]);
    setNotes((prevNotes) => [
      ...prevNotes,
      {playerName: playerName, notes:""},
    ]);
  }
  const hasColour = colourGroupNames.some(group => group.colourHex === CONSTANTS.THEME_BLACK);
  if (!hasColour) {
    setColourGroupNames((prevColourGroups) => [
      ...prevColourGroups,
      {colourHex: CONSTANTS.THEME_BLACK, colourName: CONSTANTS.THEME_BLACK},
    ]);
  }
  };

  /**
   * Updates dark mode for the Map 
   */
  const updateMapTheme = () => {
    setMapInfo(prevMapInfo => ({
      ...prevMapInfo,
      theme: !mapInfo.theme
    }));
  };
  
  /**
   * Deletes all players from the map and their notes data
   */
  const deleteAllMapData = () => {
    setMapData([]); 
    setNotes([]); 
  };

  /**
   * Deletes a player from the map
   * @param playerNameToRemove 
   */
  const deleteFromCompareList = (playerNameToRemove: string) => {
    setMapData((mapData) =>
      mapData.filter((player) => player.playerName !== playerNameToRemove)
    );
    deleteMapData(playerNameToRemove);
  }

  /**
   * Deletes a player from the map and clears all their notes data
   * @param playerName 
   */
  const deleteMapData = (playerName: string) => {
    setMapData((mapData) =>
      mapData.filter((player) => player.playerName !== playerName)
    );
    setNotes((notesdata) =>
      notesdata.filter((player) => player.playerName !== playerName)
    );
  };

  /**
   * Updates the line colour for a given player and the name of that colour group
   * @param playerName 
   * @param lineColour 
   * @param colourName 
   */
  const updatePlayerColour = (playerName: string, lineColour: string, colourName: string) => {
    setMapData((mapData) =>
        mapData.map((player) => {
            if (player.playerName === playerName) {
                return { ...player, lineColour };
            }
            return player;
        })
    );
    
    //if no name is given then use the colour hex code
    if (colourName === ""){
      colourName = lineColour;
    }

    const hasColour = colourGroupNames.some(group => group.colourHex === lineColour);
    if (hasColour) {
      setColourGroupNames((prevColourGroups) =>
        prevColourGroups.map((colourGroup) => {
          if (colourGroup.colourHex === lineColour) {
            return { ...colourGroup, colourName };
          }
          return colourGroup;
        })
      );
    } else {
      setColourGroupNames((prevColourGroups) => [
        ...prevColourGroups,
        { colourHex: lineColour, colourName: colourName },
      ]);
    }
  };

  /**
   * Updates the notes for a given player
   * @param playerName 
   * @param notes 
   */
  const updatePlayerNotes = (playerName: string, notes: string) => {
     setNotes((notesData) =>
        notesData.map((player) => {
             if (player.playerName === playerName) {
                 return { ...player, notes };
             }
             return player;
         })
     );  
  }

  /**
   * Returns the notes for a given player
   * @param playerName 
   * @returns player notes
   */
  const getPlayerNotes = (playerName: string): string => {
    const player = notes.find(player => player.playerName === playerName);
    return player ? player.notes : "";
  };

  /**
   * Returns the team data for a specific player from map data
   * @param playerName 
   * @returns team data for a player
   */
  const mapDataHasPlayer = (playerName: string) => {
    const playerTeamData = mapData.find(player => player.playerName === playerName);
    return playerTeamData ? playerTeamData.teamData : [];
  };

  /**
   * Gets the linecolour of a playerß
   * @param playerName 
   * @returns 
   */
  const getMapColour = (playerName: string) => {
    const playerTeamData = mapData.find(player => player.playerName === playerName);
    return playerTeamData ? playerTeamData.lineColour : CONSTANTS.THEME_BLACK;
  };

  /**
   * updates the center on the map
   * @param rawCoords 
   */
  const updateCenter = (rawCoords: [number, number]) => {
    const newCenter = new mapboxgl.LngLat(rawCoords[0], rawCoords[1]);

    if (mapInfo.center.lat == newCenter.lat && mapInfo.center.lng == newCenter.lng) {
      return;
    }

    setMapInfo(prevMapInfo => ({
      ...prevMapInfo,
      center: newCenter
    }));
  }

  /**
   * Updates if the user is on the Group page
   */
  const updateGroup = () => {
    updateIsGroupUI(true);
  }

  /**
   * Updates if the user is on the individual page
   */
  const updateIndividual = () => {
    updateIsGroupUI(false);
  }

  /**
   * Updates if the player is displayed on the map 
   * @param playerName 
   */
  const updateIsDisplayed = (playerName: string) => {
    setMapData((mapData) =>
      mapData.map((player) => {
        if (player.playerName === playerName) {
          let isDisplayed = !player.isDisplayed;
          return { ...player, isDisplayed };
        }
        return player;
      })
    );
  };

  /**
   * Handles change to the dark mode toggle
   * @param val 
   */
  const handleChange = (val: boolean | ((prevState: boolean) => boolean)) => {
    toggleDarkMode();
    updateMapTheme();
  };

  /**
   * Handles use of enter key on toggle
   * @param event 
   */
  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      toggleDarkMode();
      updateMapTheme();
    }
  };

  /**
   * Handles use of search for enter
   * @param event 
   */
  const handleSearchEnter = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      handlePlayerSearch();
    }
  };
  

  /**
   * Takes the user input and searches for a player on WikiData, then sets 
   * the appropriate variables so it is displayed on the map.
   */
  const handlePlayerSearch = async () => {

    if (mapData.length == 20) {
      setErrorMessage("Max players in Career Compare!");
      return;
    }

    setIsLoading(true);
    setCurrentPlayer(searchText);
    const searchedData = mapDataHasPlayer(searchText);
    if (searchedData.length > 0) {
      setSearchResults(searchedData);
      setCurrentPlayer(searchText);
      setLastSearchedPlayer(searchText);
    } else {
      try {
        const careerData = await refetchCareer();
      

        let raw_data: any = careerData.data;
        let newPlayer = searchText;

        const dataDict: TeamInfo[] = [];
        for (let i = 0; i < raw_data.Team_names.length; i++) {
          dataDict.push({
            Team_name: raw_data.Team_names[i],
            Appearances: raw_data.appearances[i],
            EndDate: raw_data.endDates[i],
            Goals: raw_data.goals[i],
            StadiumCoords: raw_data.stadium_coords[i],
            StadiumName: raw_data.stadium_names[i],
            StartDate: i < raw_data.startDates.length ? raw_data.startDates[i] : null,
            Image: raw_data.Image,
            TeamImage: raw_data.TeamImage,
            PlayerName: raw_data.PlayerName
          });
          if (raw_data.PlayerName) {
            newPlayer = raw_data.PlayerName;
          }
        }
        //if a player is in the list then don't add them in
        if (dataDict.length == 0) {
          setSearchResults([]);
          setIsLoading(false);
          setErrorMessage('Cannot find player');
          return;
        }
        updateMapData(dataDict, newPlayer);
        setSearchResults(dataDict);
        setLastSearchedPlayer(newPlayer);

      } catch (error) {
        console.error("Error fetching career data:", error);
        setErrorMessage('Cannot find player');
      }
    }
    setIsLoading(false);
  }

  /**
   * Handles updating the search text for the search box
   * @param e 
   */
  const handlePlayerSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    //https://stackoverflow.com/questions/71595722/auto-capitalization-of-input-value-in-react
    setSearchText(e.target.value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
  };

  /**
   * Reset the search results and the last searched player
   */
  const resetSearchResults = () => {
    setSearchResults([]);
    setLastSearchedPlayer("");
  }

  /**
   * Handles escape key to dismiss error
   * @param event 
   */
  const handleESCKeyDown = (event: { key: string; }) => {
    if (event.key === 'Escape') {
      dismissError()
    }
  };

  /**
   * Focuses error message
   */
  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errorMessage]);

  /**
   * Update the club filters for the map
   * @param clubFilter 
   */
  const updateClubFilter = (clubFilter: number[]) => {
    setCareerFilters(prevFilters => ({
        ...prevFilters,
        clubFilter: clubFilter
      }));
  };

  /**
   * Update the year filter for the map
   * @param yearFilter 
   */
  const updateYearFilter = (yearFilter: number[]) => {
      setCareerFilters(prevFilters => ({
          ...prevFilters,
          yearFilter: yearFilter
        }));
  };

  /**
   * Update the colour filter
   * @param colourFilter 
   */
  const updateColourFilter = (colourFilter: string[]) => {
    const updatedColourFilter = colourFilter.map(colourName => {
        const matchingGroup = colourGroupNames.find(group => group.colourName === colourName);
        return matchingGroup ? matchingGroup.colourHex : colourName;
    });
    setCareerFilters(prevFilters => ({
        ...prevFilters,
        colourFilter: updatedColourFilter
      }));
    
  };

  /**
   * Clear all the filters within the code
   */
  const clearAllFilters = () => {
    setCareerFilters({yearFilter: [1800, 2024],
        clubFilter: [0,100],
        colourFilter: []});
  }

  /**
   * This returns/renders the page component.
   */
  return (
    <div className={isDarkMode ? 'App dark-mode' : 'App light-mode'}>
      <div className="App-map-and-search">
      <div className='App-search'>
        <div className="view-change">
          <div className="group-buttons">
            <h1 className='header'>Player Career Plotter</h1>
            <div className='control-buttons'>
              <button onClick={updateGroup} 
                className="switch-group" 
                disabled={isGroup} 
                style={{backgroundColor: isGroup ? (isDarkMode ? CONSTANTS.THEME_BUTTON_BLUE : CONSTANTS.THEME_BUTTON_DARKMODE_BLUE) : CONSTANTS.THEME_BUTTON_GREY}}>
                <img src={isDarkMode && isGroup ? Group : Group_Light} alt="Group"/>
              </button>
            </div>
            <div className='control-buttons'>
              <button onClick={updateIndividual} 
              className="switch-group" 
              disabled={!isGroup} 
              style={{backgroundColor: !isGroup ? (isDarkMode ? CONSTANTS.THEME_BUTTON_BLUE : CONSTANTS.THEME_BUTTON_DARKMODE_BLUE) : CONSTANTS.THEME_BUTTON_GREY}}>
              <img src={isDarkMode && !isGroup ? Person : Person_Light}  alt="Individual"/>
          </button>
          </div>
          <div className='dark-mode-toggle'>
            <label htmlFor="dark-mode-change" className="visually-hidden">Dark Mode Toggle</label>
            <ReactSwitch
              checked={isDarkMode}
              onChange={handleChange}
              id="dark-mode-change"
              checkedIcon={<img src={DarkMode} alt="Dark Mode"/>}
              uncheckedIcon={<img src={LightMode} alt="Light Mode"/>}
              onKeyDown={handleKeyDown}
              offColor={CONSTANTS.THEME_BUTTON_DARKMODE_BLUE}
              onColor={CONSTANTS.THEME_BUTTON_GREY}
            />
          </div>
        </div>
        </div>
        <div className="search-bar control-buttons">
        <SpeechToText setText={setSearchText} tooltip="Use speech to text"/>
        <label htmlFor="search-bar-label" className="visually-hidden">Search Bar</label>
        <input
          type="text"
          className={isDarkMode ? 'search-input-dark dark-mode': 'search-input-light light-mode'}
          placeholder="Enter Player Name..."
          id="search-bar-label"
          value={searchText}
          onChange={handlePlayerSearchChange}
          onKeyDown={handleSearchEnter}
          style={{backgroundColor: isDarkMode ? CONSTANTS.THEME_BLACK : CONSTANTS.THEME_WHITE, 
            color: isDarkMode ? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK }}
        />
        <button onClick={handlePlayerSearch} disabled={searchText.length === 0 || isLoading} className='search-button'>
            {isLoading ? (
              <ThreeDots stroke={CONSTANTS.THEME_BLACK} fill={CONSTANTS.THEME_WHITE} strokeOpacity={0} speed={.75} width={20}/>
              ) : (
              <img src={isDarkMode && !(searchText.length === 0 || isLoading) ? Add_To_Map : Add_To_Map_Light} alt="Delete"/>
            )}
        </button>
      </div>
      {(mapData.length === 0 && isGroup) && (
        <div className="centered-text">
          <p className='no-player-message-group'>Search for players to add their careers to the map</p>
        </div>
      )}
      {(showSearchMessage && mapData.length == 0 )&& !isGroup && (
        <div className="centered-text">
          <p className='no-player-message-individual'>Search for new players or choose players from your list</p>
        </div>
      )}

          {(isGroup && mapData.length > 0) && (
            <ComparePlayerList
              getPlayerNotes={getPlayerNotes}
              updatePlayerNotes={updatePlayerNotes}
              deleteAllMapData={deleteAllMapData}
              resetSearchResults={resetSearchResults}
              Compare_players={mapData}
              DeletePlayer={deleteFromCompareList}
              updatePlayerColour={updatePlayerColour}
              updateIsGroupUI={updateIsGroupUI}
              updateCurrentPlayer={updateCurrentPlayer}
              updateIsDisplayed={updateIsDisplayed}
              careerFilters={careerFilters}
              updateColourFilter={updateColourFilter}
              updateYearFilter={updateYearFilter}
              updateClubFilter={updateClubFilter}
              clearAllFilters={clearAllFilters}
            />
          )}
          {(!isGroup && mapData.length > 0) && (
            <CareerSearch
              getPlayerNotes={getPlayerNotes}
              updateCenter={updateCenter}
              mapDataHasPlayer={mapDataHasPlayer}
              getCurrentPlayer={getCurrentPlayer}
              getMapColour={getMapColour}
              updatePlayerNotes={updatePlayerNotes}
              setErrorMessage={setErrorMessage} />
          )}
        </div>
        <div className='App-map'>
          <Map mapData={mapData} mapInfo={mapInfo} />
        </div>
      </div>
      {errorMessage && (
    <div
      className={`popup-container ${errorMessage ? 'show-popup' : ''}`}
      onKeyDown={handleESCKeyDown} 
      ref={errorRef}
      tabIndex={0} 
    >
    <button className="error-message" onClick={dismissError} tabIndex={0} ref={buttonRef}>
      {errorMessage}
    </button>
  </div>
)}
    </div>
  );
};

export default Group32;