import { useMemo } from 'react';

import { type IconType } from '../../common/Icons';

type NavLink = {
  title: string;
  to: `/${string}`;
};

/**
 * A list of nav links that are displayed in the navbar.
 */
const defaultNavLinks: NavLink[] = [
  {
    title: 'Home',
    to: '/Home'
  },
  {
    title: 'Stadiums',
    to: '/stadium'
  },
  {
    title: 'Players',
    to: '/TeamHub'
  },
  {
    title: 'Careers',
    to: '/group32'
  }
];

/**
 * A react hook for providing the nav links to the navbar.
 * @returns
 */
export const useNavLinks = () => {
  return useMemo(() => {
    // memoizes the nav links so that they are not re-rendered on every render.
    return defaultNavLinks;
  }, []);
};
