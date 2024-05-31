import { cx } from 'class-variance-authority';
import { type To } from 'react-router-dom';

import { Icon, type IconType } from '../../common/Icons';
import { NavLink } from '../NavLink';

type NavLinkProps = {
  text: string;
  to: To;
  icon?: IconType;
};

/**
 * A NavbarLink component that renders a link in the navbar.
 * @param text - The text to display in the link.
 * @param to - The path to link to.
 * @param icon - The icon to display in the link (must be an icon from `/src/components/common/Icons/brandings.ts`)
 * @returns
 */
export const NavbarLink = ({ text, icon, to }: NavLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          'flex justify-center gap-2 rounded-xl p-3 transition',
          'text-sm font-bold',
          'hover:bg-black-100/90 hover:text-purple-500',
          isActive && 'bg-black-100 text-black-500'
        )
      }>
      {icon && <Icon name={icon} className="h-5 w-5" />}
      {text}
    </NavLink>
  );
};
