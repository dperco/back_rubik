'use client';
import React, { useState } from 'react';
import Navbar from "@/components/navbar/pages";
import EmployeeTable from "@/components/components-collaborators/TableEmployes/TableEmployes";
import CardsEmployes from "@/components/components-collaborators/cards-employes/CardEmployes";
import SearchCardToggle from "@/components/SearchCard/pages";
import { Box } from '@mui/material';
export default function Home({ collaborators, columnsprop }: any) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box sx={{ mb: 2, fontSize: '1.25rem', color: "#000", marginLeft: "60px" }}>Colaboradores</Box>
      <Box sx={{ mb: 3 }}>
        <SearchCardToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          setSearchTerm={setSearchTerm}
          currentSection="colaboradores"
          onAddClick={() => { }}
        />
      </Box>
      <Box>
        {viewMode === 'cards' ?
          <CardsEmployes collaboratorProp={collaborators} searchTerm={searchTerm} /> : <EmployeeTable 
          collaboratorProp={collaborators} 
          searchTerm={searchTerm} 
          columnsprop={columnsprop} />}
      </Box>
    </>
  );
}