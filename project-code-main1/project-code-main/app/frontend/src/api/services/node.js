import { api } from '../api'; 


export const getNodeInfo = async (clubID) => {
  const response = await api.get(`/api/node_data/?id=${clubID}`).json();
  return response.players;
};

export const getPlayerInfo = async (playerID) => {
  const response = await api.get(`/api/node_player/?id=${playerID}`).json();
  return response.player;
};

export const getClubInfo = async (clubID) => {
  const response = await api.get(`/api/club/?id=${clubID}`).json();
  return response.club;
};

export const getClubname = async (clubID) => {
  const response = await api.get(`/api/clubname/?id=${clubID}`).json();
  return response.clubname;
};

export const getClubs = async (leagueID) => {
  const response = await api.get(`/api/clubs/?id=${leagueID}`).json();
  return response.clubs;
};

export const getLeagues = async (countryID) => {
  const response = await api.get(`/api/leagues/?id=${countryID}`).json();
  return response.leagues;
};

export const getCountries = async () => {
  const response = await api.get(`/api/countries/`).json();
  return response.countries;
};