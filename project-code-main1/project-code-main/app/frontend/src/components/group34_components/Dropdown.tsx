import React, { useState } from 'react';

import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Switch } from '@mui/material';
import { useContext } from 'react';
import { IconButton, Popover } from '@mui/material';

import { AppContext } from '../../pages/group34_pages/stadium/AppContext';


// Dropdown componenent that contains all the accessibility options
const Dropdown = () => {
  const { highCont, screenRead, handleHighCont, handleScreenRead } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // set element id for popover if its open
  const open = Boolean(anchorEl);
  const id = open ? 'accessibility-popover' : undefined;

  return (
    <div className="relative">
      <div
              

        // change the shade according to if the popover is open
        className={
          'hover:bg-gray-400 z-50 absolute top-0 right-0 m-4 flex justify-center mr-14 shadow-[0_0_4px_-1px_rgba(0,0,0,0.7)] rounded-xl '
          + (open ? ' bg-gray-400' : ' bg-gray-100')
        }>
        <IconButton aria-label="Open Accessibility Options" onClick={handleClick} sx={{ '&:hover': { bgcolor: 'transparent' } }}
        >
          <AccessibilityNewIcon 
          />
        </IconButton>
      </div>
      <Popover
        aria-label="Accessibility Options"
        anchorEl={anchorEl}
        id={id}
        title='Accessibility'
        sx={{ top: '3px' }}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <div
          id="dropDown-content"
          className="overflow-auto p-3 bg-gray-200 rounded-b-xl rounded-tl-xl">
          <FormGroup>
            <FormControlLabel
              aria-label="Set High Contrast"
              className="whitespace-nowrap"
              control={<Switch checked={highCont} />}
              label="High Contrast"
              onChange={handleHighCont}
            />
            <FormControlLabel
              aria-label="Set Screen Reader"
              className="whitespace-nowrap"
              control={<Switch checked={screenRead} />}
              label="Screen Reader"
              onChange={handleScreenRead}
            />
          </FormGroup>
        </div>
      </Popover>
    </div>
  );
};

export default Dropdown;
