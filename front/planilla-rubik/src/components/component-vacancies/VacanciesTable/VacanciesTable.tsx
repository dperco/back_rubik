
"use client";

import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Box,
  Tooltip,
} from "@mui/material";
import { Edit, Save, Delete, Info } from "@mui/icons-material";
import { Vacante } from "@/types/interface";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import { useColumns } from "@/app/hooks/useColumns";
import { editVacancy, deleteVacancy } from "@/services/api";


interface Props {
  searchTerm: string;
  vacanciesProp: Vacante[];
}

export default function VacanciesTable({ searchTerm, vacanciesProp }: Props) {
  const { isAdmin, currentUser } = useAuthRole();
  const {
    columns,
    loading: loadingColumns,
    error: errorColumns,
  } = useColumns("vacante");

  const [vacancies, setVacancies] = useState<Vacante[]>(
    vacanciesProp.map(v => normalizeVacante(v))
  );
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<Vacante | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);


  function normalizeVacante(v: any) {
    return {
      ...v,
      Nombre: v.Nombre ?? "",
      Vacante: v.Vacante?.trim() || "Vacante sin nombre",
      manager_name: v.manager_name ?? "",
      Seniority: v.Seniority ?? "Sin especificar",
      "Fecha de pedido": v["Fecha de pedido"] ?? "",
      "Fecha de inicio": v["Fecha de inicio"] ?? "",
    };
  }

  /** Filtrado local según searchTerm */
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVacancies(vacanciesProp.map(v => normalizeVacante(v)));
      return;
    }

    const filtered = vacanciesProp.filter(v =>
      v.Vacante.trim().toLowerCase().includes(searchTerm.toLowerCase())
    );

    setVacancies(filtered.map(v => normalizeVacante(v)));
  }, [searchTerm, vacanciesProp]);

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedRow({ ...vacancies[index] });
  };

  const handleInputChange = (field: keyof Vacante, value: string) => {
    if (editedRow) setEditedRow({ ...editedRow, [field]: value });
  };

  const handleSave = async () => {
    if (editedRow && editIndex !== null) {
      const { id, ...payload } = editedRow;
      const userName = currentUser ?? "unknown";
      const result = await editVacancy(id!, {
        ...payload,
        last_edited_by: userName,
        last_edited_on: new Date().toISOString(),
      });
      const updated = [...vacancies];
      updated[editIndex] = normalizeVacante(result.vacancie);
      setVacancies(updated);
      setEditIndex(null);
      setEditedRow(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta vacante?")) return;
    await deleteVacancy(id);
    setVacancies(vacancies.filter(v => v.id !== id));
  };

  const paginated = vacancies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ overflow: "hidden", mx: 8, borderRadius: 3 }}>
      <TableContainer sx={{ maxHeight: 700 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {loadingColumns ? (
                <TableCell colSpan={9} align="center">
                  Cargando configuración...
                </TableCell>
              ) : errorColumns ? (
                <TableCell colSpan={9} align="center" sx={{ color: "red" }}>
                  {errorColumns}
                </TableCell>
              ) : columns.length === 0 ? (
                <TableCell colSpan={9} align="center">
                  No se encontraron columnas configuradas
                </TableCell>
              ) : (
                <>
                  {columns.map(col => (
                    <TableCell
                      key={col.field}
                      align="center"
                      sx={{ fontWeight: "bold", bgcolor: "#BDE0FF" }}
                    >
                      {col.displayName}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", bgcolor: "#BDE0FF" }}
                  >
                    Acciones
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((vacante, index) => (
                <TableRow
                  hover
                  key={vacante.id}
                  sx={{ bgcolor: editIndex === index ? "#FFF8DC" : undefined }}
                >
                  {columns.map(col => (
                    <TableCell key={col.field} align="center">
                      {editIndex === index ? (
                        <TextField
                          size="small"
                          value={(editedRow as any)[col.field] ?? ""}
                          onChange={e =>
                            handleInputChange(col.field as keyof Vacante, e.target.value)
                          }
                        />
                      ) : (
                        (vacante as any)[col.field]
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      {(isAdmin || vacante.manager_name === currentUser) && (
                        <>
                          <IconButton
                            onClick={
                              editIndex === index ? handleSave : () => handleEditClick(index)
                            }
                          >
                            {editIndex === index ? <Save /> : <Edit />}
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(vacante.id!)}>
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[4, 10, 20]}
        component="div"
        count={vacancies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
}
