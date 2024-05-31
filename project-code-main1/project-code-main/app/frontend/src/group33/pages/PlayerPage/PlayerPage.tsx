import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingPage from '../loadingPage/LoadingPage';
import { getExtraInfoPlayer } from '../../hooks/group33.hooks';
import TableChart from '../../components/Chart/table';
import RadarChart from '../../components/Chart/radarChart';
import PieChart from '../../components/Chart/pieChart';
import RadarDetail from '../../components/Chart/radarDetail';
import './PlayerPage.css';
import { motion } from 'framer-motion';


const PlayerPage: React.FC = () => {

  const location = useLocation();
  const playerData = location.state.playerFull;

  React.useEffect(() => {}, [playerData, playerData.id]);

  // Get the extra info of the player
  const { data: playerExtraInfo, isLoading, isFetching, isError } = getExtraInfoPlayer(playerData.id);

  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  // Function for goback button
  const goBack = () => {
    setIsExiting(true);
    setTimeout(() => navigate(-1), 500);
  };

  // New hover state
  const [hoverStates, setHoverStates] = useState({
    TableChart: false,
    radarChart: false,
    '3': false,
    '4': false
  });

  // While loading information
  if (isLoading || isFetching) {
    return <div>{<LoadingPage></LoadingPage>}</div>;
  }

  // While no extra information fetched
  if (isError) {
    return  <div>
              <button onClick={goBack} className={`goBackButton ${selectedDetail ? 'applyBlur' : ''}`}>
                Go Back
              </button>
              <div className='errorPage'>            
                No player extra information fetched for goal keepers
              </div>
            </div>;
  }

  // Handle hover with cursor
  const handleMouseEnter = (chartId: string) => setHoverStates({ ...hoverStates, [chartId]: true });
  const handleMouseLeave = (chartId: string) =>
    setHoverStates({ ...hoverStates, [chartId]: false });

  // Handle click animation
  const variants = {
    normal: {
      scale: 1,
      zIndex: 'auto',
      transition: { type: 'spring', stiffness: 300 }
    },
    expanded: {
      scale: 1.5,
      zIndex: 2,
      transition: { type: 'spring', stiffness: 300 }
    }
  };

  // While close the div
  const closeDetails = () => {
    setSelectedDetail(null);
  };

  // While click the div
  const toggleDetails = (detailName: string) => {
    setSelectedDetail(detailName);
  };

  // Blur other parts except selected one
  const applyBlur = (detailName: string) =>
    selectedDetail !== null && selectedDetail !== detailName;

  return (
    <div className={selectedDetail ? 'blurBackground' : ''}>
      <motion.div
        variants={variants}
        initial="initial"
        animate={isExiting ? 'exit' : 'visible'}
        className="wholePage_container">
        <button onClick={goBack} className={`goBackButton ${selectedDetail ? 'applyBlur' : ''}`}>
          Go Back
        </button>

        {/* player pic */}
        <motion.div
          className={`chart_container chart_container1 ${applyBlur('4') ? 'applyBlur' : ''}`}
          whileHover={selectedDetail === null ? (hoverStates['4'] ? { scale: 1.1 } : {}) : {}}
          onMouseEnter={() => handleMouseEnter('4')}
          onMouseLeave={() => handleMouseLeave('4')}
          onClick={() => toggleDetails('4')}
          whileTap={{}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') toggleDetails('4');
          }}
          variants={variants}
          animate={selectedDetail === '4' ? 'expanded' : 'normal'}>
          <img src={playerData.image_url} alt={playerData.name} className="player_image" />
          {selectedDetail === '4' && (
            <>
              <div className="details">
                <div className="myfont">{playerData.name}</div>
                <div className="myfont">{new Date(playerData.DOB).toISOString().split('T')[0]}</div>
                <div className="myfont">{playerData.height}</div>
                <div className="myfont">{playerData.position}</div>
              </div>
              <button
                className="closeButton"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDetails();
                }}></button>
            </>
          )}
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          className={`chart_container chart_container2 ${
            applyBlur('radarChart') ? 'applyBlur' : ''
          }`}
          whileHover={selectedDetail === null ? (hoverStates.radarChart ? { scale: 1.1 } : {}) : {}}
          onMouseEnter={() => handleMouseEnter('radarChart')}
          onMouseLeave={() => handleMouseLeave('radarChart')}
          onClick={() => toggleDetails('radarChart')}
          whileTap={{}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') toggleDetails('radarChart');
          }}
          variants={variants}
          animate={selectedDetail === 'radarChart' ? 'expanded' : 'normal'}>
          <RadarChart dataPointsPassed={playerExtraInfo} />
          {selectedDetail === 'radarChart' && (
            <>
              <div className="details">
                <RadarDetail dataPointsPassed={playerExtraInfo} />
              </div>
              <button
                className="closeButton"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDetails();
                }}></button>
            </>
          )}
        </motion.div>

        {/* pie chart */}
        <motion.div
          className={`chart_container chart_container3 ${applyBlur('3') ? 'applyBlur' : ''}`}
          whileHover={selectedDetail === null ? (hoverStates['3'] ? { scale: 1.1 } : {}) : {}}
          onMouseEnter={() => handleMouseEnter('3')}
          onMouseLeave={() => handleMouseLeave('3')}
          onClick={() => toggleDetails('3')}
          whileTap={{}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') toggleDetails('3');
          }}
          variants={variants}
          animate={selectedDetail === '3' ? 'expanded' : 'normal'}>
          <PieChart playerExtraInfo={playerExtraInfo} />
          {selectedDetail === '3' && (
            <>
              <div className="details"></div>
              <button
                className="closeButton"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDetails();
                }}></button>
            </>
          )}
        </motion.div>

        {/* TableChart */}
        <motion.div
          className={`chart_container chart_container4 ${
            applyBlur('TableChart') ? 'applyBlur' : ''
          }`}
          whileHover={selectedDetail === null ? (hoverStates.TableChart ? { scale: 1.1 } : {}) : {}}
          onMouseEnter={() => handleMouseEnter('TableChart')}
          onMouseLeave={() => handleMouseLeave('TableChart')}
          onClick={() => toggleDetails('TableChart')}
          whileTap={{}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') toggleDetails('TableChart');
          }}
          variants={variants}
          animate={selectedDetail === 'TableChart' ? 'expanded' : 'normal'}>
          <TableChart extraInfo={playerExtraInfo} />
          {selectedDetail === 'TableChart' && (
            <>
              <div className="details"></div>
              <button
                className="closeButton"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDetails();
                }}></button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PlayerPage;
