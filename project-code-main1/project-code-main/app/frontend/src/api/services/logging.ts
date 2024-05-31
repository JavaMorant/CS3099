import type { components } from '../../../generated/schema';
import { api } from '../api';

export type ErrorLog = components['schemas']['ErrorLog'];

/**
 * Log a message
 * @param error - the error to log
 * @param info - additional info to log
 * @returns void
 */
export const logError = async (error: Error, info?: { componentStack: string }) => {
  const body = {
    component_stack: info?.componentStack,
    error: error.message
  } as ErrorLog;
  const data = await api.post(`/api/logging`, { json: body }).json<void>();
  return data;
};
