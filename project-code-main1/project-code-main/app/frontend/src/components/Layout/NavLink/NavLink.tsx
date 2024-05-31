import {
  NavLink as ReactRouterNavLink,
  NavLinkProps as ReactRouterNavLinkProps
} from 'react-router-dom';

type Props = ReactRouterNavLinkProps;

/**
 * A NavLink component that renders a link in the navbar.
 * @param props - generic ReactRouterNavLinkProps providing things like `to`, `className`, `children`, etc.
 */
export const NavLink = (props: Props) => {
  return <ReactRouterNavLink {...props} />;
};
