"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Button,
  Typography,
  Paper,
  Slider,
  Checkbox,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SelectChangeEvent } from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import ModalComponent from "@/components/message/MessageModal";
import { fetchProjects, fetchTechnologies, fetchAddColab } from "@/services/api";
interface Project {
  _id: string;
  name: string;
  delete_at?: string;
}
interface Tecnologia {
  _id: string;
  name: string;
}


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } },
};


export default function Colaboradores({ onClose }: { onClose: () => void }) {
  const [dialog, setDialog] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning";
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "success" });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));
  const showDialog = (
    variant: "success" | "error" | "warning",
    message?: string,
    onConfirm?: () => void
  ) => setDialog({ open: true, variant, message, onConfirm });
  const [data, setData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    estado: "",
    puesto_trabajo: "",
    seniority: "",
    tecnologias: [] as string[],
    fin_contrato: "",
    proyectos: [] as string[],
  });

  const [tecnologiasDisponibles, setTecnologiasDisponibles] = useState<Tecnologia[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  type Asignacion = { rol: string; horas: number; tech?: string };
  const [asignaciones, setAsignaciones] = useState<Record<string, Asignacion>>({});

  useEffect(() => {
    async function loadProjects() {
      try {
        const pjDocs = await fetchProjects();
        setProjects(pjDocs);
      } catch (err) {
        showDialog("error", "Error al cargar proyectos: " + err);
      }
    }
    loadProjects();
  }, []);

  // Carga tecnologías desde el servicio
  useEffect(() => {
    async function loadTechnologies() {
      try {
        const techDocs = await fetchTechnologies();
        setTecnologiasDisponibles(techDocs);
      } catch (err) {
        showDialog("error", "Error al cargar tecnologías: " + err);
      }
    }
    loadTechnologies();
  }, []);

  const set = (k: keyof typeof data) => (v: any) => setData(prev => ({ ...prev, [k]: v }));

  const handleMultipleChange = (e: SelectChangeEvent<string[]>, k: "tecnologias" | "proyectos") => {
    const value = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
    set(k)(value);

    if (k === "proyectos") {
      setAsignaciones(prev => {
        const next: Record<string, Asignacion> = { ...prev };
        value.forEach(p => (next[p] ??= { rol: "", horas: 0 }));
        Object.keys(next).forEach(p => { if (!value.includes(p)) delete next[p]; });
        return next;
      });
    }
  };

  const handleAsignacionChange = (proj: string, field: keyof Asignacion, v: any) =>
    setAsignaciones(prev => ({ ...prev, [proj]: { ...prev[proj], [field]: v } }));

  const handleSubmit = async () => {
    try {
      const Proyectos = data.proyectos.map((nombre) => {
        const a = asignaciones[nombre] ?? { rol: "", horas: 0 };
        return {
          Proyectos: nombre,
          rol: a.rol,
          tecnologías: a.tech,
          horasAsignadas: a.horas,
        };
      });

      const payload = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        puesto_trabajo: data.puesto_trabajo,
        rol: data.puesto_trabajo,
        estado: data.estado ?? "",
        seniority: data.seniority,
        tecnologias: data.tecnologias,
        Proyectos,
        horasAsignadas:
          Proyectos.length ? Proyectos.reduce((s, p) => s + p.horasAsignadas, 0) : 0,
        fin_contrato: data.fin_contrato || null,
      };

      const resp = await fetchAddColab(payload);
      if(resp.status === "success"){
        showDialog("success", resp.message);
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      showDialog("error", "Error inesperado" + (err || ""));
    }
  };
  const handleTechChange = (proj: string, tech: string) =>
    setAsignaciones(prev => ({ ...prev, [proj]: { ...prev[proj], tech } }));


  return (
    <>
      <Box sx={{
        display: "flex", justifyContent: "center", maxHeight: "590px",        // alto máximo
        overflowY: "auto",
        overflowX: "hidden",
        width: "982px",
        marginTop: "8.5px",
        marginLeft: "8.5px",
      }}>
        <Paper sx={{ width: "100%", maxHeight: "85vh", overflow: "auto", boxShadow: "none", }}>
          <Typography variant="h6" gutterBottom textAlign="left"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "20px",
            }}>
            Nuevo Colaborador
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={10} md={4}>
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

                label="DNI*"
                type="number"
                fullWidth
                size="small"
                value={data.id}
                onChange={e => set("id")(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                label="Nombre"
                fullWidth
                size="small"
                value={data.first_name}
                onChange={e => set("first_name")(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                label="Apellido"
                fullWidth
                size="small"
                value={data.last_name}
                onChange={e => set("last_name")(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                label="Email"
                fullWidth
                size="small"
                value={data.email}
                onChange={e => set("email")(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }} fullWidth size="small">
                <InputLabel id="puesto-label">Puesto de trabajo</InputLabel>
                <Select
                  labelId="puesto-label"
                  id="puesto-trabajo"
                  label="Puesto de trabajo"
                  value={data.puesto_trabajo}
                  onChange={(e) => set("puesto_trabajo")(e.target.value)}
                >
                  <MenuItem value=""><em>—</em></MenuItem>
                  {["Dev.Full Stack", "Dev.Frontend", "Dev.Backend", "Analista de calidad(QA)", "Flutter", "Diseñador UX/UI", "RRHH", "Manager", "Arquitecto", "Analista de Marketing", "Analista Funcional", "DEVOPS", "Manager RRHH", "Analista RRHH", "CEO"].map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }} size="small" fullWidth>
                <InputLabel>Seniority</InputLabel>
                <Select
                  value={data.seniority}
                  onChange={e => set("seniority")(e.target.value)}
                  label="Seniority"
                >
                  {["-", "Senior", "Semi Senior", "Junior Advanced", "Junior", "Trainee"].map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }} size="small" fullWidth>
                <InputLabel id="estado-label">Modalidad</InputLabel>
                <Select
                  labelId="estado-label"
                  name="estado"
                  value={data.estado}
                  onChange={e => set("estado")(e.target.value)}
                >
                  <MenuItem value="Tiempo Completo">Tiempo Completo</MenuItem>
                  <MenuItem value="Medio Tiempo">Medio Tiempo</MenuItem>
                  <MenuItem value="Pasante">Pasante</MenuItem>

                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }} size="small" fullWidth>
                <InputLabel>Tecnologías</InputLabel>
                <Select
                  multiple
                  value={data.tecnologias}
                  onChange={(e) => handleMultipleChange(e, "tecnologias")}
                  input={<OutlinedInput label="Tecnologías" />}
                  renderValue={(selected) => {
                    if (selected.length === 0) return null;
                    const visibles = selected.slice(0, 2).join(", ");
                    const resto = selected.length - 2;

                    return resto > 0 ? `${visibles} +${resto}` : visibles;
                  }}
                  displayEmpty
                  MenuProps={MenuProps}
                >
                  {tecnologiasDisponibles.map(tech => (
                    <MenuItem key={tech._id} value={tech.name}>
                      <Checkbox checked={data.tecnologias.includes(tech.name)} />
                      <ListItemText primary={tech.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl sx={{
                height: "40px",
                borderRadius: "20px",
                border: "1px solid #002338",
                "& .MuiInputLabel-root.Mui-focused": { color: "black" },
              }} size="small" fullWidth>
                <InputLabel>Project(s)</InputLabel>
                <Select
                  multiple
                  value={data.proyectos}
                  onChange={e => handleMultipleChange(e, "proyectos")}
                  input={<OutlinedInput label="Project(s)" />}
                  renderValue={(selected) => {
                    if (selected.length === 0) return null;
                    const visibles = selected.slice(0, 2).join(", ");
                    const resto = selected.length - 2;

                    return resto > 0 ? `${visibles} +${resto}` : visibles;
                  }}
                  displayEmpty
                  MenuProps={MenuProps}
                >
                  {projects.map((p) => (
                    <MenuItem key={p._id} value={p.name}>
                      <Checkbox
                        checked={data.proyectos.includes(p.name)}
                        sx={{ mr: 1 }}
                      />
                      <ListItemText primary={p.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                sx={{
                  height: "40px",
                  borderRadius: "20px",
                  border: "1px solid #002338",
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" }
                }} size="small"
                InputProps={{
                  sx: {
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    pl: "18px",
                  },
                }}
                label="Fin de contrato"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={data.fin_contrato}
                onChange={e => set("fin_contrato")(e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", marginBottom: "40px" }}>
            <Box sx={{ marginRight: "24px" }}>
              {data.tecnologias.length > 0 && (
                <>
                  <Box sx={{ display: "flex", alignItems: "left", }}>
                    <Typography sx={{
                      mt: 2, mb: .5, fontWeight: 600,
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      color: "#002338",
                    }}>
                      Tecnologías
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75 }}>
                    {data.tecnologias.map((tech, idx) => (
                      <Chip
                        key={`${tech}-${idx}`}
                        label={tech}
                        size="small"
                        onDelete={() =>
                          setData((prev) => ({
                            ...prev,
                            tecnologias: prev.tecnologias.filter((t) => t !== tech),
                          }))
                        }
                        deleteIcon={<Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            bgcolor: "#D40000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14, color: "white", }} />
                        </Box>

                        }
                        sx={{
                          bgcolor: "#E8ECEF",
                          borderRadius: "9999px",
                          height: 30,
                          fontFamily: "Poppins",
                          fontSize: 12,
                          fontWeight: 300,
                          marginRight: "4px",
                          marginBottom: "4px",
                          color: "#002338",
                          textTransform: "none",
                          letterSpacing: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
            <Box>
              {data.proyectos.length > 0 && (
                <>
                  <Box sx={{ display: "flex", alignItems: "left", }}>
                    <Typography sx={{ mt: 2, mb: 0.5, fontWeight: 600 }}>
                      Proyectos
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {data.proyectos.map((proj) => (
                      <Chip
                        key={proj}
                        label={proj}
                        onDelete={() =>
                          setData((prev) => ({
                            ...prev,
                            proyectos: prev.proyectos.filter((p) => p !== proj),
                          }))
                        }
                        deleteIcon={<Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            bgcolor: "#D40000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14, color: "white", }} />
                        </Box>

                        }
                        sx={{
                          bgcolor: "#E8ECEF",
                          borderRadius: "9999px",
                          height: 30,
                          px: 1,
                          fontFamily: "Poppins",
                          fontSize: 12,
                          marginRight: "4px",
                          marginBottom: "4px",
                          fontWeight: 300,
                          color: "#002338",
                          textTransform: "none",
                          letterSpacing: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Box>








          {data.proyectos.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: "bold" }}>
                Asignación de proyectos
              </Typography>

              {data.proyectos.map(nombre => (
                <Paper key={nombre} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold" mb={1}>
                    {nombre}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Tecnología</InputLabel>
                        <Select
                          sx={{
                            borderRadius: "20px",
                            color: "black",
                            border: "1px solid #002338",
                            height: "40px",
                          }}
                          value={asignaciones[nombre]?.tech ?? ""}
                          onChange={(e) =>
                            handleTechChange(nombre, e.target.value as string)
                          }
                          label="Tecnología"
                          MenuProps={MenuProps}
                        >
                          {data.tecnologias.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                          sx={{
                            borderRadius: "20px",
                            color: "black",
                            border: "1px solid #002338",
                            height: "40px",
                          }}
                          value={asignaciones[nombre]?.rol ?? ""}
                          onChange={(e) =>
                            handleAsignacionChange(nombre, "rol", e.target.value)
                          }
                          label="Rol"
                        >
                          <MenuItem value="">
                            <em>—</em>
                          </MenuItem>
                          {[
                            "Full Stack",
                            "Frontend",
                            "Backend",
                            "QA",
                            "Flutter",
                            "UX/UI",
                            "RRHH",
                            "Manager",
                            "Devops",
                          ].map((r) => (
                            <MenuItem key={r} value={r}>
                              {r}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="body2">
                            Horas asignadas (%)
                          </Typography>
                        </Grid>
                        <Grid item xs>
                          <Slider
                            min={0}
                            max={160}
                            step={10}
                            value={asignaciones[nombre]?.horas ?? 0}
                            onChange={(_, v) =>
                              handleAsignacionChange(nombre, "horas", v as number)
                            }
                            valueLabelDisplay="auto"
                            sx={{ mt: 1, mr: 2 }}
                          />
                        </Grid>
                        <Grid item>
                          <Typography fontWeight="bold" width={60} textAlign="right">
                            {asignaciones[nombre]?.horas ?? 0} hs
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </>
          )}

          <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
            <Button
              variant="contained"

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
                paddingTop: "13px",
                paddingRight: "41px",
                paddingBottom: "13px !important",
                paddingLeft: "41px !important",
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
        </Paper >
      </Box >
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
