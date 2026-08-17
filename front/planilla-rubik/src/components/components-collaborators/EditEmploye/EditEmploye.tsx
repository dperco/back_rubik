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
  Divider,
  Grid2,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Employee, User, Project } from "@/types/interface";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchDeleteColabById,
  removeProyectoFromColaborador,
  updateCollaboratorService,
} from "@/services/api";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Slider } from "@mui/material";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";

interface Technologies {
  id: string;
  name: string;
}
export default function EditEmploye({
  techProp,
  projectProp,
  colabId,
  usersProp,
}: {
  techProp: Technologies[];
  projectProp: Project[];
  colabId: Employee;
  usersProp: User[];
}) {
  const router = useRouter();
  const [isCollaboratorSectionOpen, setIsCollaboratorSectionOpen] =
    useState(false);
  const [editedColab, setEditedColab] = useState<Employee>(colabId);
  const [techSelectOpen, setTechSelectOpen] = useState(false);

  useEffect(() => {
    setEditedColab(colabId);
  }, [colabId]);

  const managers =
    usersProp
      ?.filter((user) => user.rol?.toLowerCase() === "manager")
      ?.map((user) => user.name) || [];

  const handleBack = () => {
    router.push("/pages/collaborators");
  };

  const handleSave = async () => {
    try {
      const proyectosValidos = (editedColab.Proyectos || []).filter((asig) =>
        projectProp.some((p) => p.name === asig.Proyectos && !p.delete_at)
      );

      const colabToSave = {
        ...editedColab,
        Proyectos: proyectosValidos,
        fin_contrato: formatDateForAPI(editedColab.fin_contrato),
      };

      await updateCollaboratorService(editedColab.id, colabToSave);
      router.push("/pages/collaborators");
    } catch (error) {
      console.error("Error al guardar el colaborador", error);
    }
  };

  function formatDateForInput(dateString?: string | Date | null) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  }

  function formatDateForAPI(dateString?: string | Date | null) {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
  }

  const handleDeleteColaborador = async () => {
    try {
      await fetchDeleteColabById(editedColab.id);
    } catch (error) {
      alert("Error al eliminar el colaborador");
      console.error("Error al eliminar el colaborador:", error);
    }
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
              Editar Colaborador
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

          <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
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
                    width: 120,
                    height: 120,
                    bgcolor: "#fff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #e0e4e7",
                    mb: 1,
                  }}
                >
                  <img
                    src="/images/anonimo.jpeg"
                    alt="Logo"
                    style={{ maxWidth: "80%", maxHeight: "80%" }}
                  />
                </Box>
                <IconButton
                  sx={{
                    bgcolor: "#f8f9fa",
                    border: "1px solid #e0e4e7",
                    mt: -2,
                    mb: 1,
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
                      label="DNI"
                      fullWidth
                      size="small"
                      value={editedColab.id}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          id: Number(e.target.value),
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
                      label="Nombre"
                      fullWidth
                      size="small"
                      value={editedColab.first_name || ""}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          first_name: e.target.value,
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
                      label="Apellido"
                      fullWidth
                      size="small"
                      value={editedColab.last_name || ""}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          last_name: e.target.value,
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
                      label="Fecha de inicio"
                      type="date"
                      fullWidth
                      size="small"
                      value={formatDateForInput(editedColab.created_at)}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          created_at: e.target.value
                            ? new Date(e.target.value)
                            : null,
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
                      value={formatDateForInput(editedColab.fin_contrato)}
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          fin_contrato: e.target.value
                            ? new Date(e.target.value)
                            : null,
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
                <Grid item xs={12} sm={4}>
                  <Typography
                    sx={{
                      color: "red",
                      cursor: "pointer",
                      mt: "20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={handleDeleteColaborador}
                  >
                    Eliminar colaborador
                    <DeleteIcon sx={{ ml: 1 }} />
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ ml: { xs: 0, md: "30px" }, mr: { xs: 0, md: "30px" } }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Asignaciones
            </Typography>
            {editedColab.Proyectos && editedColab.Proyectos.length > 0 ? (
              editedColab.Proyectos.map((asig, idx) => (
                <Grid
                  container
                  spacing={2}
                  key={`asignacion-${asig.Proyectos}-${idx}`}
                  sx={{ mb: 1 }}
                >
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`proyecto-label-${idx}`}>
                        Proyecto
                      </InputLabel>
                      <Select
                        labelId={`proyecto-label-${idx}`}
                        label="Proyecto"
                        value={asig.Proyectos}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedColab((prev) => ({
                            ...prev,
                            Proyectos: prev.Proyectos.map((item, i) =>
                              i === idx ? { ...item, Proyectos: value } : item
                            ),
                          }));
                        }}
                        sx={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          height: "40px",
                          border: "1px solid #002338",
                          borderRadius: "20px",
                          padding: "12px 16px",
                        }}
                      >
                        {projectProp
                          .filter((p) => !p.delete_at)
                          .map((p) => (
                            <MenuItem key={p.taxonId} value={p.name}>
                              {p.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Rol"
                      value={asig.rol}
                      fullWidth
                      size="small"
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          Proyectos: prev.Proyectos.map((item, i) =>
                            i === idx ? { ...item, rol: e.target.value } : item
                          ),
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
                  <Grid item xs={4}>
                    <TextField
                      label="Seniority"
                      value={asig.seniority}
                      fullWidth
                      size="small"
                      onChange={(e) =>
                        setEditedColab((prev) => ({
                          ...prev,
                          Proyectos: prev.Proyectos.map((item, i) =>
                            i === idx
                              ? { ...item, seniority: e.target.value }
                              : item
                          ),
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
                  <Grid item xs={8}>
                    <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                      <Box flex={1}>
                        <Typography
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            mb: 0.5,
                          }}
                        >
                          Horas asignadas (%) ({asig.Proyectos})
                        </Typography>
                        <Slider
                          value={asig.horasAsignadas}
                          min={0}
                          max={160}
                          step={1}
                          onChange={(_, value) =>
                            setEditedColab((prev) => ({
                              ...prev,
                              Proyectos: prev.Proyectos.map((item, i) =>
                                i === idx
                                  ? { ...item, horasAsignadas: value as number }
                                  : item
                              ),
                            }))
                          }
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          ml: 2,
                          minWidth: "40px",
                          textAlign: "right",
                        }}
                      >
                        {asig.horasAsignadas}hs
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton
                      sx={{ color: "red", mt: 4, ml: "340px" }}
                      onClick={async () => {
                        await removeProyectoFromColaborador(
                          editedColab.id,
                          asig.Proyectos
                        );
                        setEditedColab((prev) => ({
                          ...prev,
                          Proyectos: prev.Proyectos.filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))
            ) : (
              <Typography color="text.secondary">Sin asignaciones</Typography>
            )}
          </Box>

          <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Tecnologías
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="tecnologias-label">
                    Agregar tecnología
                  </InputLabel>
                  <Select
                    label="Agregar tecnología"
                    multiple
                    open={techSelectOpen}
                    onOpen={() => setTechSelectOpen(true)}
                    onClose={() => setTechSelectOpen(false)}
                    value={[]}
                    onChange={(e) => {
                      const newTechs = e.target.value as string[];
                      setEditedColab((prev) => ({
                        ...prev,
                        tecnologias: [
                          ...(prev.tecnologias || []),
                          ...newTechs.filter(
                            (t) => !(prev.tecnologias || []).includes(t)
                          ),
                        ],
                      }));
                      setTechSelectOpen(false);
                    }}
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      border: "1px solid #002338",
                      borderRadius: "20px",
                      background: "#fff",
                    }}
                    renderValue={() => ""}
                  >
                    {techProp.map((t, index) => (
                      <MenuItem
                        key={`tech-select-${t.id || index}`}
                        value={t.name}
                      >
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  {(editedColab.tecnologias || []).map((tecnologia, idx) => {
                    const techObj = techProp.find((t) => t.name === tecnologia);
                    return (
                      <Chip
                        key={`tech-chip-${tecnologia}-${idx}`}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <span>{tecnologia}</span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setEditedColab((prev) => ({
                                  ...prev,
                                  tecnologias:
                                    prev.tecnologias?.filter(
                                      (t) => t !== tecnologia
                                    ) || [],
                                }))
                              }
                              sx={{
                                ml: 1,
                                background: "#d32f2f",
                                color: "#fff",
                                width: 22,
                                height: 22,
                                "&:hover": {
                                  background: "#b71c1c",
                                },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        }
                        sx={{
                          background: "#e5e8eb",
                          color: "#002338",
                          fontWeight: 600,
                          fontFamily: "Poppins, sans-serif",
                          mr: 1,
                          mb: 1,
                          ".MuiChip-label": {
                            display: "flex",
                            alignItems: "center",
                            px: 1,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Grid2>
    </Grid2>
  );
}
