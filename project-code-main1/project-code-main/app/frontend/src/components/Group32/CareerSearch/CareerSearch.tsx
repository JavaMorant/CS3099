// Importing necessary modules from React and related files
import React, { useState, useEffect } from 'react';
import Carousel from '../Carousel/Carousel';
import './CareerSearch.css';
import { Link as RouterLink } from 'react-router-dom';
import News from '../../../assets/group_32/news.svg';
import NotesIcon from '../../../assets/group_32/notes.svg';
import Modal from '../NewsInformation/Modal';
import NewsHeadlines from '../NewsInformation/NewsHeadlines';

// Importing necessary interfaces and context
import { TeamInfo } from '../../../interfaces/teamInfo';
import { useDarkMode } from '../../../context/DarkModeContext';
import NotesIconLight from '../../../assets/group_32/noteslight.svg';
import { Notes } from '../../../interfaces/notes';
import AddNotes from '../AddNotes/AddNotes';
import Predictions from '../Predictions/Predictions';
import PredictionsLight from '../../../assets/group_32/predictionslight.svg';
import PredictionsIcon from '../../../assets/group_32/predictions.svg';

import * as CONSTANTS from '../../../constants/constants';

// Importing custom hooks
import { useGetNextLeagues } from '../../../api/hooks/playerData.hooks';
import { ThreeDots } from 'react-loading-icons';
import PlayerDetails from '../PDF Generator/PlayerDetails';
//import { Modal } from '@mui/material';

// Defining props interface for CareerSearch component
interface CareerSearchProps {
  updateCenter: (rawCoords: [number, number]) => void;
  mapDataHasPlayer: (playerName: string) => TeamInfo[];
  getCurrentPlayer: () => string;
  getMapColour: (playerName: string) => string;
  getPlayerNotes: (player: string) => string;
  updatePlayerNotes: (player: string, notes: string) => void;
  setErrorMessage: (error: string) => void;
}

