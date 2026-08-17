"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import Image from "next/image";

const ConfigureComponent = () => {
  const [menuLogoImage, setMenuLogoImage] = useState<File | null>(null);
  const [loginLogoImage, setLoginLogoImage] = useState<File | null>(null);

  const [tertiaryColor, setTertiaryColor] = useState("#000000");

  const handleLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>
  ): void => {
    if (event.target.files) {
      setImage(event.target.files[0]);
    }
  };

  const handleColorChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setColor: React.Dispatch<React.SetStateAction<string>>
  ): void => {
    setColor(event.target.value);
  };

  return (
    <Card
      sx={{
        p: 3,
        maxWidth: 880,
        boxShadow: 3,
        borderRadius: "20px",
        mt: "-20px",
      }}
    >
      <CardHeader
        title="Configura el aspecto"
        subheader="Agrega tu logotipo al portal."
      />
      <CardContent>
        <Grid container spacing={4} mb={4}>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle1">
              Logotipo para la barra de menú
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ borderStyle: "dashed", height: 80, color: "black" }}
            >
              Arrastra un archivo o haz clic para explorar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, setMenuLogoImage)}
              />
            </Button>
            {menuLogoImage && (
              <Image
                src={URL.createObjectURL(menuLogoImage)}
                alt="Menu Logo"
                style={{ marginTop: 8, maxHeight: 40 }}
              />
            )}
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle1">
              Logotipo para inicio de sesión
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ borderStyle: "dashed", height: 80, color: "black" }}
            >
              Arrastra un archivo o haz clic para explorar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, setLoginLogoImage)}
              />
            </Button>
            {loginLogoImage && (
              <Image
                src={URL.createObjectURL(loginLogoImage)}
                alt="Login Logo"
                style={{ marginTop: 8, maxHeight: 40 }}
              />
            )}
          </Grid>
        </Grid>

        <Typography variant="subtitle1" mb={2}>
          Colores de la marca
        </Typography>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center">
              <TextField
                label="Color terciario"
                value={tertiaryColor}
                onChange={(e) => handleColorChange(e, setTertiaryColor)}
                style={{ flex: 1 }}
              />
              <Box
                ml={2}
                width={50}
                height={50}
                borderRadius={"10px"}
                bgcolor={tertiaryColor}
                border="1px solid #000"
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center">
              <TextField
                label="Color terciario"
                value={tertiaryColor}
                onChange={(e) => handleColorChange(e, setTertiaryColor)}
                style={{ flex: 1 }}
              />
              <Box
                ml={2}
                width={50}
                height={50}
                borderRadius={"10px"}
                bgcolor={tertiaryColor}
                border="1px solid #000"
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center">
              <TextField
                label="Color terciario"
                value={tertiaryColor}
                onChange={(e) => handleColorChange(e, setTertiaryColor)}
                style={{ flex: 1 }}
              />
              <Box
                ml={2}
                width={50}
                height={50}
                borderRadius={"10px"}
                bgcolor={tertiaryColor}
                border="1px solid #000"
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ marginRight: "10px", color: "0087FF", borderRadius: "20px" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              marginRight: "10px",
              color: "#23FFDC",
              backgroundColor: "#002338",
              borderRadius: "20px",
            }}
          >
            Guardar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfigureComponent;
