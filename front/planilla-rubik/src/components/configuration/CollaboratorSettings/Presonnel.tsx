"use client";

import { useEffect, useState } from "react";
import {
  getPersonnel,
  getBasicFields,
  getExtraFields,
} from "@/services/api"; 

import PersonnelModal from "./PersonnelModal";

/* MUI */
import {
  Box,
  Button,
  IconButton,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

export default function PersonnelPage() {
  /* Estado de datos */
  const [people, setPeople] = useState<any[]>([]);
  const [basic, setBasic] = useState<any[]>([]);
  const [extra, setExtra] = useState<any[]>([]);

  /* Loading flags */
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);

  /* Modal */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | undefined>(undefined);

  /* Cargar datos al montar */
  useEffect(() => {
    (async () => {
      setLoadingFields(true);
      const [b, e] = await Promise.all([getBasicFields(), getExtraFields()]);
      console.log("Basic fields:", b);
      console.log("Extra fields:", e);
      
      setBasic(b);
      setExtra(e);
      setLoadingFields(false);
    })();

    loadPeople();
  }, []);

  /* Helper para recargar personal */
  const loadPeople = async () => {
    setLoadingPeople(true);
    const data = await getPersonnel();
    setPeople(data);
    setLoadingPeople(false);
  };

  /* Columnas (básicas + extra) */
  const cols = [...basic, ...extra];

  /* Cerrar modal */
  const handleClose = () => {
    setOpen(false);
    setEditing(undefined);
  };

  return (
    <Box p={3}>
      {/* Botón agregar */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
      >
        Agregar personal
      </Button>

      {/* Tabla */}
      {loadingPeople || loadingFields ? (
        <CircularProgress size={24} />
      ) : (
        <TableContainer sx={{ maxHeight: 700, borderRadius: "20px" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <TableCell
                key={c.key}
                align="center"
                style={{
                  backgroundColor: "#BDE0FF",
                  textAlign: "center",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  fontSize: "16.16px",
                  color: "#000000",
                }}
              >
                  {c.label}
                </TableCell>
              ))}
              <TableCell />{/* Acciones */}
            </TableRow>
          </TableHead>

          <TableBody>
            {people.map((p) => (
              <TableRow  
              hover key={p._id}>
                {cols.map((c) => {
                  const raw = p.extraData?.[c.key] ?? p[c.key];
                  const val =
                    c.type === "boolean"
                      ? raw
                        ? "✔️"
                        : ""
                      : Array.isArray(raw)
                      ? raw.join(", ")
                      : raw ?? "";
                  return <TableCell  align="center" key={c.key}>{val}</TableCell>;
                })}

                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditing(p);
                      setOpen(true);
                    }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!people.length && (
              <TableRow>
                <TableCell colSpan={cols.length + 1}>
                  <Typography variant="body2" color="text.secondary">
                    No hay personal cargado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </TableContainer>
      )}

      {/* Modal alta / edición */}
      <PersonnelModal
        open={open}
        onClose={handleClose}
        onSaved={loadPeople}   /* refresca lista tras guardar */
        basic={basic}
        extra={extra}
        editRecord={editing}
      />
    </Box>
  );
}
