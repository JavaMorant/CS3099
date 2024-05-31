import { useQuery, useMutation } from '@tanstack/react-query';
import { StadiumFilter, getStadiums } from '../services/stadiums';
import { LeagueFilter, getLeagues } from '../services/stadiums';
import { postStadiums, StadiumFormData } from '../services/stadiums';

/**
 * Makes a request to get the stadiums via the getStadiums api service method
 * @returns the stadiums
 */
export const useStadiums = (queryParams?: StadiumFilter) => {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: () => getStadiums(queryParams),
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });
};

/**
 * Makes a request to get the leagues via the getLeagues api service method
 * @returns the leagues
 */
export const useLeagues = (queryParams?: LeagueFilter) => {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: () => getLeagues(queryParams),
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });
};

/**
 * Makes a post request to add stadiums
 * @returns void
 */
export const usePostStadiums = () => {
  return useMutation({
    mutationFn: (formData : StadiumFormData) => postStadiums(formData)
  });
};
