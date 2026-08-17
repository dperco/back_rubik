"use client";
import Tooltip from "@mui/material/Tooltip";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  fetchCollaborators,
  fetchManagers,
  registerVacanteService,
  updateCollaboratorService,
  registerProjectService,
  fetchAvailableTechnologies,
  fetchProjectStates,
} from "@/services/api";
import {
  Vacante,
  RegisterProjectBody,
  Employee,
  Manager,
} from "@/types/interface";
import ModalComponent from "@/components/message/MessageModal";

interface Proyecto {
  rol: string;
  Proyectos: string;
  tecnologias: string;
  horasAsignadas: number;
  assigned_hours?: number;
  technologys?: string;
}
interface UploadProfilePhotoProps {
  handleFileUpload: React.ChangeEventHandler<HTMLInputElement>;
}

interface ProyecProps {
  onClose: () => void;
}
interface ProjectState {
  id: string;
  status: string;
}
export default function Proyecto({ onClose }: ProyecProps) {
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });

  const [tecnologiasDisponibles, setTecnologiasDisponibles] = useState<
    string[]
  >([]);
  const generateRandomTaxonId = () => Math.floor(Math.random() * 120000) + 1;
  const [formData, setFormData] = useState({
    taxonId: generateRandomTaxonId(),
    name: "",
    client: "",
    status: "",
    phase: "",
    projectType: "",
    startDate: "",
    endDate: "",
    manager_id: "",
    managerName: "",
    description: "",
    vacancies: [
      {
        role: "",
        collaboratorId: "",
        technology: "",
        time: "",
        requestDate: "",
        startDate: "",
        seniority: "",
      },
    ],
  });
  const [estadosProyecto, setEstadosProyecto] = useState<ProjectState[]>([]);
  const [colaboradores, setColaboradores] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);


  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  useEffect(() => {
    Promise.all([
      fetchCollaborators(),
      fetchManagers(),
      fetchAvailableTechnologies(),
      fetchProjectStates(),
    ])
      .then(([cols, mans, techs, estados]) => {
        setColaboradores(cols ?? []);
        setManagers(
          (mans ?? []).map((m: any) => ({
            manager_id: m.manager_id,
            manager_name: m.manager_name,
            manager_role: m.manager_role ?? "Manager",
          }))
        );
        setEstadosProyecto(estados ?? []);
      })
      .catch((err) => console.error("Error al obtener datos:", err));
  }, []);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target as {
      name: keyof typeof formData;
      value: string;
    };

    setFormData((prevData) => ({
      ...prevData,
      [name]: Array.isArray(prevData[name]) ? [value] : value,
    }));
    setFormData((prevData) => {
      if (
        name === ("colaborador" as keyof typeof formData) &&
        value === "null"
      ) {
        return {
          ...prevData,
          colaborador: [""],
          rol: [""],
        };
      }

      if (name === "managerName") {
        const selectedManager =
          value === "null"
            ? null
            : managers.find((manager) => manager.manager_name === value);

        return {
          ...prevData,
          manager_name: value === "null" ? "" : value,
          manager_id: selectedManager ? selectedManager.manager_id : "",
        };
      }

      e;
      return {
        ...prevData,
        [name]: Array.isArray(prevData[name]) ? [value] : value,
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.taxonId || !formData.name) {
      showDialog("error", "Por favor, completá todos los campos obligatorios.");
      return;
    }
    const assignedPersons = formData.vacancies
      .filter(v => v.collaboratorId && v.collaboratorId !== "null")
      .map(vacante => {
        const colaborador = colaboradores.find(c => String(c.id) === String(vacante.collaboratorId));
        return {
          id: vacante.collaboratorId,
          name: colaborador ? `${colaborador.first_name} ${colaborador.last_name}` : "",
          rol: vacante.role,
          horasAsignadas: vacante.time,
          tecnologias: vacante.technology,
          seniority: vacante.seniority,
        };
      });

    try {
      const projectData: RegisterProjectBody & { assignedPersons: typeof assignedPersons } = {
        managerId: formData.manager_id || null,
        managerName: formData.managerName || null,
        taxonId: formData.taxonId,
        name: formData.name,
        client: formData.client || null,
        status: formData.status || null,
        phase: formData.phase || null,
        projectType: formData.projectType || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        assignedPersons,  
      };
      const response = await registerProjectService(projectData);
      if (
        !response ||
        (typeof response.status === "number" &&
          (response.status < 200 || response.status >= 300))
      ) {
        showDialog("error", "El servidor rechazó el registro del proyecto");
      }
      const vacantesPromises = formData.vacancies.map(async (vacante) => {
        try {
          if (vacante.collaboratorId === "null" || !vacante.collaboratorId) {
            return await registrarVacante(vacante);
          } else {
            return await actualizarColaborador(Number(vacante.collaboratorId));
          }
        } catch (error) {
          console.error(`Error procesando vacante:`, error);
          return null;
        }
      });

      await Promise.all(vacantesPromises);
      showDialog("success", "Proyecto registrado exitosamente");
              setTimeout(() => {
          onClose();
        }, 3000);
    } catch (err: any) {
      console.error(err);
      showDialog(
        "error",
        err?.message ??
        "Error al registrar el proyecto o actualizar el colaborador"
      );
    }
  };
  const registrarVacante = async (vacante: any) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const payload: Vacante = {
        id: vacante.id ?? Math.floor(Math.random() * 1000000),
        manager_id: formData.manager_id,
        manager_name: formData.managerName,
        taxonId: formData.taxonId,
        Nombre: formData.name,
        Vacante: vacante.role,
        Tiempo: Number(vacante.time),
        fecha_de_pedido: vacante.requestDate || today,
        fecha_de_inicio: vacante.startDate || today,
        Seniority: vacante.seniority,
        created_at: new Date().toISOString(),
        delete_at: "",
        manager_visible_in_org_chart: true,
        last_edited_by: "",
        last_edited_on: new Date().toISOString(),
      };

      const result = await registerVacanteService(payload);
      if (
        !result ||
        (typeof result.status === "number" &&
          (result.status < 200 || result.status >= 300))
      ) {
        showDialog("error", "El servidor rechazó el registro del Vacante");
      }
      showDialog("success", "Vacante registrada correctamente");
    } catch (err) {
      console.error("Exception en registrarVacante:", err);
      showDialog("error", "Error al registrar vacante. Mirá la consola.");
      throw err;
    }
  };

  const actualizarColaborador = async (colaboradorId: Number) => {
    try {
      const colaboradorData = colaboradores.find((c) => Number(c.id) === Number(colaboradorId));
      if (!colaboradorData) {
        console.error("No se encontró el colaborador con ID:", colaboradorId);
        return;
      }
      const vacanteAsociada = formData.vacancies.find(
        (v) => Number(v.collaboratorId) === Number(colaboradorId)
      );

      const proyectosActuales: Proyecto[] = Array.isArray(
        colaboradorData.Proyectos
      )
        ? colaboradorData.Proyectos.map((p) =>
          typeof p === "string"
            ? { Proyectos: p, rol: "", tecnologias: "", horasAsignadas: 0 }
            : {
              Proyectos: (p as any).Proyectos ?? "",
              rol: (p as any).rol ?? "",
              tecnologias: (p as any).tecnologias ?? "",
              horasAsignadas: (p as any).horasAsignadas ?? 0,
              assigned_hours: (p as any).assigned_hours,
              technologys: (p as any).technologys,
            }
        )
        : [];

      let proyectosActualizados = [...proyectosActuales];

      if (vacanteAsociada) {
        const horasNuevas = Number(vacanteAsociada.time) || 0;

        const nombreProyecto = formData.name ?? "";

        if (nombreProyecto) {
          const nuevoProyecto: Proyecto = {
            Proyectos: nombreProyecto,
            rol: vacanteAsociada.role || "",
            tecnologias: vacanteAsociada.technology || "",
            horasAsignadas: horasNuevas,
          };

          const idx = proyectosActuales.findIndex(
            (p) => p.Proyectos === nombreProyecto
          );
          if (idx >= 0) {
            proyectosActualizados[idx] = nuevoProyecto;
          } else {
            proyectosActualizados.push(nuevoProyecto);
          }
        }
      }
      const payload = {
        first_name: colaboradorData.first_name,
        last_name: colaboradorData.last_name,
        email: colaboradorData.email,
        Proyectos: proyectosActualizados,
        tecnologias: colaboradorData.tecnologias ?? [],
        rol: Array.isArray(colaboradorData.roles)
          ? colaboradorData.roles.join(", ")
          : colaboradorData.roles,
        estado: colaboradorData.estado || "activo",
        horasAsignadas: vacanteAsociada
          ? String(vacanteAsociada.time)
          : colaboradorData.horasAsignadas,
        last_edited_on: new Date().toISOString(),
        delete_at: null,
      };
      const result = await updateCollaboratorService(
        colaboradorId,
        payload as any
      );
      if (
        !result ||
        (typeof result.status === "number" &&
          (result.status < 200 || result.status >= 300))
      ) {
        showDialog(
          "error",
          "El servidor rechazó el registrar proyecto al colaborador"
        );
      }
      showDialog("success", "Colaborador actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el colaborador:", error);
      showDialog("error", "¡Uy! Algo falló");
    }
  };

  const handleVacanteChange = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = event.target;

    setFormData((prevData) => {
      const updatedVacancies = [...prevData.vacancies];
      updatedVacancies[index] = {
        ...updatedVacancies[index],
        [name]: value,
      };

      return {
        ...prevData,
        vacancies: updatedVacancies,
      };
    });
  };

  const addVacante = () => {
    setFormData((prevData) => ({
      ...prevData,
      vacancies: [
        ...prevData.vacancies,
        {
          role: "",
          collaboratorId: "",
          technology: "",
          time: "",
          requestDate: "",
          startDate: "",
          seniority: "",
        },
      ],
    }));
  };

  const removeVacante = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      vacancies: prevData.vacancies.filter((_, i) => i !== index),
    }));
  };
  const handleVacanteSliderChange = (index: number, newValue: number) => {
    setFormData((prevData) => {
      const updatedVacantes = [...prevData.vacancies];
      updatedVacantes[index] = {
        ...updatedVacantes[index],
        time: newValue.toString(),
      };
      return { ...prevData, vacancies: updatedVacantes };
    });
  };

  useEffect(() => {
    fetchAvailableTechnologies()
      .then(setTecnologiasDisponibles)
      .catch((error) =>
        console.error("Error al cargar las tecnologías:", error)
      );
  }, []);

  const handleCreateAISuggestion = () => {
    console.log("Creando sugerencia con IA");
  };

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }
    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imágenes en formato PNG o JPEG.");
      return;
    }
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        img.src = e.target.result;
        img.onload = () => {
          if (img.width !== 160 || img.height !== 160) {
            alert("La imagen debe ser de 160 x 160 píxeles.");
            return;
          }
          alert("Imagen cargada correctamente.");
        };
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "none",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            align="center"
            sx={{
              textAlign: "left",
              fontSize: "20px",
              fontWeight: 500,
              color: "#002338",
            }}
          >
            Nuevo Proyecto
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
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
                size="small"
                label="Nombre"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
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
                size="small"
                label="Cliente"
                name="client"
                id="client"
                value={formData.client}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                >
                  {estadosProyecto.length > 0 ? (
                    estadosProyecto.map((estado) => (
                      <MenuItem
                        key={estado.id}
                        value={estado.status || estado.id}
                      >
                        {estado.status || estado.id}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      Cargando estados...
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
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
                <InputLabel id="tipo-label">Tipo</InputLabel>
                <Select
                  labelId="tipo-label"
                  name="projectType"
                  id="projectType"
                  value={formData.projectType}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Horas">Horas</MenuItem>
                  <MenuItem value="Entregable">Entregable</MenuItem>
                  <MenuItem value="N/A">N/A</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
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
                <InputLabel id="manager-label">Manager</InputLabel>
                <Select
                  labelId="manager-label"
                  name="managerName"
                  id="managerName"
                  value={formData.managerName || ""}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="null">Ninguno</MenuItem>
                  {managers && managers.length > 0 ? (
                    managers.map((manager) => (
                      <MenuItem
                        key={manager.manager_id || Math.random().toString()}
                        value={manager.manager_name}
                      >
                        {manager.manager_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No hay managers disponibles
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
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
                size="small"
                label="ID del Manager"
                name="manager_id"
                id="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                <InputLabel id="phase-label">Fase</InputLabel>
                <Select
                  labelId="phase-label"
                  name="phase"
                  id="phase"
                  value={formData.phase}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Gestionar Cierre">Gestionar Cierre</MenuItem>
                  <MenuItem value="FALSE">FALSE</MenuItem>
                  <MenuItem value="+90 dias">+90 dias</MenuItem>
                  <MenuItem value="Ultimo 30 dias">Ultimo 30 dias</MenuItem>
                  <MenuItem value="N/A">N/A</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
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
                size="small"
                label="Fecha de Inicio"
                name="startDate"
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
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
                size="small"
                label="Fecha de Fin"
                name="endDate"
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
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
                size="small"
                label="Descripcion"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                borderTop: "1px solid #ccc",
                paddingY: 1,
                textAlign: "left",
              }}
            >
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 500,
                  color: "#002338",
                }}
              >
                Staff Requerido
              </Typography>
            </Box>
          </Grid>

          {formData.vacancies.map((vacante, index) => (
            <Grid key={index} item xs={12} container alignItems="center">
              <Grid item xs={12} sm={3.5} sx={{ marginRight: "20px" }}>
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
                  <InputLabel id={`rol-label-${index}`}>Vacante</InputLabel>
                  <Select
                    labelId={`rol-label-${index}`}
                    name="role"
                    id={`role-${index}`}
                    value={vacante.role || ""}
                    onChange={(e) => handleVacanteChange(index, e)}
                  >
                    <MenuItem value="Full Stack">Full Stack</MenuItem>
                    <MenuItem value="QA">QA</MenuItem>
                    <MenuItem value="Backend">Backend</MenuItem>
                    <MenuItem value="Flutter">Flutter</MenuItem>
                    <MenuItem value="UX/UI">UX/UI</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3.5} sx={{ marginRight: "20px" }}>
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
                  <InputLabel id={`colaborador-label-${index}`}>
                    Colaborador
                  </InputLabel>
                  <Select
                    labelId={`colaborador-label-${index}`}
                    name="collaboratorId"
                    id={`collaboratorId-${index}`}
                    value={vacante.collaboratorId || ""}
                    onChange={(e) => handleVacanteChange(index, e)}
                  >
                    <MenuItem value="null">Ninguno</MenuItem>
                    {colaboradores.map((colaborador) => (
                      <MenuItem key={colaborador.id} value={colaborador.id}>
                        {colaborador.first_name} {colaborador.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3.5}>
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
                  <InputLabel id={`tecnologia-label-${index}`}>
                    Tecnologíaxs
                  </InputLabel>
                  <Select
                    labelId={`tecnologia-label-${index}`}
                    name="technology"
                    id={`technology-${index}`}
                    value={vacante.technology || ""}
                    onChange={(e) => handleVacanteChange(index, e)}
                  >
                    {(vacante.collaboratorId === "null" ||
                      (
                        colaboradores.find(
                          (col) => String(col.id) === vacante.collaboratorId
                        )?.tecnologias ?? []
                      ).length === 0
                      ? tecnologiasDisponibles
                      : colaboradores.find(
                        (col) => String(col.id) === vacante.collaboratorId
                      )?.tecnologias ?? []
                    ).map((tech: string, techIndex: number) => (
                      <MenuItem key={techIndex} value={tech}>
                        {tech}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={1}
                sx={{ display: "flex", justifyContent: "center" }}
                container
                justifyContent="flex-end"
              >
                <Grid item>
                  <Tooltip title="Agregar">
                    <IconButton onClick={addVacante} color="primary">
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {index !== 0 && (
                  <Grid item>
                    <Tooltip title="Eliminar">
                      <IconButton
                        onClick={() => removeVacante(index)}
                        color="secondary"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12} sx={{ marginBottom: "15px" }}>
                {vacante.collaboratorId !== "null" ? (
                  <Grid
                    container
                    alignItems="center"
                    sx={{ marginTop: "10px" }}
                  >
                    <Grid item xs={10}>
                      <Typography
                        sx={{
                          textAlign: "left",
                          fontSize: "18px",
                          fontWeight: 400,
                          color: "#002338",
                          fontFamily: "Poppins",
                        }}
                        variant="body2"
                      >
                        Horas Asignadas (%)
                      </Typography>
                    </Grid>
                    <Grid item xs={9.9} sx={{ marginLeft: "10px" }}>
                      <Slider
                        value={Number(vacante.time) || 0}
                        onChange={(_, newValue) =>
                          handleVacanteSliderChange(index, newValue as number)
                        }
                        aria-labelledby="Horas Asignadas (%)"
                        min={0}
                        max={160}
                        sx={{ flex: 1 }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body2"
                        sx={{
                          minWidth: "40px",
                          fontFamily: "Poppins",
                          fontWeight: 300,
                          color: "#002338",
                          fontSize: "18px",
                          marginBottom: "15px",
                          marginLeft: "20px",
                        }}
                      >
                        {vacante.time ?? 0} hs
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2} sx={{ mb: 1, marginTop: "2px" }}>
                    <Grid item xs={5} sm={3.6} sx={{ marginRight: "10px" }}>
                      <TextField
                        sx={{
                          height: "40px",
                          borderRadius: "20px",
                          border: "1px solid #002338",
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        InputProps={{
                          sx: {
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                          },
                        }}
                        size="small"
                        label="Tiempo (Horas)"
                        name="time"
                        type="number"
                        id="time"
                        value={vacante.time || ""}
                        onChange={(e) => handleVacanteChange(index, e)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={7} sm={3.6} sx={{ marginRight: "5px" }}>
                      <TextField
                        sx={{
                          height: "40px",
                          borderRadius: "20px",
                          border: "1px solid #002338",
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        InputProps={{
                          sx: {
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                          },
                        }}
                        size="small"
                        label="Fecha de Pedido"
                        name="requestDate"
                        type="date"
                        id="requestDate"
                        value={vacante.requestDate || ""}
                        onChange={(e) => handleVacanteChange(index, e)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={7} sm={3.6}>
                      <TextField
                        sx={{
                          height: "40px",
                          borderRadius: "20px",
                          border: "1px solid #002338",
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        InputProps={{
                          sx: {
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            pl: "18px",
                          },
                        }}
                        size="small"
                        label="Fecha de Inicio"
                        name="startDate"
                        type="date"
                        id="startDate"
                        value={vacante.startDate || ""}
                        onChange={(e) => handleVacanteChange(index, e)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={10} sm={3.6}>
                      <FormControl
                        sx={{
                          height: "40px",
                          borderRadius: "20px",
                          border: "1px solid #002338",
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "black",
                          },
                        }}
                        fullWidth
                        size="small"
                      >
                        <InputLabel id={`seniority-label-${index}`}>
                          Seniority
                        </InputLabel>
                        <Select
                          labelId={`seniority-label-${index}`}
                          name="seniority"
                          id={`seniority-${index}`}
                          value={vacante.seniority || ""}
                          onChange={(e) => handleVacanteChange(index, e)}
                        >
                          <MenuItem value="Senior">Senior</MenuItem>
                          <MenuItem value="Semi Senior">Semi Senior</MenuItem>
                          <MenuItem value="Advanced">Advanced</MenuItem>
                          <MenuItem value="Junior">Junior</MenuItem>
                          <MenuItem value="Trainee">Trainee</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          ))}
          <Box display="flex" alignItems="center">
            <Box>
              <Button
                component="label"
                sx={{
                  color: "#0087FF",
                  textTransform: "none",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <CloudUploadIcon
                  sx={{ mr: 1, width: "24px", height: "24px" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  Subir foto de perfil
                </Typography>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontFamily: "Poppins",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              (Imagen de 160 x 160 píxeles. Solo formato png o jpeg)
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 2,
              marginTop: 2,
            }}
          >
            <Button
              sx={{
                "&:hover": { backgroundColor: "transparent" },
                textTransform: "none",
                width: "257px ",
                height: "50px",
                fontFamily: "Poppins",
                fontSize: "19px",
                color: "#0087FF",
                fontWeight: 500,
                lineHeight: "30px",
                letterSpacing: "0%",
                boxShadow: "none",
                backgroundColor: "#F8F8F8",
                borderRadius: "20px",
                borderWidth: "1px",
                gap: "10px",
              }}
              onClick={handleCreateAISuggestion}
            >
              Crear sugerencia IA
              <AutoFixHighIcon
                sx={{ width: "19px", height: "19px", transform: "scaleX(-1)" }}
              />
            </Button>

            <Box sx={{ display: "flex", justifyContent: "end", width: "70%" }}>
              <Button
                variant="contained"
                onClick={onClose}
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
              <Button
                variant="contained"
                onClick={handleSubmit}
                fullWidth
                sx={{
                  width: "200px",
                  height: "50px",
                  marginLeft: "4px",
                  borderRadius: "20px",
                  color: "#23FFDC",
                  fontWeight: 500,
                  fontFamily: "Poppins",
                  fontSize: "20px",
                  padding: "10px",
                  maxWidth: "30%",
                  textTransform: "none",
                  backgroundColor: "#002338",
                  "&:hover": { backgroundColor: "##002338" },
                }}
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      <ModalComponent
        open={dialog.open}
        variant={dialog.variant}
        message={dialog.message ?? ""}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </>
  );
}
