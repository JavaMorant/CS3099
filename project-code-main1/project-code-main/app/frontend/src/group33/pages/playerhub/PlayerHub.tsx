import { getTeamWithPlayers } from '../../hooks/group33.hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import PlayerCard from '../../components/playercard/PlayerCard';
import LoadingPage from '../loadingPage/LoadingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import './PlayerHub.css';
import Switch from 'react-switch';
import { FaRegEye } from 'react-icons/fa';
import { removeDuplicatePlayers } from './RemoveDuplicateUser';

type FlipStates = Record<string, boolean>;

const TeamComponent: React.FC = () => {
  const { teamID } = useParams<{ teamID?: string }>();
  const [isColorBlind, setIsColorBlind] = useState(false);
  const [flipStates, setFlipStates] = useState<FlipStates>({});
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // Get the all player of the team
  const {
    data: teamWPlayerResponse,
    isLoading,
    isError,
    isFetching,
    error
  } = getTeamWithPlayers(teamID || '') as {
    data: { teamWithPlayers: { team: any; players: any[] } } | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    isFetching: boolean;
  };

  var uniquePlayers: any;
  if(!isFetching){
    uniquePlayers = removeDuplicatePlayers(teamWPlayerResponse?.teamWithPlayers.players);
  }
  console.log(uniquePlayers)

  // Function handle color blind function
  const applyColorScheme = (isColorBlindMode: any) => {
    if (isColorBlindMode) {
      // Apply color-blind-friendly color scheme
      document.documentElement.style.setProperty('--primary-color', 'var(--cb-primary-color)');
      document.documentElement.style.setProperty('--secondary-color', 'var(--cb-secondary-color)');
      document.documentElement.style.setProperty('--tertiary-color', 'var(--cb-tertiary-color)');
      document.documentElement.style.setProperty('--text-color', 'var(--cb-text-color)');
      document.documentElement.style.setProperty(
        '--secondary-text-color',
        'var(--cb-secondary-text-color)'
      );
      document.documentElement.style.setProperty('--divider-color', 'var(--cb-divider-color)');
      document.documentElement.style.setProperty(
        '--individual-scores-color',
        'var(--cb-individual-scores-color)'
      );
    } else {
      // Apply original color scheme
      document.documentElement.style.setProperty(
        '--primary-color',
        'var(--original-primary-color)'
      );
      document.documentElement.style.setProperty(
        '--secondary-color',
        'var(--original-secondary-color)'
      );
      document.documentElement.style.setProperty(
        '--tertiary-color',
        'var(--original-tertiary-color)'
      );
      document.documentElement.style.setProperty('--text-color', 'var(--original-text-color)');
      document.documentElement.style.setProperty(
        '--secondary-text-color',
        'var(--original-secondary-text-color)'
      );
      document.documentElement.style.setProperty(
        '--divider-color',
        'var(--original-divider-color)'
      );
      document.documentElement.style.setProperty(
        '--individual-scores-color',
        'var(--original-individual-scores-color)'
      );
    }
  };

  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  // Function for goback button
  const goBack = () => {
    setIsExiting(true);
    setTimeout(() => navigate(-1), 500);
  };

  // Function for handle flip player card
  useEffect(() => {
    if (uniquePlayers) {
      const initialFlipStates: FlipStates = {};
      uniquePlayers.forEach((uniquePlayers: any) => {
        initialFlipStates[uniquePlayers.id] = false;
      });
      setFlipStates(initialFlipStates);
    }
  }, [teamWPlayerResponse]);

  useEffect(() => {
    // On mount, apply the color scheme based on the stored value
    const storedIsColorBlind = JSON.parse(localStorage.getItem('isColorBlind') || 'false');
    setIsColorBlind(storedIsColorBlind);
    applyColorScheme(storedIsColorBlind);
  }, []);

  // Function for handle flip player card
  const handleFlip = (playerId: string) => {
    setFlipStates((prevStates) => ({
      ...prevStates,
      [playerId]: !prevStates[playerId]
    }));
  };

  if (isLoading || !teamWPlayerResponse || isFetching) {
    return <div>{<LoadingPage />}</div>;
  }

  // While no player found
  if (teamWPlayerResponse.teamWithPlayers.players.length === 0) {
    return (
      <div>
        <button onClick={goBack} className="goBackButton">
          Go Back
        </button>
        <div className='errorPage'>            
          No players found in WikiData for this current team
        </div>
      </div>
    );
  }

  // Button for color blind mode
  const toggleColorBlindMode = () => {
    const newIsColorBlind = !isColorBlind;
    setIsColorBlind(newIsColorBlind);
    localStorage.setItem('isColorBlind', JSON.stringify(newIsColorBlind));
    applyColorScheme(newIsColorBlind);
  };

  const { team, players } = teamWPlayerResponse.teamWithPlayers;

  // Animation to flip card
  const flipCardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.5 }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.5 }
    }
  };

  // Function navigate to extra information page
  const handleNavigateToPlayer = async (player: any) => {
    try {
      const playerFull = await fetchPlayerById(player.id);
      navigate(`/PlayerPage/${player.id}`, { state: { playerFull } });
    } catch (error) {
      console.error('Failed to fetch extra player data', error);
    }
  };

  // Function fetch player extra information
  async function fetchPlayerById(playerId: any) {
    const response = await fetch(`/api/player/${playerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player data');
    }
    const data = await response.json();
    return data;
  }

  if (isLoading) return <LoadingPage />;
  if (isError) return <div>Error: {error?.message}</div>;

  // Function filter player for search bar
  const filteredPlayers = uniquePlayers.filter((uniquePlayers: any) =>
    uniquePlayers.name.toLowerCase().includes(playerSearchQuery.toLowerCase())
  );

  return (
    <div className="mainBackground">
      <div className="bg-gray-900">
        <button onClick={goBack} className="goBackButton">
          Go Back
        </button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: '40px'
          }}>
          <div />
          <h1
            style={{ color: '#FFFFFF' }}
            className="font-bold text-4xl md:text-5xl lg:text-6xl text-center my-4 rounded-lg transform hover:scale-105 transition duration-500 ease-in-out">
            {team?.name}
          </h1>
          <div className="bg-white rounded p-4 shadow-lg inline-flex items-center">
            <FaRegEye className="mr-2" />
            <Switch
              onChange={toggleColorBlindMode}
              checked={isColorBlind}
              offColor="#767577"
              onColor="#81b0ff"
              height={20}
              width={48}
              uncheckedIcon={false}
              checkedIcon={false}
              aria-label={isColorBlind ? 'Switch to Normal Mode' : 'Switch to Color Blind Mode'}
              onKeyDown={(e) => {
                // Check if the key pressed is Enter
                if (e.key === 'Enter') {
                  toggleColorBlindMode();
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-center items-center mt-4">
          <div className="w">
            <input
              type="text"
              placeholder="Search for a player..."
              value={playerSearchQuery}
              onChange={(e) => setPlayerSearchQuery(e.target.value)}
              className=" lg:w-3/4 h-10 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline placeholder-gray-900"
            />
          </div>
        </div>

        <div className="flex flex-wrap mx-auto w-4/4 mt-4 mr-8 ml-6">
          {filteredPlayers?.map((player: any, index: any) => {
            player.teamBadge_URL = team.image_url;
            return (
              <div className="card-wrapper">
                <motion.div
                  className="card-container"
                  key={player.id}
                  variants={flipCardVariants}
                  animate={flipStates[player.id] ? 'back' : 'front'}
                  onClick={() => handleFlip(player.id)}
                  whileTap={{}}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFlip(player.id);
                  }}>
                  <motion.div className="player-card-front">
                    <PlayerCard player={player} />
                  </motion.div>
                  <motion.div className="player-card-back">
                    <div className="myfont2">{'Name: ' + player.name}</div>
                    <div className="myfont2">{'DOB: ' + player.DOB.slice(0, 10)}</div>
                    <div className="myfont2">{'Height: ' + player.height + 'cm'}</div>
                    <div className="myfont2">{'Pos: ' + player.position}</div>

                    <button className='goBackButton'
                      onClick={() => handleNavigateToPlayer(player)}
                      tabIndex={flipStates[player.id] ? 0 : -1}>
                      View Details
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamComponent;
