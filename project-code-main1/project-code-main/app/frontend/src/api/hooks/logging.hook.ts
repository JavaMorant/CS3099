import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { logError } from '../services/logging';

export const loggingQueryKey = () => ['logging'] as const;

/**
 * Makes a request to log an error via the logError api service method
 * @returns void
 */
export const useLogError = () => {
  return useMutation<void, Error, { error: Error; info?: { componentStack: string } }>(
    async (variables) => {
      await logError(variables.error, variables.info);
    },
    {
      useErrorBoundary: true
    }
  );
};
