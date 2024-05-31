import { api } from '../api'; 

type ClubResponseType = any;

export const getClub = async (clubName: string = 'Tottenham'): Promise<ClubResponseType> => {
  const response = await api.get(`/api/club/${clubName}`).json();
  return response;
};
