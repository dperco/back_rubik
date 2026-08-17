"use client";
import { Box, Typography, Card, Stack, Grid2 } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AssignedPersons } from "@/types/interface";
import {removeAssignedPerson} from "@/services/api";

interface CollaboratorListProps {
  collaborator: AssignedPersons[];
  onDelete: (id: number) => void;
  taxonId: number;
}

export default function CollaboratorList({ collaborator, onDelete, taxonId }: CollaboratorListProps) {
  if (!collaborator.length) return null;

  // Agrupar por rol
  const colaboradoresPorRol: { [rol: string]: AssignedPersons[] } = {};
  collaborator.forEach((colab) => {
    if (!colaboradoresPorRol[colab.rol]) colaboradoresPorRol[colab.rol] = [];
    colaboradoresPorRol[colab.rol].push(colab);
  });

  const handleDelete = async (id: number) => {
    console.log("Eliminando colaborador con taxonId:", taxonId, "y id:", id);
    try {
      await removeAssignedPerson(taxonId, id);
      onDelete(id);
    } catch (error) {
      console.error("Error al eliminar colaborador:", error);
      alert("No se pudo eliminar el colaborador. Intenta nuevamente.");
    }
  };

  return (
    <Box>
      {Object.entries(colaboradoresPorRol).map(([rol, colaboradores]) => (
        <Box key={rol} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "18px",
              color: "#1a73e8",
              mb: 1,
            }}
          >
            {rol}
          </Typography>
          <Grid2 container spacing={2} sx={{ mb: 2 }}>
            {colaboradores.map((v) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={v.id}>
                <Card
                  sx={{
                    p: 2,
                    width: "289px",
                    height: "162px",
                    borderRadius: "10px",
                    bgcolor: "#CDCDCD",
                    position: "relative",
                  }}
                >
                  <Info label="Colaborador" value={v.name} />
                  <Info label="Tecnología" value={v.tecnologias.join(", ")} />
                  <Info label="Horas asignadas" value={v.horasAsignadas.toString()} />

                  <Stack sx={{ marginTop: "13px" }} alignItems={"flex-end"}>
                    <DeleteIcon
                      fontSize="inherit"
                      sx={{
                        color: "#D61010",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDelete(v.id)}
                    />
                  </Stack>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      ))}
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
