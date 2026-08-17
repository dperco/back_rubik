"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import "./vacan.css";

interface Proyecto {
  id: string;
  Nombre: string;
  taxon_id: string;
}

type Manager = {
  manager_id: string;
  manager_name: string;
};
interface VacanteProps {
  onClose: () => void;
}

export default function Vacante({ onClose }: VacanteProps) {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [formData, setFormData] = useState({
    Vacante: "",
    Nombre: "",
    taxon_id: "",
    Tiempo: "",
    manager_id: "",
    manager_name: "",
    fecha_de_pedido: "",
    fecha_de_inicio: "",
    Seniority: "",
  });
  console.log(formData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/proyecto`
        );
        const managersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/proyecto`
        );

        if (!projectsRes.ok || !managersRes.ok) {
          throw new Error(`Error al obtener datos: ${projectsRes.statusText}`);
        }

        const projectsData: Proyecto[] = await projectsRes.json();
        const managersData: Manager[] = await managersRes.json();

        console.log("Datos obtenidos de la API:", projectsData);

        const uniqueManagers = Array.from(
          new Map(managersData.map((m) => [m.manager_id, m])).values()
        );

        setManagers(uniqueManagers);
        setProjects(projectsData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleProjectChange = (e: SelectChangeEvent) => {
    const selectedProject = projects.find((p) => p.taxon_id === e.target.value);
    if (selectedProject) {
      setFormData((prevData) => ({
        ...prevData,
        Nombre: selectedProject.Nombre,
        taxon_id: selectedProject.taxon_id,
      }));
    }
  };

  const handleManagerChange = (e: SelectChangeEvent) => {
    const selectedManager = managers.find(
      (m) => m.manager_id === e.target.value
    );
    if (selectedManager) {
      setFormData((prevData) => ({
        ...prevData,
        manager_id: selectedManager.manager_id,
        manager_name: selectedManager.manager_name,
      }));
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.Vacante ||
      !formData.Nombre ||
      !formData.taxon_id ||
      !formData.Tiempo ||
      !formData.manager_id ||
      !formData.fecha_de_pedido ||
      !formData.fecha_de_inicio ||
      !formData.Seniority
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      // Generar ID aleatorio de forma nativa
      const randomId = Math.floor(100000 + Math.random() * 900000);
      console.log("ID generado:", randomId);
      const dataWithId = { ...formData, id: randomId };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vacancie/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataWithId),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al registrar la vacante");
      }

      console.log("Vacante registrada con éxito:", result);
      alert("Vacante registrada correctamente");
      setFormData({
        Vacante: "",
        Nombre: "",
        taxon_id: "",
        Tiempo: "",
        manager_id: "",
        manager_name: "",
        fecha_de_pedido: "",
        fecha_de_inicio: "",
        Seniority: "",
      });
    } catch (error) {
      console.error("Error al registrar vacante:", error);
      alert("Hubo un error al registrar la vacante");
    }
  };

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 800,
          maxHeight: "65vh",
          overflow: "auto",
          padding: 4,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{ textAlign: "left" }}
        >
          Nuevo Vacante
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Fila 1: Vacante y Proyecto */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Vacante"
              name="Vacante"
              value={formData.Vacante}
              onChange={handleChange}
              size="small"
              className="formpro"
              fullWidth
              sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              InputProps={{
                sx: {
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                },
              }}
            />

            <FormControl
              fullWidth
              sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
            >
              <InputLabel id="estado-label">Proyecto</InputLabel>
              <Select
                labelId="proyectos-label"
                name="Nombre"
                value={formData.taxon_id} // Cambia aquí para enlazar solo al taxon_id
                className="formpro"
                onChange={handleProjectChange}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {projects.map((proyecto) => (
                  <MenuItem key={proyecto.taxon_id} value={proyecto.taxon_id}>
                    {proyecto.Nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Fila 2: Tiempo (Horas) y Manager */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Tiempo (Horas)"
              name="Tiempo"
              type="number"
              value={formData.Tiempo}
              onChange={handleChange}
              className="formpro"
              size="small"
              fullWidth
              sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              InputProps={{
                sx: {
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                },
              }}
            />
            <FormControl
              sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              fullWidth
            >
              <InputLabel id="manager-label">Manager</InputLabel>
              <Select
                labelId="manager-label"
                name="manager_id"
                value={formData.manager_id || formData.manager_name}
                onChange={handleManagerChange}
                className="formpro"
              >
                <MenuItem value="">Ninguno</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.manager_id} value={manager.manager_id}>
                    {manager.manager_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Fila 3: Fechas */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Fecha de Pedido"
              name="fecha_de_pedido"
              type="date"
              value={formData.fecha_de_pedido}
              onChange={handleChange}
              className="formpro"
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              InputProps={{
                sx: {
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                },
              }}
            />
            <TextField
              label="Fecha de Inicio"
              name="fecha_de_inicio"
              type="date"
              value={formData.fecha_de_inicio}
              onChange={handleChange}
              className="formpro"
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }}
              InputProps={{
                sx: {
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  pl: "18px",
                },
              }}
            />
          </Box>

          {/* Fila 4: Seniority */}
          <FormControl
            sx={{
              height: "40px",
              borderRadius: "20px",
              border: "1px solid #002338",
              "& .MuiInputLabel-root.Mui-focused": { color: "black" },
            }}
            fullWidth
            size="small"
          >
            <InputLabel id="seniority-label">Seniority</InputLabel>
            <Select
              labelId="seniority-label"
              name="Seniority"
              className="formpro"
              value={formData.Seniority}
              onChange={handleSelectChange}
            >
              <MenuItem value="Senior">Senior</MenuItem>
              <MenuItem value="Semi Senior">Semi Senior</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="Junior">Junior</MenuItem>
              <MenuItem value="Trainee">Trainee</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
            <Button
              variant="contained"
              className="botoncerrar"
              onClick={onClose} // Aquí cerramos el Modal
              sx={{
                textTransform: "none",
                width: "200px",
                height: "50px",
                fontFamily: "Poppins",
                fontSize: "20px",
                color: "#0087FF",
                fontWeight: 500,
                lineHeight: "30px",
                letterSpacing: "0%",
                boxShadow: "none",
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: "20px",
                borderWidth: "1px",
                gap: "10px",
                marginRight: "16px",
                border: "2px solid #0087ff",
              }}
            >
              Cerrar
            </Button>
            {/* Botón de Enviar */}
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              sx={{
                fontWeight: "bold",
                padding: "10px",
                maxWidth: "30%",
                textTransform: "none",
                backgroundColor: "##002338",
                "&:hover": { backgroundColor: "##002338" },
              }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
