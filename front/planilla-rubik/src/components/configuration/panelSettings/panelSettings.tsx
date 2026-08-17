"use client";
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import Credentials from "@/components/configuration/credentials/page";
import Columns from "@/components/configuration/CollaboratorSettings/Columns";
import ConfigureComponent from "@/components/configuration/desing/page";
import ConfigureTablesComponent from "@/components/configuration/tableconfigure/page";
import Record from "@/components/configuration/NotificationHistory/notificationHistory";
import { User } from "@/types/interface"; 

import PersonnelPage from "../CollaboratorSettings/Presonnel";

interface Section {
  title: string;
  options: { label: string; component?: React.FC }[]; 
}

const sections: Section[] = [
  {
    title: "Ajustes del panel",
    options: [
      { label: "Credenciales", component: Credentials },
      { label: "Diseño", component: ConfigureComponent },
      { label: "Tablas", component: ConfigureTablesComponent },
    ],
  },
  {
    title: "Notificaciones",
    options: [{ label: "Ajustes" }, { label: "Historial", component: Record }],
  },
  {
    title: "Colaboradores",
    options: [
      { label: "Columnas", component: Columns },
      { label: "Personal ", component: PersonnelPage },
    ],
  },
];

export default function ConfigurationPanel() {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedComponent, setSelectedComponent] = useState<React.FC | null>(
    null
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleOptionClick = (component?: React.FC) => {
    if (component) {
      setSelectedComponent(() => component);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          width: "250px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          p: 2,
          marginLeft: "55px",
          height: "100%",
        }}
      >
        {sections.map((section) => (
          <Box key={section.title} mb={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => toggleSection(section.title)}
            >
              <Typography variant="body1" fontWeight="bold" color="black">
                {section.title}
              </Typography>
              {expandedSections[section.title] ? (
                <ExpandLess sx={{ color: "black" }} />
              ) : (
                <ExpandMore sx={{ color: "black" }} />
              )}
            </Box>
            {expandedSections[section.title] && (
              <Box mt={1}>
                {section.options.map((option) => (
                  <Typography
                    key={option.label}
                    variant="body2"
                    sx={{
                      color:
                        selectedComponent === option.component
                          ? "blue"
                          : "black",
                      fontWeight:
                        selectedComponent === option.component
                          ? "bold"
                          : "normal",
                      cursor: "pointer",
                      py: 0.5,
                    }}
                    onClick={() => handleOptionClick(option.component)}
                  >
                    {option.label}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          flex: 1,
          paddingLeft: "40px",
          height: "100%",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {selectedComponent && React.createElement(selectedComponent)}
      </Box>
    </Box>
  );
};

