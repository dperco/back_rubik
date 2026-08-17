"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import Navbar from "@/components/navbar/pages";
import VacanciesTable from "@/components/component-vacancies/VacanciesTable/VacanciesTable";
import VacanciesCards from "@/components/component-vacancies/CardVacancie/CardVacancie";
import SearchCardToggle from "@/components/SearchCard/pages";
import CarouselVacancie from "@/components/component-vacancies/CarouselVacancies/CarouselVacancies";

export default function VacanciesPageClient({ vacancies }: any) {

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  return (
    <div className="min-h-screen w-full">
      <Box sx={{ mb: 1 }}>
        <Navbar />
      </Box>
      <Box
        sx={{ mb: 2, fontSize: "1.25rem", color: "#000", marginLeft: "60px" }}
      >
        Vacantes
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchCardToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          setSearchTerm={setSearchTerm}
          currentSection="vacante" 
          onAddClick={() => {
          }}
        />
      </Box>
      <Box >
        <CarouselVacancie vacanciesProp={vacancies} />
      </Box>
      <Box>
        {viewMode === "cards" ? (
          <VacanciesCards vacanciesProp={vacancies} searchTerm={searchTerm} />
        ) : ( 
          <VacanciesTable   vacanciesProp={vacancies} searchTerm={searchTerm} />
        )}
      </Box>
    </div>
  );
}
