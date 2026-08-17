"use client";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import {ProjectTable} from "@/components/component-projects/TableProjects/TableProjects";
import CardsProjets from "@/components/component-projects/CardProject/CardProject";
import SearchCardToggle from "@/components/SearchCard/pages";
import Navbar from "@/components/navbar/pages";

interface Props {
  viewMode: "cards" | "table";
  setViewMode: (mode: "cards" | "table") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function ProjectClientView({ projects, collaborators,projectId ,users }: any) {

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  return (
    <>
    <Box>
      <Navbar/>
    </Box>
      <Box
        sx={{ mb: 2, fontSize: "1.25rem", color: "#000", marginLeft: "60px" }}
      >
        Proyectos
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchCardToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          setSearchTerm={setSearchTerm}
          currentSection="proyecto"
          onAddClick={() => {}}
        />
      </Box>

      <Box>
        {viewMode === "cards" ? (
          <CardsProjets projectsProp={projects} collaboratorProp={collaborators} searchTerm={searchTerm} />
        ) : (
          <ProjectTable projectsProp={projects} collaboratorProp={collaborators}  searchTerm={searchTerm} usersProps={users}/>
        )}
      </Box>
    </>
  );
}
