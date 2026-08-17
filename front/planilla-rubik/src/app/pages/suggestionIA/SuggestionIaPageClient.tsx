"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar/pages";

import { Box, Button, Typography } from "@mui/material";
import { ProjectInfo } from "../../../components/NewProject-Suggestion/types";
import ProjectHeader from "../../../components/NewProject-Suggestion/ProjectHeader";
import RoleSection from "../../../components/NewProject-Suggestion/RoleSection";
import VacancyList from "../../../components/NewProject-Suggestion/VacancyList";

import { mockProject } from "./projectMock";

export default function SuggestionIaPageClient() {
  const [project, setProject] = useState<ProjectInfo>(mockProject);

  const deleteVacancy = (id: string) => {
    console.log(`Vacante con ID ${id} eliminada`);
  };
  const createVacancy = (roleId: string) => {
    console.log(`Crear vacante para el rol con ID ${roleId}`);
  };
  const selectCandidate = (roleId: string, candId: string) => {
    setProject((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => {
        if (r.id !== roleId) return r;

        const wasSelected = r.candidates.find((c) => c.id === candId)?.selected;

        return {
          ...r,
          candidates: r.candidates.map((c) => ({
            ...c,
            selected: wasSelected ? false : c.id === candId,
          })),
        };
      }),
    }));
  };

  const handleCreateProject = () => {
    const resume = {
      generalInfo: {
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
      },

      roles: project.roles.map((r) => {
        const selected = r.candidates.find((c) => c.selected);
        return {
          roleId: r.id,
          roleName: r.name,
          candidate: selected ?? null,
        };
      }),
      vacancies: project.vacancies,
    };

    console.log("Resumen del proyecto =>", JSON.stringify(resume, null, 2));
  };
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F8F8F8" }}>
      <Box sx={{ mb: 3 }}>
        <Navbar />
      </Box>
      <Box
        sx={{
          mr: "55px",
          ml: "55px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "20px",
        }}
      >
        {/* datos del proyecto */}
        <ProjectHeader project={project} />

        {/* roles */}
        {project.roles.map((role) => (
          <RoleSection
            key={role.id}
            role={role}
            onSelect={selectCandidate}
            onCreateVacancy={createVacancy}
          />
        ))}

        {/* vacantes */}
        <VacancyList vacancies={project.vacancies} onDelete={deleteVacancy} />

        <Box textAlign="right" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateProject}
            sx={{
              backgroundColor: "#002338",
              borderRadius: "8px",
              width: "200px",
              height: "50px",
              textTransform: "none",
            }}
          >
            <Typography
              sx={{
                borderRadius: "10px",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: "#23FFDC",
              }}
            >
              Crear proyecto
            </Typography>
          </Button>
        </Box>
      </Box>
    </div>
  );
}
