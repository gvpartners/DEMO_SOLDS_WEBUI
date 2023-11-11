import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const Logo = () => {
  const theme = useTheme();
  const fillColor = theme.palette.primary.main;

  return (
    <Box>
      <img src="/assets/avatars/logo.png" alt="Logo" style={{ width: '100px', height: 'auto', fill: fillColor }} />
    </Box>
  );
};
