import { Suspense } from 'react'
import React from 'react';
import Navbar from "@/components/navbar/pages";
import CardDetalleVacante from "@/components/component-vacancies/detail_vacancies/page";
import { Box } from '@mui/material';
export default function VacancieDetail() {
  
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={<div>Loading...</div>}>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>
      <Box sx={{ mb: 3 }}>
        <CardDetalleVacante />
      </Box>
      </Suspense>
    </div>
  );
}