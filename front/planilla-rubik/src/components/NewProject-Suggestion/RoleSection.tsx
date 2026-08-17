"use client";
import React from "react";
import { Box, Typography, Grid2, Card, Stack, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Role } from "./types";

interface Props {
  role: Role;
  onSelect: (roleId: string, candidateId: string) => void;
  onCreateVacancy: (roleName: string) => void;
}

export default function RoleSection({
  role,
  onSelect,
  onCreateVacancy,
}: Props) {
  
  /* sugerido primero por si el back no lo devuelve en orden */
  const candidates = [...role.candidates].sort(
    (a, b) => (b.suggested ? 1 : 0) - (a.suggested ? 1 : 0)
  );

  const hasSelection = candidates.some((c) => c.selected);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "18px",
          color: "#002338",
          mb: "10px",
        }}
      >
        Rol: {role.name}
      </Typography>

      <Grid2 container spacing={2}>
        {candidates.map((c) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={c.id}>
            <Card
              onClick={() => onSelect(role.id, c.id)}
              sx={{
                p: 2,
                width: "289px",
                height: "180px",
                cursor: "pointer",
                border: c.selected ? "2px solid #009ADA" : "1px solid #e0e0e0",
                bgcolor: "#F8F8F8",
                borderRadius: "10px",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                {c.selected ? (
                  <CheckBoxIcon
                    sx={{ color: "#009ADA", width: "24px", height: "24px" }}
                  />
                ) : (
                  <CheckBoxOutlineBlankIcon
                    color="disabled"
                    sx={{ width: "24px", height: "24px" }}
                  />
                )}
              </Stack>

              <Info label="Colaborador" value={c.name} />
              <Info label="Tecnología" value={c.technology} />
              <Info
                label=" Horas asignadas: "
                value={String(c.assignedHours)}
              />

              {c.suggested && (
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#0087FF",
                  }}
                  mt={"0.5px"}
                >
                  Candidato sugerido
                </Typography>
              )}
            </Card>
          </Grid2>
        ))}

        {/* tarjeta vacante */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            disabled={hasSelection}
            sx={{
              width: "289px",
              height: "180px",
              p: 2,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              border: "1px dashed",
              cursor: "pointer",
              textTransform: "none",
              borderRadius: "10px",
            }}
            id="create-vacancy"
            onClick={() => onCreateVacancy(role.name)}
          >
            <AddCircleOutlineIcon
              fontSize="large"
              sx={{ color: hasSelection ? "#CDCDCD" : "#006899" }}
            />

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                color: hasSelection ? "#CDCDCD" : "#006899",
              }}
            >
              Crear vacante
            </Typography>
          </Button>
        </Grid2>
      </Grid2>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" gap={1} mb={"0.5px"}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "16px",
          color: "#002338",
        }}
      >
        {label}:
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 300,
          fontSize: "16px",
          color: "#002338",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
