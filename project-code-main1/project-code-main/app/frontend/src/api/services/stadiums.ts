import type { components, operations } from '../../../generated/schema';
import { api } from '../api';

export type Stadiums = components['schemas']['Stadiums'];
export type Stadium = components['schemas']['Stadium'];
export type StadiumFilter = operations['get_stadiums_api_stadiums_get']['parameters']['query'];
export type Leagues = components['schemas']['Leagues'];
export type League = components['schemas']['League'];
export type LeagueFilter = operations['get_leagues_api_leagues_get']['parameters']['query'];
export type StadiumFormData = operations['insert_stadiums_api_stadiums_post']['requestBody']['content']['application/json'];

/**
 * Get the list of stadiums
 * @returns the list of stadiums
 */
export const getStadiums = async (queryParams?: StadiumFilter) => {
  let sanitizedQueryParams = new URLSearchParams();
  if (queryParams?.['min-capacity']) {
    sanitizedQueryParams.append('min-capacity', queryParams['min-capacity'].toString());
  }
  if (queryParams?.['max-capacity']) {
    sanitizedQueryParams.append('max-capacity', queryParams['max-capacity'].toString());
  }
  if (queryParams?.countries && queryParams.countries.length > 0) {
    queryParams.countries.forEach((country) => {
      sanitizedQueryParams.append('countries', country);
    });
  }

  try {
    const data = await api
      .get(`/api/stadiums`, { searchParams: sanitizedQueryParams })
      .json<Stadiums>();
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Get the list of leagues
 * @returns the list of leagues
 */
export const getLeagues = async (queryParams?: LeagueFilter) => {
  let sanitizedQueryParams = new URLSearchParams();
  if (queryParams?.countries && queryParams.countries.length > 0) {
    queryParams.countries.forEach((country) => {
      sanitizedQueryParams.append('countries', country);
    });
  }

  try {
    const data = await api
      .get(`/api/leagues`, { searchParams: sanitizedQueryParams })
      .json<Leagues>();
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Post a form to add stadium
 * @returns void
 */
export const postStadiums = async (body: StadiumFormData) => {
  try {
    const data = await api.post(`/api/stadiums`, { json: body }).json<void>();
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};
