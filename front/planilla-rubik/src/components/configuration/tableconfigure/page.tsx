"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Grid,
  Chip,
  Box,
  Typography,
  TextField,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ConfigureTablesComponent = () => {
  // Estado para manejar la pestaña activa
  const [activeTab, setActiveTab] = useState<string>("collaborador");

  // Estados para colaboradores
  const [collaboratorColumns, setCollaboratorColumns] = useState<
    { displayName: string; field: string }[]
  >([]);
  const [isEditingCollaborator, setIsEditingCollaborator] = useState(false);
  const [initialCollaboratorColumns, setInitialCollaboratorColumns] = useState<
    { displayName: string; field: string }[]
  >([]);

  // Estados para proyectos
  const [projectColumns, setProjectColumns] = useState<
    { displayName: string; field: string }[]
  >([]);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [initialProjectColumns, setInitialProjectColumns] = useState<
    { displayName: string; field: string }[]
  >([]);

  // Estados para vacante
  const [vacanColumns, setVacanColumns] = useState<
    { displayName: string; field: string }[]
  >([]);
  const [isEditingVacan, setIsEditingVacan] = useState(false);
  const [initialVacanColumns, setInitialVacanColumns] = useState<
    { displayName: string; field: string }[]
  >([]);

  useEffect(() => {
    // Cargamos datos para ambas tablas al iniciar
    fetchColumns("collaborador");
    fetchColumns("proyecto");
    fetchColumns("vacante");
  }, []);

  const fetchColumns = async (tableType: string) => {
    try {
      console.log(`Solicitando columnas para ${tableType}`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/configuration/columns/${tableType}`
      );
      const data = await response.json();
      console.log(`Datos recibidos del backend para ${tableType}:`, data);

      if (Array.isArray(data.columns)) {
        const columnData = data.columns.map(
          (col: { displayName: string; field: string }) => ({
            displayName: col.displayName,
            field: col.field, // Se mantiene el field original de la base de datos
          })
        );

        if (tableType === "collaborador") {
          setCollaboratorColumns([...columnData]);
          setInitialCollaboratorColumns([...columnData]);
        } else if (tableType === "proyecto") {
          setProjectColumns([...columnData]);
          setInitialProjectColumns([...columnData]);
        } else if (tableType === "vacante") {
          setVacanColumns([...columnData]);
          setInitialVacanColumns([...columnData]);
        }
      } else {
        console.error(
          `Error: La API no devolvió un array para ${tableType}`,
          data
        );
      }
    } catch (error) {
      console.error(`Error fetching columns for ${tableType}:`, error);
    }
  };

  const handleInputChange =
    (tableType: string) =>
    (index: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (tableType === "collaborador") {
        const updatedTitles = [...collaboratorColumns];
        updatedTitles[index] = {
          ...updatedTitles[index],
          displayName: newValue,
        };
        setCollaboratorColumns(updatedTitles);
        console.log(
          "Columnas de colaborador después de cambio:",
          updatedTitles
        );
      } else if (tableType === "proyecto") {
        const updatedTitles = [...projectColumns];
        updatedTitles[index] = {
          ...updatedTitles[index],
          displayName: newValue,
        };
        setProjectColumns(updatedTitles);
        console.log("Columnas de proyecto después de cambio:", updatedTitles);
      } else if (tableType === "vacante") {
        const updatedTitles = [...vacanColumns];
        updatedTitles[index] = {
          ...updatedTitles[index],
          displayName: newValue,
        };
        setVacanColumns(updatedTitles);
        console.log("Columnas de vacante después de cambio:", updatedTitles);
      }
    };

  const handleDeleteColumn = (tableType: string) => (index: number) => {
    if (tableType === "collaborador") {
      const updatedTitles = collaboratorColumns.filter((_, i) => i !== index);
      setCollaboratorColumns(updatedTitles);
      console.log(
        "Columnas de colaborador después de eliminar:",
        updatedTitles
      );
    } else if (tableType === "proyecto") {
      const updatedTitles = projectColumns.filter((_, i) => i !== index);
      setProjectColumns(updatedTitles);
      console.log("Columnas de proyecto después de eliminar:", updatedTitles);
    } else if (tableType === "vacante") {
      const updatedTitles = vacanColumns.filter((_, i) => i !== index);
      setVacanColumns(updatedTitles);
      console.log("Columnas de vacante después de eliminar:", updatedTitles);
    }
  };

  const handleSaveColumns = async (tableType: string) => {
    try {
      console.log(`Iniciando guardado para ${tableType}`);

      let columnsToUpdate: { displayName: string; field: string }[] = [];
      if (tableType === "collaborador") columnsToUpdate = collaboratorColumns;
      else if (tableType === "proyecto") columnsToUpdate = projectColumns;
      else if (tableType === "vacante") columnsToUpdate = vacanColumns;

      const updatedColumns = columnsToUpdate.map((col, idx) => ({
        displayName: col.displayName,
        field: col.field,
        order: idx,
      }));

      console.log(`Enviando al backend para ${tableType}:`, {
        tableType,
        columns: updatedColumns,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/configuration/updateColumns`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableType, columns: updatedColumns }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        console.log(`Columnas de ${tableType} guardadas correctamente`);

        if (tableType === "collaborador") {
          setIsEditingCollaborator(false);
          setInitialCollaboratorColumns([...collaboratorColumns]);
        } else if (tableType === "proyecto") {
          setIsEditingProject(false);
          setInitialProjectColumns([...vacanColumns]);
        } else if (tableType === "vacante") {
          setIsEditingVacan(false);
          setInitialVacanColumns([...vacanColumns]);
        }
      } else {
        console.error(
          `Error al guardar las columnas de ${tableType}:`,
          data.message
        );
      }
    } catch (error) {
      console.error(`Error al guardar las columnas de ${tableType}:`, error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    console.log("Cambiando a pestaña:", newValue);
  };

  const renderTableSection = (tableType: string) => {
    let columns: { displayName: string; field: string }[] = [];
    let isEditing = false;

    if (tableType === "collaborador") {
      columns = collaboratorColumns;
      isEditing = isEditingCollaborator;
    } else if (tableType === "proyecto") {
      columns = projectColumns;
      isEditing = isEditingProject;
    } else if (tableType === "vacante") {
      columns = vacanColumns;
      isEditing = isEditingVacan;
    }

    console.log(
      `Renderizando sección para ${tableType} con columnas:`,
      columns
    );

    return (
      <Card sx={{ p: 1, borderRadius: "12px" }}>
        <Typography variant="h6" gutterBottom>
          {tableType.charAt(0).toUpperCase() + tableType.slice(1)} (Título de
          columnas)
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {columns.map((columnTitle, index) => (
            <Grid
              item
              key={`${tableType}-${index}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {isEditing ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  position="relative"
                >
                  <IconButton
                    onClick={() => handleDeleteColumn(tableType)(index)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      border: "2px solid red",
                      borderRadius: "50%",
                      backgroundColor: "red",
                      color: "white",
                      width: "20px",
                      height: "20px",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    value={columnTitle.displayName}
                    onChange={handleInputChange(tableType)(index)}
                    size="small"
                    sx={{
                      minWidth: "180px",
                      borderRadius: "20px",
                      "& .MuiOutlinedInput-root": { borderRadius: "20px" },
                    }}
                  />
                </Box>
              ) : (
                <Chip
                  label={columnTitle.displayName}
                  sx={{
                    backgroundColor: "#E0E0E0",
                    fontSize: "14px",
                    padding: "4px 8px",
                  }}
                />
              )}
            </Grid>
          ))}
        </Grid>
        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
          {isEditing ? (
            <>
              <Button
                onClick={() => handleSaveColumns(tableType)}
                variant="contained"
                sx={{
                  borderRadius: "20px",
                  backgroundColor: "#002B5B",
                  color: "#00E3A5",
                  fontWeight: "bold",
                }}
              >
                Guardar
              </Button>
              <Button
                onClick={() => {
                  if (tableType === "collaborador") {
                    setCollaboratorColumns([...initialCollaboratorColumns]);
                    setIsEditingCollaborator(false);
                  } else if (tableType === "proyecto") {
                    setProjectColumns([...initialProjectColumns]);
                    setIsEditingProject(false);
                  } else if (tableType === "vacante") {
                    setVacanColumns([...initialVacanColumns]);
                    setIsEditingVacan(false);
                  }
                }}
                variant="outlined"
                sx={{ borderRadius: "20px", fontWeight: "bold" }}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                if (tableType === "collaborador") {
                  setIsEditingCollaborator(true);
                } else if(tableType === "proyecto") {
                  setIsEditingProject(true);
                } else if(tableType === "vacante") {
                  setIsEditingVacan(true);
                }

              }}
              variant="contained"
              sx={{
                borderRadius: "20px",
                paddingLeft: "30px",
                paddingRight: "30px",
                backgroundColor: "#002B5B",
                color: "#00E3A5",
                fontWeight: "bold",
              }}
            >
              Editar
            </Button>
          )}
        </Box>
      </Card>
    );
  };

  return (
    <Card
      sx={{
        p: 3,
        maxWidth: 900,
        boxShadow: 3,
        borderRadius: "20px",
        mt: "-20px",
      }}
    >
      <CardHeader
        title="Configura el aspecto de las tablas"
        subheader="Escribe el nombre de cada columna."
        sx={{ mb: 0, pt: 0 }}
      />
      <CardContent>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
          TabIndicatorProps={{
            style: { backgroundColor: "rgba(35, 255, 220, 1)" },
          }}
        >
          <Tab
            value="collaborador"
            label="Colaboradores"
            sx={{
              fontWeight: activeTab === "collaborador" ? "bold" : "normal",
              color: activeTab === "collaborador" ? "#002B5B" : "inherit",
            }}
          />
          <Tab
            value="proyecto"
            label="Proyectos"
            sx={{
              fontWeight: activeTab === "proyecto" ? "bold" : "normal",
              color: activeTab === "proyecto" ? "#002B5B" : "inherit",
            }}
          />
          <Tab
            value="vacante"
            label="Vacantes"
            sx={{
              fontWeight: activeTab === "vacante" ? "bold" : "normal",
              color: activeTab === "vacante" ? "#002B5B" : "inherit",
            }}
          />
        </Tabs>

        {activeTab === "collaborador" && renderTableSection("collaborador")}
        {activeTab === "proyecto" && renderTableSection("proyecto")}
        {activeTab === "vacante" && renderTableSection("vacante")}
      </CardContent>
    </Card>
  );
};

export default ConfigureTablesComponent;
