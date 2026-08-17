import { Suspense } from 'react'
import React from 'react';
import Register from "@/components/register/page"
import { Box } from '@mui/material';
export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={<div>Loading...</div>}>
      <Box>
        <Register />
      </Box>
      </Suspense>
    </div>
  );
}