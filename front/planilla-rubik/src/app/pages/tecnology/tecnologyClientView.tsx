"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import TechnologyBarChart from "@/components/component-tecnology/Chart-tecnology/page";
import { Box } from "@mui/material";
export default function TecnologyPageClientView({tecnology}:any) {
  return (
    <div className="min-h-screen w-full">
      <Box sx={{ mb: 1 }}>
        <Navbar />
      </Box>
      <Box
        sx={{ mb: 2, fontSize: "1.25rem", color: "#000", marginLeft: "60px" }}
      >
        Tecnologías
      </Box>

      <Box>
        <TechnologyBarChart tecnologyProp={tecnology} />
      </Box>
    </div>
  );
}
