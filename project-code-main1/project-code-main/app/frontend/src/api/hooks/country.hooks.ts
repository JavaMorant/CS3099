import { useQuery } from '@tanstack/react-query';
import { getCountries } from '../services/country';

/**
 * Makes a request to get the countries via the getCountries api service method
 * @returns the countries
 */
export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });
};
