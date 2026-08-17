'use client';

import React from 'react';
import { Global, css } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material';

export default function ThemeProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const poppinsUrl =
    'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
  const robotoUrl =
    'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap';

  const fontFamArray = ['Poppins', 'Roboto', 'sans-serif'];
  const fontFamily = fontFamArray.join(', ');

  return (
    <ThemeProvider theme={createTheme()}>
      <Global
        styles={css`
          @import url(${poppinsUrl});
          @import url(${robotoUrl});

          html {
            font-size: 100%;
            font-family: ${fontFamily};
          }

          body {
            font-family: ${fontFamily};
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}
