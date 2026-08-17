"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Card,
  IconButton,
  Typography,
  Collapse,
  Grid2,
} from "@mui/material";
import { editProject } from "@/services/api";
import { useRouter } from "next/navigation";
import { Project, User, AssignedPersons } from "@/types/interface";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddNewPerson from "./AddNewPerson";
import CollaboratorList from "./CollaboratorList";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

export default function EditProject({
  projectsId,
  usersProp,
}: {
  projectsId: Project;
  usersProp: User[];
}) {
  const router = useRouter();
  const [isCollaboratorSectionOpen, setIsCollaboratorSectionOpen] =
    useState(false);
  const [editedProject, setEditedProject] = useState<Project>(projectsId);

  useEffect(() => {
    setEditedProject(projectsId);
  }, [projectsId]);

  const managers =
    usersProp
      ?.filter((user) => user.rol?.toLowerCase() === "manager")
      ?.map((user) => user.name) || [];

  const handleBack = () => {
    router.push("/pages/project_sector");
  };

  const handleSave = async () => {
    try {
      await editProject(editedProject.taxonId, editedProject);
      router.push("/pages/project_sector");
    } catch (error) {
      console.error("Error al guardar el proyecto", error);
    }
  };

  function formatDate(dateString?: string | Date | null) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  }

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
            height: "36px",
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
            padding: "40px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 24, md: "32px" },
                fontFamily: "Poppins",
                fontWeight: 600,
                color: "#002338",
              }}
            >
              Editar proyecto
            </Typography>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                background: "#0087FF",
                borderRadius: "20px",
                padding: "12px 41px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "20px",
                height: "50px",
                color: "#FFFFFF",
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  background: "#0066CC",
                  boxShadow: "none",
                },
              }}
            >
              Guardar
            </Button>
          </Box>

          <Grid2 container spacing={4}>
            <Grid2 size={12}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  md={2}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 100, md: 120 },
                      height: { xs: 100, md: 120 },
                      bgcolor: "#fff",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #e0e4e7",
                      mb: 1,
                    }}
                  >
                    <img
                      src={projectsId.image || "/images/Logo.svg"}
                      alt="Logo"
                      style={{ 
                        maxWidth: "80%", 
                        maxHeight: "80%",
                        objectFit: "contain"
                      }}
                    />
                  </Box>
                  <IconButton
                    sx={{
                      bgcolor: "#f8f9fa",
                      border: "1px solid #e0e4e7",
                      mt: -1,
                      "&:hover": { bgcolor: "#e8f0fe" },
                    }}
                  >
                    <PhotoCameraIcon
                      sx={{ color: "#5f6368", fontSize: "18px" }}
                    />
                  </IconButton>
                </Grid>

                <Grid item xs={12} sm={9} md={10}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Nombre"
                        fullWidth
                        size="small"
                        value={editedProject.name || ""}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Cliente"
                        fullWidth
                        size="small"
                        value={editedProject.client || ""}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            client: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                             fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={editedProject.status || ""}
                          label="Estado"
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          }}
                        >
                          <MenuItem value="Ejecucion">Ejecución</MenuItem>
                          <MenuItem value="Terminado">Terminado</MenuItem>
                          <MenuItem value="Prospecto">Prospecto</MenuItem>
                          <MenuItem value="Cancelado">Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={editedProject.projectType || ""}
                          label="Tipo"
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              projectType: e.target.value,
                            }))
                          }
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          }}
                        >
                          <MenuItem value="Horas">Horas</MenuItem>
                          <MenuItem value="Entregable">Entregable</MenuItem>
                          <MenuItem value="N/A">N/A</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Manager</InputLabel>
                        <Select
                          value={editedProject.managerName || ""}
                          label="Manager"
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              managerName: e.target.value,
                            }))
                          }
                          sx={{
                           fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          }}
                        >
                          {managers.map((managerName) => (
                            <MenuItem key={managerName} value={managerName}>
                              {managerName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de inicio"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDate(editedProject.startDate)}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            startDate: e.target.value ? new Date(e.target.value) : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Fecha de finalización"
                        type="date"
                        fullWidth
                        size="small"
                        value={formatDate(editedProject.endDate)}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            endDate: e.target.value ? new Date(e.target.value) : null,
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Descripción */}
              <TextField
                label="Descripción"
                multiline
                rows={3}
                fullWidth
                value={editedProject.description || ""}
                onChange={(e) =>
                  setEditedProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      height: "40px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      padding: "12px 16px",
                  },
                }}
              />
            </Grid2>

            <Grid2 size={12}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 20, md: "24px" },
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    color: "#002338",
                    mb: 2,
                  }}
                >
                  Colaboradores asignados
                </Typography>
                <CollaboratorList
                  collaborator={editedProject.assignedPersons || []}
                  onDelete={(id: number) => {
                    setEditedProject((prev: Project) => ({
                      ...prev,
                      assignedPersons:
                        prev.assignedPersons?.filter(
                          (person: AssignedPersons) => person.id !== id
                        ) || [],
                    }));
                  }}
                  taxonId={editedProject.taxonId}
                />
              </Box>
            </Grid2>

            <Grid2 size={12}>
              <Box
                sx={{
                  border: "1px solid #e8eaed",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <Box
                  onClick={() =>
                    setIsCollaboratorSectionOpen(!isCollaboratorSectionOpen)
                  }
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 3,
                    bgcolor: "#f8f9fa",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#f1f3f4",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: { xs: 18, md: "20px" },
                      color: "#002338",
                    }}
                  >
                    Agregar colaborador
                  </Typography>
                  <IconButton size="small">
                    {isCollaboratorSectionOpen ? (
                      <ExpandLessIcon sx={{ color: "#002338" }} />
                    ) : (
                      <ExpandMoreIcon sx={{ color: "#002338" }} />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={isCollaboratorSectionOpen}>
                  <Box sx={{ p: 3, bgcolor: "#EDEDED" }}>
                    <AddNewPerson
                      taxonId={editedProject.taxonId}
                      onAddColaborador={(newPerson: AssignedPersons) => {
                        setEditedProject((prev: Project) => ({
                          ...prev,
                          assignedPersons: [
                            ...(prev.assignedPersons || []),
                            newPerson,
                          ],
                        }));
                      }}
                    />
                  </Box>
                </Collapse>
              </Box>
            </Grid2>
          </Grid2>
        </Card>
      </Grid2>
    </Grid2>
  );
}