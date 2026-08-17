"use client";
import React from "react";
import { Grid2 } from "@mui/material";
import Navbar from "@/components/navbar/pages";
import DashboardCard from "@/components/component-dashboard/CardDashboard/CardDashboard";

export default function DashboardClientView({
  projects,
  collaborator,
  vacancie,
}: any) {
  return (
    
    <Grid2
      container
      spacing={2}
      sx={{ marginBottom: "20px" }}
      id={"GRIDCONTAINER"}
    >
      <Navbar />

      <DashboardCard
        projectsProp={projects}
        collaboratorProp={collaborator}
        vacanciesProp={vacancie}
      />
    </Grid2>
    
  );
}
