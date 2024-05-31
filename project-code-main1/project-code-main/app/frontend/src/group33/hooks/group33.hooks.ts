import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTeams,
  getTeamsPlayers,
  getTeamsWithPlayers,
  getPlayerByID,
  getExtraInfo
} from '../services/group33';
import { components } from '../../../generated/schema';

export const allTeamsQueryKey = ['teams'] as const;
export const allPlayersQueryKey = ['players'] as const;
export const playerQueryKey = ['player'] as const;
export const extraInfoQueryKey = ['extraInfo'] as const;

type TeamsResponse = components['schemas']['TeamsResponseGroup33'];
type PlayersResponse = components['schemas']['PlayerResponse'];
type TeamWithPlayers = components['schemas']['TeamWithPlayers']; // Represents the response object for a team with a list of players.
type PlayerGroup33 = components['schemas']['PlayerGroup33']; // Represents the response object for a player.
type PlayerGroup33_extra = components['schemas']['PlayerGroup33_extra'];

/**
 * Makes a request to get a team by name via the getTeamByName api service method
 * @param teamName - the name of the team to get
 * @returns the team with the given name and its players
 */
export const getTeamsList = () => {
  return useQuery<TeamsResponse>({
    queryKey: allTeamsQueryKey,
    queryFn: () => getTeams()
  });
};

/**
 * Returns a query object containing the list of players for a given team.
 * @param team_id - The ID of the team to get the players for.
 * @returns A query object containing the list of players for the given team.
 */
export const getTeamPlayers = (team_id: string) => {
  return useQuery<PlayersResponse>({
    queryKey: allPlayersQueryKey,
    queryFn: () => getTeamsPlayers(team_id),
    keepPreviousData: false
  });
};

/**
 * Returns a query object containing the team and its players.
 * @param team_id - The ID of the team to fetch.
 * @returns A query object containing the team and its players.
 */
export const getTeamWithPlayers = (team_id: string) => {
  return useQuery<TeamWithPlayers>({
    queryKey: allPlayersQueryKey,
    queryFn: () => getTeamsWithPlayers(team_id),
    keepPreviousData: false
  });
};

/**
 * Returns a query object containing a single player.
 * @param player_ID - The ID of the player to fetch.
 * @returns A query object containing a single player.
 */
export const getSinglePlayerByID = (player_ID: string) => {
  return useQuery<PlayerGroup33>({
    queryKey: playerQueryKey,
    queryFn: () => getPlayerByID(player_ID),
    keepPreviousData: false
  });
};

/**
//  * Returns a query object containing a single player.
//  * @param player_ID - The ID of the player to fetch.
//  * @returns A query object containing a single player.
//  */
// export const getSinglePlayerByID = (player_ID: string, autoFetch: boolean = true) => {
//   return useQuery(
//     ['playerById', player_ID],
//     () => getPlayerByID(player_ID),
//     {
//       refetchOnWindowFocus: false, 
//       enabled: autoFetch, // Control whether the query automatically runs based on the autoFetch flag
//     }
//   );
// };

/**
 * Returns a query object containing the extra information of a single player.
 * @param player_ID - The ID of the player to fetch extra information for.
 * @returns A query object containing the extra information of a single player.
 */
export const getExtraInfoPlayer = (player_ID: string) => {
  return useQuery<PlayerGroup33_extra>({
    queryKey: extraInfoQueryKey,
    queryFn: () => getExtraInfo(player_ID),
    keepPreviousData: false
  });
};
