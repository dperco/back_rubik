"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar/pages";
import EditEmploye from "@/components/components-collaborators/EditEmploye/EditEmploye";
import { Box } from "@mui/material";
export default function EditClientViewEmploye({colab, users, project , tech}: any) {

  console.log("colab", colab);
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditEmploye usersProp={users} colabId={colab.collaborator} projectProp={project} techProp={tech.data} />
      </Box>
    </>
  );
}
