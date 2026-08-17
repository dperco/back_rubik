"use client";

import {
  Grid2,
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useRouter } from "next/navigation";
import { Vacante } from "@/types/interface";

interface VacanciesDetailProps {
  vacancie: Vacante;
}

export default function VacanciesDetail({ vacancie }: VacanciesDetailProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/pages/vacantes");
  };

  return (
    <Grid2
      container
      sx={{
        marginLeft: "55px",
        marginRight: "55px",
      }}
    >
      <Grid2 size={12}>
        <Grid2
          onClick={handleBack}
          sx={{
            width: "97px",
            height: "36px ",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <KeyboardArrowLeftIcon
            sx={{ width: "24px", height: "24px", color: "#002338" }}
          />

          <Typography
            sx={{
              textAlign: "center",
              color: "#002338",
              fontSize: "24px",
              fontFamily: "Poppins",
              fontWeight: 400,
            }}
          >
            Volver
          </Typography>
        </Grid2>
      </Grid2>
      <Grid2 size={12} mt={"30px"}>
        <Card
          elevation={6}
          sx={{
            width: { xs: "90%", md: "100%" },
            borderRadius: "20px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Grid2 mt={"75px"} mb={"75px"} ml={"40px"} mr={"40px"}>
            <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
              <Typography
                sx={{
                  fontSize: { xs: 24, md: "40px" },
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  color: "#002338",
                }}
              >
                {vacancie.Vacante}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 24, md: "24px" },
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  color: "#0087FF",
                }}
              >
                {vacancie.Nombre}
              </Typography>
            </Box>
            <Divider sx={{ bgcolor: "#002338" }} />
            {vacancie ? (
              <Grid2
                sx={{ display: "flex", flexDirection: "column" }}
                mt={"24px"}
              >
                <InfoRow label="Horas requeridas" value={vacancie.Tiempo} />
                <InfoRow label="Manager" value={vacancie.manager_name} />
                <InfoRow
                  label="Fecha de pedido"
                  value={vacancie["Fecha de pedido"]}
                />
                <InfoRow
                  label="Fecha de inicio"
                  value={vacancie["Fecha de inicio"]}
                />
              </Grid2>
            ) : (
              <Typography>
                No se encontraron detalles para esta vacante.
              </Typography>
            )}{" "}
          </Grid2>
        </Card>
      </Grid2>
    </Grid2>
  );
}
/* Componente reutilizable para cada línea de información              */
interface InfoRowProps {
  label: string;
  value: string | number;
}
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Typography
      sx={{
        fontSize: { xs: 18, md: "20px" },
        fontWeight: 400,
        fontFamily: "Poppins",
        color: "#002338",
        letterSpacing: "0px",
        marginBottom: "20px",
      }}
    >
      {label}:{" "}
      <Box component="span" sx={{ fontWeight: 400 }}>
        {value}
      </Box>
    </Typography>
  );
}
