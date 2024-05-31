import type { components, operations } from '../../../generated/schema';
import { api } from '../api';

export type Countries = components['schemas']['Countries'];
export type Country = components['schemas']['Country'];

/**
 * Get the list of countries
 * @returns the list of countries
 */
export const getCountries = async () => {
  try {
    const data = await api.get('/api/countries').json<Countries>();
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};
