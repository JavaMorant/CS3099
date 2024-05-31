import { useQuery } from '@tanstack/react-query';
import { getNodeInfo, getPlayerInfo, getClubInfo, getClubs, getLeagues, getCountries, getClubname  } from '../services/node';

/**
 * A hook responsible for fetching club data.
 * @param {string} clubName The name of the club to fetch data for.
 * @param {boolean} autoFetch Whether to automatically fetch the data when used.
 * @returns The query object containing the club data, loading state, and error state.
 */
export const useNodeInfo = (clubID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['node', clubID], // Query key now includes the club name for unique identification
    () => getNodeInfo(clubID), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};

export const usePlayerInfo = (playerID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['player', playerID], // Query key now includes the club name for unique identification
    () => getPlayerInfo(playerID), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};

export const useClubInfo = (clubID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['club', clubID], // Query key now includes the club name for unique identification
    () => getClubInfo(clubID), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};

export const useClubname = (clubID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['clubname', clubID], // Query key now includes the club name for unique identification
    () => getClubname(clubID), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};

export const useClubs = (leagueID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['clubs', leagueID], // Query key now includes the club name for unique identification
    () => getClubs(leagueID), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};

export const useLeagues = (countryID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['leagues', countryID], // Query key now includes the club name for unique identification
    () => getLeagues(countryID), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};

export const useCountries = (ID: string, autoFetch: boolean = true) => {
  return useQuery(
    ['countries', ID], // Query key now includes the club name for unique identification
    () => getCountries(), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};