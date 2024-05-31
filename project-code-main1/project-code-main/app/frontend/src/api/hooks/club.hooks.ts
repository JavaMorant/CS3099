import { useQuery } from '@tanstack/react-query';
import { getClub } from '../services/club';

/**
 * A hook responsible for fetching club data.
 * @param {string} clubName The name of the club to fetch data for.
 * @param {boolean} autoFetch Whether to automatically fetch the data when used.
 * @returns The query object containing the club data, loading state, and error state.
 */
export const useClub = (clubName: string, autoFetch: boolean = true) => {
  return useQuery(
    ['club', clubName], // Query key now includes the club name for unique identification
    () => getClub(clubName), // Pass the club name to the getClub service
    {
      refetchOnWindowFocus: false, 
      enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
    }
  );
};
