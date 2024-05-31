import { components } from '../../../generated/schema';
import { api } from '../../api';

type TeamsResponse = components['schemas']['TeamsResponseGroup33']; // Represents the response object for a list of teams.
type PlayersResponse = components['schemas']['PlayerResponse']; // Represents the response object for a list of players.
type TeamWithPlayers = components['schemas']['TeamWithPlayers']; // Represents the response object for a team with a list of players.
type PlayerGroup33 = components['schemas']['PlayerGroup33']; // Represents the response object for a player.
type PlayerGroup33_extra = components['schemas']['PlayerGroup33_extra'];

/**
 * Retrieves a list of teams from the server.
 * @returns A Promise that resolves to a TeamsResponse object.
 */
export const getTeams = async () => {
  const data = await api.get(`/api/teams`).json<TeamsResponse>();
  return data;
};

/**
 * Retrieves the players of a given team from the server.
 * @param team_id - The ID of the team to retrieve players for.
 * @returns A Promise that resolves to the PlayersResponse object containing the players of the team.
 */
export const getTeamsPlayers = async (team_id: string) => {
  const data = await api.get(`/api/players/${team_id}`).json<PlayersResponse>();
  return data;
};

/**
 * Retrieves a team with its players from the server.
 * @param team_id - The ID of the team to retrieve.
 * @returns A Promise that resolves to a TeamWithPlayers object.
 */
export const getTeamsWithPlayers = async (team_id: string) => {
  const data = await api.get(`/api/teams_with_players/${team_id}`).json<TeamWithPlayers>();
  return data;
};

/**
 * Extracts a single player from the server.
 * @param player_id - The ID of the player to retrieve.
 * @returns A Promise that resolves to a PlayerGroup33 object.
 */
export const getPlayerByID = async (player_id: string) => {
  const data = await api.get(`/api/player/${player_id}`).json<PlayerGroup33>();
  return data;
};

/**
 * Extracts extra information about a single player from the server.
 * @param player_id - The ID of the player to retrieve.
 * @returns A Promise that resolves to a PlayerGroup33_extra object.
 */
export const getExtraInfo = async (player_id: string) => {
  const data = await api.get(`/api/player/extra/${player_id}`).json<PlayerGroup33_extra>();
  return data;
};
