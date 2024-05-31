import { api } from '../api'; // The api object provides a way to make HTTP requests to the backend without having to deal with authentication, etc.

/**
 * A service responsible for fetching test data.
 * @returns {Promise<any>} A promise that resolves to the test data.
 */
export const getTest = async () => {
  const response = await api.get('/api/playerdata').json();
  return response;
};

export const getPlayerId = async (playerName: string) => {
    const response = await api.get(`/api/playerData/${playerName}`).json();
    return response;
  };

export const getTeamData = async (playerId: string) => {
const response = await api.get(`/api/teamData/${playerId}`).json();
return response;
};

export const getPredictNextLeagues = async (playerName: string) => {
  const response = await api.get(`/api/fullPlayerPredictiveLeague/${playerName}`).json();
  return response;
};