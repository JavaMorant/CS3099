import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { debounce } from 'lodash';

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import config from './config';
import { useStadiums } from '../../api/hooks/stadium.hook';
import { useLeagues } from '../../api/hooks/stadium.hook';
import { useCountries } from '../../api/hooks/country.hooks';
import { Stadium } from '../../api/services/stadiums';
import './StadiumMap.css';

import MapFilteringDiv from './MapFilteringDiv';
import LoadingPage from './LoadingPage';
import StadiumMarkers from './StadiumMarkers';
import StadiumTable from './StadiumTable';
import OpeningYearSlider from './OpeningYear';

import { AppContext } from '../../pages/group34_pages/stadium/AppContext';
import Dropdown from './Dropdown';

type Option = {
  label: string;
  value: string;
};

// Main component for displaying the stadium map
const StadiumMap = () => {
  const [minCapacity, setMinCapacity] = useState(1);
  const [cachedMinCapacity, setCachedMinCapacity] = useState(1);
  const [cachedMaxCapacity, setCachedMaxCapacity] = useState(150000);
  const [cachedCountries, setCachedCountries] = useState<string[]>([]);
  const [maxCapacity, setMaxCapacity] = useState(150000);
  const [selectedLeague, setSelectedLeague] = useState<Option[]>([]);
  const [openingYear, setOpeningYear] = useState(config.currentYear);
  const [selectedCountry, setSelectedCountry] = useState<Option[]>([
    { label: 'United Kingdom', value: 'United Kingdom' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { highCont } = useContext(AppContext);
  const { screenRead } = useContext(AppContext);

  // Function returns selected country names in string array
  const getSelectedCountryValues = (): string[] => selectedCountry.map((option) => option.value);

  // Get stadium data with parameters
  const { isFetching, isError, refetch, data, error } = useStadiums({
    'min-capacity': minCapacity,
    'max-capacity': maxCapacity,
    countries: getSelectedCountryValues()
  });
  const stadiums: Stadium[] = useMemo(() => data?.stadiums || [], [data]);
  const [filteredStadiums, setFilteredStadiums] = useState<Stadium[]>(stadiums);

  // Get league data of selected countries
  const { data: leagueData, refetch: refetchLeagueData } = useLeagues({
    countries: getSelectedCountryValues()
  });

  // Map League data to Options array if successful, else log error
  const optionsLeague: Option[] = useMemo(() => {
    if (leagueData && 'error' in leagueData) {
      console.error(leagueData.error);
      return [] as Option[];
    }

    return (
      leagueData?.leagues.map((league) => ({
        label: league.league,
        value: league.league_id.toString()
      })) || []
    );
  }, [leagueData]);

  // select all leagues by default
  useEffect(() => {
    setSelectedLeague(optionsLeague);
  }, [optionsLeague]);

  // Map country data to Options array if successful, else log error
  const { data: countryData } = useCountries();
  const optionsCountry: Option[] = useMemo(() => {
    if (countryData && 'error' in countryData) {
      console.error(countryData.error);
      return [] as Option[];
    }

    return (
      countryData?.countries.map((country) => ({
        label: country,
        value: country
      })) || []
    );
  }, [countryData]);

  // Use the state updater function to ensure you are working with the latest state
  const changeSelectedLeague = (values: Array<{ value: string; label: string }>) => {
    setSelectedLeague(values);
  };
  const changeSelectedCountry = (values: Array<{ value: string; label: string }>) => {
    setSelectedCountry(values);
  };
  const handleMinCapacityChange = useCallback(
    debounce((newValue: number) => {
      setMinCapacity(newValue);
    }, 100),
    []
  );
  const handleMaxCapacityChange = useCallback(
    debounce((newValue: number) => {
      setMaxCapacity(newValue);
    }, 100),
    []
  );
  const changeOpeningYear = (newValue: number) => {
    setOpeningYear(newValue);
  };

  // Show loading page while filtering data after parameters change
  useEffect(() => {
    filterStadiums();
  }, [minCapacity, maxCapacity, selectedLeague, openingYear]);

  useEffect(() => {
    setFilteredStadiums(stadiums);
  }, [stadiums]);

  // refetch league data if selected country changes
  useEffect(() => {
    setIsLoading(true);
    refetchLeagueData().finally(() => setIsLoading(false));
  }, [selectedCountry]);

  // decide which map layer to use based on high contrast mode
  let attribution: string, url: string;
  if (highCont) {
    // high contrast map layer
    attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Tiles courtesy of Humanitarian OpenStreetMap Team';
    url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  } else {
    // Original map layer
    attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

  // Render the map with plotted stadium markers and Loading page if fetching/loading
  function renderMap() {
    if (isError) {
      throw error as Error;
    }
    return (
      <div>
        {(isFetching || isLoading) && <LoadingPage />}
        <TileLayer attribution={attribution} url={url} noWrap={true} />
        <StadiumMarkers stadiums={filteredStadiums} />
      </div>
    );
  }

  function filterStadiums() {
    setIsLoading(true);
    if (
      stadiums.length < 7000 &&
      cachedMinCapacity <= minCapacity &&
      cachedMaxCapacity >= maxCapacity &&
      selectedCountry.every((option) => cachedCountries.some((country) => option.value === country))
    ) {
      // filter on frontend
      let i = 0;
      const filtered: Stadium[] = [];
      const processBatch = () => {
        const start = Date.now();
        while (i < stadiums.length && Date.now() - start < 50) {
          const stadium = stadiums[i];
          if (
            stadium.capacity >= minCapacity &&
            stadium.capacity <= maxCapacity &&
            stadium.year <= openingYear &&
            selectedLeague.some((league) => stadium.league_id === league.value)
          ) {
            filtered.push(stadium);
          }
          i++;
        }
        if (i < stadiums.length) {
          // If not done, schedule next batch
          requestAnimationFrame(processBatch);
        } else {
          // If done, update state
          setFilteredStadiums(filtered);
          setIsLoading(false);
        }
      };
      requestAnimationFrame(processBatch);
    } else {
      // cannot filter on frontend - get filtered data from server
      refetch().finally(() => setIsLoading(false));
      setCachedMinCapacity(minCapacity);
      setCachedMaxCapacity(maxCapacity);
      setCachedCountries(getSelectedCountryValues());
    }
  }

  // constants extracted from config file
  const { mapCenter, defaultZoom, edgeOfMap, minZoom } = config;

  // Render the populated map with dropdown meny, filtering div, and opening year slider
  return (
    <div className="h-full">
      <Dropdown />
      <MapFilteringDiv
        changeSelectedLeague={changeSelectedLeague}
        changeSelectedCountry={changeSelectedCountry}
        changeMinCapacity={handleMinCapacityChange}
        changeMaxCapacity={handleMaxCapacityChange}
        selectedLeague={selectedLeague}
        optionsLeague={optionsLeague}
        optionsCountry={optionsCountry}
        selectedCountry={selectedCountry}
        refetch={refetch}
      />
      <OpeningYearSlider changeOpeningYear={changeOpeningYear} />

      {screenRead ? (
        <StadiumTable stadiums={filteredStadiums} />
      ) : (
        <MapContainer
          aria-label="Interactive Map of Stadiums"
          className="z-0"
          center={mapCenter}
          zoom={defaultZoom}
          maxBounds={edgeOfMap}
          minZoom={minZoom}
          zoomControl={false}>
          <ZoomControl position="topright" />
          {renderMap()}
        </MapContainer>
      )}
    </div>
  );
};

export default StadiumMap;
