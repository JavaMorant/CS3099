import React from 'react';

import { useDarkMode } from '../../../context/DarkModeContext';
import './Predictions.css'
interface PredictionsProps {
  predictionsData: string[];
  currentLeague: string;
  closePredictions: () => void; // Function to prediction section
  
}
  
const Predictions: React.FC<PredictionsProps> = ({ predictionsData, currentLeague,closePredictions }) => {

    const { isDarkMode } = useDarkMode();

    return (
        <div className='predictions'>
            <div className={isDarkMode ? 'advanced-filters filters-dark' : 'advanced-filters filters-light'}>
            <div className="flex-container">
              <h1>Next League Predictions</h1>
              <div className="close-button-prediction">
                <button onClick={closePredictions}>Close</button>
              </div>
            </div>
            <h2>How we predict:</h2>
            <p>We use the data from 100 random players with the same league and nationality of your players to predict what league your player might move to next.</p>
            <h2>Current League:</h2>
            <p>{currentLeague}</p>
            { predictionsData.length > 0 ? (
            <table className='prediction-table'>
              <thead>
                <tr>
                  <th>League</th>
                  <th>Chance of Joining %</th>
                </tr>
              </thead>
              <tbody>
              {
                predictionsData && predictionsData.map((league, index) => (
                  <tr key={index}> 
                    <td>{league[0]}</td>
                    <td>{league[1]}%</td>
                  </tr>
                ))
              }
              </tbody>
            </table>
            ) : (
              <h1>No predictions can be made for this player!</h1>
            )}
        </div>
        </div>
            
    );
};

export default Predictions;