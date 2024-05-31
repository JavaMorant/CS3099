import React from 'react';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Icon } from '../common/Icons';

// Main component for the loading display
const LoadingPage = () => {
  return (
    <div className="absolute opacity-70 z-[2000] w-full h-full"       
         aria-label="Loading page"
    >
      <div className="flex flex-col items-center justify-center h-full z-[2000] bg-gray-300 pt-28">
          <Stack
            direction="column"
            justifyContent="flex-end"
            alignItems="center">
            <Icon name="Mower" className="Mower-logo w-60 h-60" />
            <Typography variant="h2">The groundsperson is prepping the pitch.</Typography>
          </Stack>
      </div>
    </div>
  );
};

export default LoadingPage;
