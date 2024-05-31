import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getPlayerId, getTeamData, getPredictNextLeagues } from '../services/playerData';

export const testQueryKey = ['playerData'];

export const playerIDQueryKey = (playerName: string) => ['playerName', { playerName }] as const;  // a common query key to requests that use userId
export const playerCareerQueryKey = (playerName: string) => ['playerName', { playerName }] as const;  // a common query key to requests that use userId
export const playerPredictionsQueryKey = (playerName: string) => ['playerName', { playerName }] as const;
/**
 * A hook responsible for fetching test data. The hook is useful, because
 * it handles the loading and error states for you and is much more concise
 * than using the fetch, catch syntax.
 * @param {boolean} autoFetch Whether to automatically fetch the data when used.
 * @returns {Promise<any>} A promise that resolves to the test data.
 */

type PlayerData = {
    // Define the structure of the player data here
    player_id: string;
    // Add other properties as needed
  };

export const useGetPlayerId = (playerName: string): UseQueryResult<PlayerData>  => {
    return useQuery({
      queryKey: playerIDQueryKey(playerName),
      queryFn: () => getPlayerId(playerName),
      enabled: false,
      retry: 0,
    });
  };

export const useGetTeamData = (playerID: string)  => {
    return useQuery({
      queryKey: playerCareerQueryKey(playerID),
      queryFn: () => getTeamData(playerID),
      enabled: false,
      retry: 0,
    });
};

export const useGetNextLeagues = (playerName: string)  => {
  return useQuery({
    queryKey: playerPredictionsQueryKey(playerName),
    queryFn: () => getPredictNextLeagues(playerName),
    enabled: false,
    retry: 0,
  });
};

