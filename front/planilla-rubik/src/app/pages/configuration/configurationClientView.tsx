"use client";
import React from "react";
import Navbar from "@/components/navbar/pages";
import ConfigurationPanel from "@/components/configuration/panelSettings/panelSettings";
import { Box } from "@mui/material";

export default function ConfigurationClientView() {
  return (
    <div className="min-h-screen w-full" style={{ marginBottom: "220px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
        }}
      >
        <Navbar />
      </Box>

      <ConfigurationPanel />
    </div>
  );
}
