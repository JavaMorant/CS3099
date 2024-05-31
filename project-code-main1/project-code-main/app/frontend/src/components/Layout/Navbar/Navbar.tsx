import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link as RouterLink } from 'react-router-dom';
import './Navbar.css';

import { Icon } from '../../common/Icons';
import { NavbarTitle } from '../NavbarTitle';
import { NavbarLink } from './NavbarLink';
import { useNavLinks } from './useNavLinks';
import { useDarkMode } from '../../../context/DarkModeContext';
import './Navbar.css';

import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';

import { useState } from 'react';
// import { Menu, Transition } from '@headlessui/react';

import logo from '../../../assets/images/01-foundation-black-text.png';

const APP_TITLE = 'Sports';

/**
 * A Navbar component that renders the navigation bar common to all pages in the project.
 */
export const Navbar = () => {
  // list of links to render in the navbar
  const navLinks = useNavLinks();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div
      className="w-full bg-white nav-container"
      style={{ boxShadow: 'inset 0px 0px 2px rgba(0, 0, 0, 0.1)', marginBottom: 2 }}>
      <nav className=" mx-10 lg:mx-16 flex h-20 gap-14">
        {/* Group name and Logo */}
        <div className="flex max-lg:justify-between lg:gap-14 items-center w-full">
          <NavbarTitle>
            {/* Redirects to the home page */}
            <div className="flex gap-5">
              <Icon name="Logo" className="h-12" />
            </div>
          </NavbarTitle>

          {/* Links to other pages from the navLinks lists */}
          {
            <div>
              <div className="lg:hidden">
                <Button aria-describedby={id} variant="contained" onClick={handleClick}>
                  <MenuIcon />
                </Button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                  }}>
                  <div className="items-center">
                    <NavigationMenu.Root className="flex items-center">
                      <NavigationMenu.List className="flex flex-col list-none gap-4">
                        {navLinks.map(({ title, to }) => (
                          <NavigationMenu.Item key={to} className="flex">
                            <NavbarLink text={title} to={to} />
                          </NavigationMenu.Item>
                        ))}
                      </NavigationMenu.List>
                    </NavigationMenu.Root>
                  </div>
                  {/* <List>
                    {navLinks.map(({ title, to, icon }) => (
                      <ListItem button key={to} component={RouterLink} to={to}>
                        <ListItemText primary={title} />
                      </ListItem>
                    ))}
                  </List> */}
                </Popover>
              </div>

              <div className="hidden lg:flex items-center">
                <NavigationMenu.Root className="flex items-center">
                  <NavigationMenu.List className="flex list-none gap-2.5">
                    {navLinks.map(({ title, to, icon }) => (
                      <NavigationMenu.Item key={to} className="flex">
                        <NavbarLink text={title} icon={icon} to={to} />
                      </NavigationMenu.Item>
                    ))}
                  </NavigationMenu.List>
                </NavigationMenu.Root>
              </div>
            </div>
          }
        </div>

        <div className="lg:flex gap-5 items-center hidden w-[370px] justify-end">
          {/* University of St Andrews logo */}
          <div className="m-2 w-fit">
            <img src={logo} className="h-20" alt="st-andrews logo" />
          </div>
        </div>
      </nav>
    </div>
  );
};
