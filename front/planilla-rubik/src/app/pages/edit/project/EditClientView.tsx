"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar/pages";
import EditProject from "@/components/component-projects/EditProject/EditProject";
import { Box } from "@mui/material";
export default function EditClientViewProject({projects, users }: any) {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
      <Box>
        <EditProject usersProp={users} projectsId={projects.data} />
      </Box>
    </>
  );
}
