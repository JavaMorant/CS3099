import ky from 'ky';

// allow to set the auth header from the environment variable, useful fo OAuth
const AuthHeader = import.meta.env.VITE_AUTH_HEADER;

/**
 * A wrapper around the ky library that sets the credentials to include
 * and sets the authorization header if it is set in the environment
 * variables.
 * Provides a more convenient way to make HTTP requests to the backend
 * without having to deal with authentication, fetch, etc.
 */
export const api = ky.create({
  credentials: 'include',
  timeout: 30 * 1000,
  hooks: {
    beforeRequest: [
      (req) => {
        if (AuthHeader === null || AuthHeader === undefined || AuthHeader === '') return;
        req.headers.set('Authorization', AuthHeader);
      }
    ]
  }
});