// Defining CareerSearch component
const CareerSearch: React.FC<CareerSearchProps> = ({
  updatePlayerNotes,
  getPlayerNotes,
  updateCenter,
  mapDataHasPlayer,
  getCurrentPlayer,
  getMapColour,
  setErrorMessage,
}) => {
  // State variables initialization
  const [playerName, setPlayerName] = useState('');
  const [searchResults, setSearchResults] = useState<TeamInfo[]>(() => {
    const storedData = localStorage.getItem('searchResults');
    return storedData ? JSON.parse(storedData) : [];
  });
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showPlayerNotes, setShowPlayerNotes] = useState(false);
  const [playerNotes, setPlayerNotes] = useState("");
  const { refetch: refetchPredictions } = useGetNextLeagues(playerName);
  const [predictionsData, setPredictionData] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [lineColour, setLineColour] = useState<string>(CONSTANTS.THEME_BLACK);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [currentLeague, setCurrentLeague] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isDarkMode } = useDarkMode();

  // Effect to fetch data and update states based on current player
  useEffect(() => {
    const currentPlayer = getCurrentPlayer();
    setShowPredictions(false);
    if (currentPlayer.length > 0) {
      const searchedData = mapDataHasPlayer(currentPlayer);
      if (searchedData.length > 0) {
        setSearchPerformed(false);
        setSearchResults(searchedData);
        setPlayerName(currentPlayer);
        setSearchPerformed(true);
        let playerColour = getMapColour(currentPlayer);
        if (isDarkMode && playerColour == CONSTANTS.THEME_BLACK) {
          playerColour = CONSTANTS.THEME_WHITE
        }
        setLineColour(playerColour);
      }
    } else {
      const retrievedSearchResults = localStorage.getItem('searchResults');


      // Deserialize data and set map data state
      if (retrievedSearchResults !== null) {
        const deserializedSearchResults = JSON.parse(retrievedSearchResults);
        if (deserializedSearchResults.length > 0) {
          setSearchResults(deserializedSearchResults);
          setSearchPerformed(true);
          const playerName = localStorage.getItem('lastSearchedPlayer') || "";
          setPlayerName(playerName);
          let playerColour = getMapColour(currentPlayer);
          if (isDarkMode && playerColour == CONSTANTS.THEME_BLACK) {
            playerColour = CONSTANTS.THEME_WHITE
          }
          setLineColour(playerColour);
        }
      }
    }
  }, [getCurrentPlayer]);

  // Handler to show or hide player notes
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

  // Handler to update center coordinates
  const handleupdateCenterUp = (rawCoords: [number, number]) => {
    updateCenter(rawCoords);
  };

  // Reset team details when not hovering
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTeamDetails(false);
    }, 5000); // 4 seconds delay
    return () => clearTimeout(timeout);
  }, [showTeamDetails]);

  // Function to close notes section
  const closeNotes = () => {
    setShowPlayerNotes(false);
  }

  // Function to close predictions section
  const closePredictions = () => {
    setShowPredictions(false);
  }

  // Handler to show or hide predictions
  const handleShowPredictions = async () => {
    setIsLoadingPredictions(true);
    if (showPredictions) {
      setShowPredictions(!showPredictions);
    } else {
      try {
        const predictionsData: any = await refetchPredictions();
        if (predictionsData.data.League_and_Chance && predictionsData.data.League_Name) {
          setPredictionData(predictionsData.data.League_and_Chance)
          setCurrentLeague(predictionsData.data.League_Name)
          setShowPredictions(!showPredictions);
        }
        else {
          setErrorMessage("No predictions can be made for this player");
        }
      } catch {
        setErrorMessage("No predictions can be made for this player");
      }
    }
    setIsLoadingPredictions(false);
  }

  return (
    <div className={isDarkMode ? 'career-search dark-mode' : 'career-search light-mode'}>
      {searchPerformed && (
        <div className='core-player-info'>
          <div className='player-image-container'>
            {searchResults.length > 0 && searchResults[0].Image && (
              <img src={searchResults[0].Image} alt="player" className='player-image' />
            )}
          </div>
          <div className='player-details'>
            <h1 className="player-card-name">{playerName}</h1>
            <p>{searchResults.length} clubs</p>
            <p>
              {searchResults[0].StartDate?.substring(0, 4)}-
              {Number(searchResults[searchResults.length - 1].EndDate.substring(0, 4)) < 3000
                ? searchResults[searchResults.length - 1].EndDate.substring(0, 4)
                : "Present"}
            </p>
            <div className='other-options'>
              <button
                onClick={handleShowNotes}
                data-playername={playerName}
                className='player-buttons'
              >
                <img src={isDarkMode ? NotesIconLight : NotesIcon} alt="Notes" />
              </button>
              <button
                onClick={handleShowPredictions}
                data-playername={playerName}
                className='player-buttons'>
                {isLoadingPredictions ? (
                  <ThreeDots stroke={CONSTANTS.THEME_WHITE} fill={isDarkMode ? CONSTANTS.THEME_WHITE : CONSTANTS.THEME_BLACK} strokeOpacity={0} speed={.75} width={20} />
                ) : (
                  <img src={isDarkMode ? PredictionsLight : PredictionsIcon} alt="Predictions" />
                )}
              </button>
            </div>
          </div>
          <div className='Extra share'>
            <button onClick={() => setIsModalOpen(true)} className='pdf-style-button'>
              <img src={News} alt="News" />
            </button>
          </div>
          <PlayerDetails playerName={playerName} currentPlayerNotes={getPlayerNotes(playerName)} predictionsData={predictionsData} playerImageSrc={searchResults[0].Image} />
            <Modal
              showModal={isModalOpen} handleClose={() => setIsModalOpen(false)}
            >
            <NewsHeadlines playerId={playerName} />
          </Modal>
        </div>
      )}

      {showPlayerNotes && (
        <AddNotes playerName={playerName} playerNotes={playerNotes} updatePlayerNotes={updatePlayerNotes} closeNotes={closeNotes} />
      )}
      {predictionsData && showPredictions && (
        <Predictions predictionsData={predictionsData} currentLeague={currentLeague} closePredictions={closePredictions} />
      )}

      {searchPerformed && (
        <div className={isDarkMode ? 'card-info dark-mode' : 'card-info light-mode'} style={{ border: `2px solid ${lineColour}` }}>
          <Carousel data={searchResults} updateCenter={handleupdateCenterUp} />
          <RouterLink to="/TeamHub"><b>Explore more about this player's team</b></RouterLink>
        </div>
      )}
    </div>
  );
};

export default CareerSearch;