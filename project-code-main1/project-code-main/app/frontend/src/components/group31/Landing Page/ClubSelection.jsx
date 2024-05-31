import React, { useEffect, useState } from 'react';
import './ClubSelection.css';
import { useCountries, useLeagues, useClubs } from '../../../api/hooks/node.hooks'; // Adjust the import path as necessary
import logotype from '../../../assets/branding/logotype-alt.svg';
import { Icon } from '../../common/Icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ClubSelection = () => {
  // Fetch countries data
  const { data: countries = [], fetchStatus, error } = useCountries("", true);

  const [selectedCountryID, setSelectedCountryID] = useState('Q142');
  const navigate = useNavigate();

  // Fetch leagues based on the selected country
  const { data: leagues = [], isSuccess: leaguesLoaded } = useLeagues(selectedCountryID);
  useEffect(() => {
    if (leaguesLoaded && leagues.length > 0) {
      setSelectedLeagueID(leagues[0][0]); // Automatically select the first league for the new country
      setSelectedClub(''); // Reset club selection
    }
  }, [leagues, selectedCountryID]);

  const [selectedLeagueID, setSelectedLeagueID] = useState('Q13394');

  // Fetch clubs based on the selected league
  const { data: clubs = [], isSuccess: clubsLoaded } = useClubs(selectedLeagueID);
  useEffect(() => {
    if (clubsLoaded && clubs.length > 0) {
      setSelectedClub(clubs[0][0]); // Automatically select the first club for the new league
    }
  }, [clubs, selectedLeagueID]);

  const [selectedClub, setSelectedClub] = useState('Q704');

  // Handlers for selecting country, league, and club
  const handleSelectCountry = (direction) => {
    const currentIndex = countries.findIndex(country => country[0] === selectedCountryID);
    const nextIndex = (currentIndex + direction + countries.length) % countries.length;
    setSelectedCountryID(countries[nextIndex][0]);
  };

  const handleSelectLeague = (direction) => {
    const currentIndex = leagues.findIndex(league => league[0] === selectedLeagueID);
    const nextIndex = (currentIndex + direction + leagues.length) % leagues.length;
    setSelectedLeagueID(leagues[nextIndex][0]);
  };

  const handleSelectClub = (direction) => {
    const currentIndex = clubs.findIndex(club => club[0] === selectedClub);
    const nextIndex = (currentIndex + direction + clubs.length) % clubs.length;
    setSelectedClub(clubs[nextIndex][0]);
  };

  const handleGo = () => {
    navigate('/NodeGraph', { state: { clubData: selectedClub } });
  }; 

  // const [isHighContrast, setIsHighContrast] = useState(false);

  // const toggleHighContrast = () => setIsHighContrast(!isHighContrast);

  const [leagueImageDimensions, setLeagueImageDimensions] = useState({ width: 0, height: 0 });
  const handleLeagueImageLoad = (event) => {
    const { width, height } = event.target;
    setLeagueImageDimensions({ width, height });
  };


  const [isHighContrast, setIsHighContrast] = useState(() => document.body.classList.contains('high-contrast'));

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast', !isHighContrast);
    localStorage.setItem('highContrastEnabled', !isHighContrast);
  };

  useEffect(() => {
    const highContrastEnabled = localStorage.getItem('highContrastEnabled') === 'true';
    setIsHighContrast(highContrastEnabled);
    document.body.classList.toggle('high-contrast', highContrastEnabled);
  }, []);

  return (
    <div className="club-selection-container">
      <div className="clublink-banner animate-slide-in">
        <img src={logotype} className="clublink-logo" alt="Logo" />
      </div>
      <div className="club-selection-box">
        <div className="club-info">
          <div className="high-contrast-toggle">
            <label className="toggle-label">
              High Contrast
              <input
                type="checkbox"
                onChange={toggleHighContrast}
                checked={document.body.classList.contains('high-contrast')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="selection-box country-info">
            <button onClick={() => handleSelectCountry(-1)}>&lt;</button>
            <div>
              <img
                src={countries.find(country => country[0] === selectedCountryID)?.[2]}
                alt={countries.find(country => country[0] === selectedCountryID)?.[1]}
                className="icon country-flag"
              />
              <span className="country-name">{countries.find(country => country[0] === selectedCountryID)?.[1]}</span>
            </div>
            <button onClick={() => handleSelectCountry(1)}>&gt;</button>
          </div>

          <div className="selection-box league-info">
            <button onClick={() => handleSelectLeague(-1)}>&lt;</button>
            <div>
              <img
                src={leagues.find(league => league[0] === selectedLeagueID)?.[2]}
                alt=""
                className="icon league-crest"
                onLoad={handleLeagueImageLoad}
              />
              {leagueImageDimensions.width <= 2*leagueImageDimensions.height && (
                <span className="league-name">
                  {leagues.find(league => league[0] === selectedLeagueID)?.[1]}
                </span>
              )}
            </div>
            <button onClick={() => handleSelectLeague(1)}>&gt;</button>
          </div>

          <div className="selection-box club-container">
            <button onClick={() => handleSelectClub(-1)}>&lt;</button>
            <div className='club-info'>
              <img
                src={clubs.find(club => club[0] === selectedClub)?.[2]}
                alt={clubs.find(club => club[0] === selectedClub)?.[1]}
                className="icon country-flag"
              />
              <span className="league-name">{clubs.find(club => club[0] === selectedClub)?.[1]}</span>
            </div>
            <button onClick={() => handleSelectClub(1)}>&gt;</button>
          </div>

        </div>
        <p className="club-selection-text">Select your club,<br />get started.</p>
      </div>
      <div className="third-section">
        <div className="remainder-content">
          <p>Select your Club Select your Club Select your Club Select your Club
            Select your Club Select your Club Select your Club Select your Club
            Select your Club Select your Club Select your Club Select your Club
            Select your Club Select your Club Select your Club Select your Club</p>
        </div>
        <button className="square-box-button" onClick={handleGo}>
          <Icon name="Arrow" className="arrow" />
        </button>
      </div>
    </div>
  );
};

export default ClubSelection;
