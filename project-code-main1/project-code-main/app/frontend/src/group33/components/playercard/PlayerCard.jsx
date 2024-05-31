import React, { useEffect } from 'react';
import './PlayerCard.css';

/**
 * 
 * @param {Obj} player - pass in data to fill the player card. An example is shown below:
 * playerData = {
        image: RonaldoImage,
        name: "CRISTIANO RONALDO",
        teamLogo: TeamLogo,
        team: "AL-NASSR",
        countryFlag: CountryFlag,
        country: "Portugal",
        rating: "90",
        position: "STRIKER",
        PAC: "90",
        SHO: "90",
        PAS: "90",
        DRI: "90",
        DEF: "90",
        PHY: "90",
      };
 * @returns - A jsx object with the player card.
 */
const getPositionColor = (position) => {
  const normalizedPosition = position.toUpperCase();

  const defaultColor = 'black';
  if (normalizedPosition.includes('GOALKEEPER')) {
    return 'green';
  } else if (normalizedPosition.includes('DEFENDER')) {
    return 'red';
  } else if (normalizedPosition.includes('MIDFIELDER')) {
    return 'yellow';
  } else if (normalizedPosition.includes('FORWARD')) {
    return 'blue';
  } else if (normalizedPosition.includes('BACK')) {
    return 'purple';
  } else if (normalizedPosition.includes('WING')) {
    return 'orange';
  } else {
    return defaultColor;
  }
};

const PlayerCard = ({ player }) => {
  const color = getPositionColor(player.position);
  const cardStyle = {
    borderWidth: '3px',
    borderColor: color,
    borderStyle: 'solid'
  };
  useEffect(()=>{console.log(player)}, [player])
  return (
    <div className="player-card" style={cardStyle}>
      <div className="player-header">
        <div className="w-60 h-60">
          <img src={player.image_url} alt={player.name + ' image.'} className="player-img" />
        </div>
        <div className="player-badges">
          <img src={player.teamBadge_URL} alt={player.teamId + ' country ID'} className="badge" />
          <img
            src={player.citizenship.flag}
            alt={player.citizenship.name + ' flag.'}
            className="badge"
          />
          <div className="player-rating">
            {player.ovrall === 'N/A' ? 75 : parseInt(player.ovrall)}
          </div>
        </div>
      </div>
      <div className="black-divider"></div>
      <div className="player-info">
        <div className="player-name">{player.name}</div>
        <div className="player-container">
          <div className="player-data-left">
            <div>
              <h3>{player.playmaking === 'N/A' ? 75 : player.playmaking}</h3>
              <span>PLM</span>
            </div>
            <div>
              <h3>{player.shooting === 'N/A' ? 75 : player.shooting}</h3>
              <span>SHO</span>
            </div>
            <div>
              <h3>{player.passing === 'N/A' ? 75 : player.passing}</h3>
              <span>PAS</span>
            </div>
          </div>
          <div className="player-data-right">
            <div>
              <h3>{player.dribbling === 'N/A' ? 75 : player.dribbling}</h3>
              <span>DRI</span>
            </div>
            <div>
              <h3>{player.defending === 'N/A' ? 75 : player.defending}</h3>
              <span>DEF</span>
            </div>
            <div>
              <h3>{player.physicality === 'N/A' ? 75 : player.physicality}</h3>
              <span>PHY</span>
            </div>
          </div>
        </div>
        <div className="player-position">{player.position.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default PlayerCard;
