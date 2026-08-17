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
import { Vacante, ColumnConfig } from "@/types/interface";
import { useUser } from "@/app/UserContext";

export default function VacanciesTable({
  searchTerm,
  vacanciesProp,
}: {
  searchTerm: string;
  vacanciesProp: Vacante[];
}) {
  const { user } = useUser();
  const [vacancies, setVacancies] = useState<Vacante[]>(vacanciesProp);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<Vacante | null>(null);
  const [page, setPage] = useState(0);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (user?.rol === "manager") {
      setIsAdmin(false);
      setCurrentUser(user?.name);
    } else if (user?.rol === "administrador") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const fetchTableConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/configuration/columns/${"vacante"}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos del servidor:", data);

        const columnsData = data.columns || [];
        console.log("Columnas extraídas:", columnsData);

        const sortedColumns = [...columnsData].sort(
          (a, b) => a.order - b.order
        );
        setColumns(sortedColumns);
      } catch (error) {
        console.error("Error completo:", error);
        if (error instanceof Error) {
          setError(`Error al obtener las columnas: ${error.message}`);
        } else {
          setError("Error al obtener las columnas");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTableConfig();
  }, [isAdmin]);

  // useEffect(() => {
  //   const fetchVacancies = async () => {
  //     try {
  //       const response = await fetch(
  //         `${
  //           process.env.NEXT_PUBLIC_API_URL
  //         }/vacancie/vacancie?search=${encodeURIComponent(searchTerm)}`
  //       );
  //       if (!response.ok) {
  //         throw new Error(`Error al obtener las vacantes: ${response.status}`);
  //       }

  //       const data: Vacante[] = await response.json();

  //       const filteredVacancies = data.filter((vacante) => !vacante.delete_at);

  //       const vacancies = filteredVacancies.map((item) => ({
  //         ...item,
  //         Nombre: item.Nombre || "",
  //         Vacante: item.Vacante?.trim() || "Vacante sin nombre",
  //         manager_name: item.manager_name || "",
  //         Seniority: item.Seniority || "Sin especificar",
  //         "Fecha de pedido": item["Fecha de pedido"] || "",
  //         "Fecha de inicio": item["Fecha de inicio"] || "",
  //       }));

  //       setVacancies(vacancies);
  //     } catch (error) {
  //       console.error(
  //         "Error al cargar los datos de las vacantes desde la API:",
  //         error
  //       );
  //     }
  //   };

  //   fetchVacancies();
  // }, [searchTerm]);

  useEffect(() => {
    if (searchTerm === "") {
      setVacancies(vacanciesProp);
      return;
    }

    const filteredVacancies = vacanciesProp.filter((vacante) => {
      const normalizedVacanteName = vacante.Vacante.trim().toLowerCase();
      return normalizedVacanteName.includes(searchTerm.toLowerCase());
    });

    let vacanciesAux = filteredVacancies.map((item) => ({
      ...item,
      Nombre: item.Nombre || "",
      Vacante: item.Vacante?.trim() || "Vacante sin nombre",
      manager_name: item.manager_name || "",
      Seniority: item.Seniority || "Sin especificar",
      "Fecha de pedido": item["Fecha de pedido"] || "",
      "Fecha de inicio": item["Fecha de inicio"] || "",
    }));

    setVacancies(vacanciesAux);
  }, [searchTerm]);

  const handleEditClick = (index: number) => {
    const vacante = vacancies[index];
    setEditIndex(index);
    setEditedRow({
      ...vacante,
      Nombre: vacante.Nombre || "",
      Vacante: vacante.Vacante || "",
      manager_name: vacante.manager_name || "",
      Tiempo: typeof vacante.Tiempo === "number" ? vacante.Tiempo : 0,
      "Fecha de pedido": vacante["Fecha de pedido"] || "",
      "Fecha de inicio": vacante["Fecha de inicio"] || "",
      Seniority: vacante.Seniority || "",
    });
  };

  const handleInputChange = (field: keyof Vacante, value: string) => {
    if (editedRow) {
      setEditedRow({ ...editedRow, [field]: value });
    }
  };

  const handleSave = async () => {
    if (editedRow && editIndex !== null) {
      try {
        const authDataRaw = localStorage.getItem("authData");
        const authData = authDataRaw ? JSON.parse(authDataRaw) : null;
        const userName = authData?.user?.name;

        if (!userName) {
          console.error("No se pudo obtener el nombre del usuario");
          return;
        }

        const updatedData = {
          ...editedRow,
          last_edited_by: userName,
          last_edited_on: new Date().toISOString(),
        };

        // Corregida la URL del endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vacancie/editar/${editedRow.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error al actualizar la vacante: ${await response.text()}`
          );
        }

        const result = await response.json();

        if (result.status === "success") {
          const updatedVacancies = [...vacancies];
          updatedVacancies[editIndex] = {
            ...result.vacancie,
            last_edited_by: userName,
            last_edited_on: new Date().toISOString(),
          };

          setVacancies(updatedVacancies);
          setEditIndex(null);
          setEditedRow(null);
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const vacancyToDelete = vacancies.find((vacante) => vacante.id === id);
    if (!vacancyToDelete) {
      console.error("Vacante no encontrada");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la vacante ${vacancyToDelete.Vacante}?`
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vacancie/eliminar/${id}`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          const updatedVacancies = vacancies.filter(
            (vacante) => vacante.id !== id
          );
          setVacancies(updatedVacancies);
        } else {
          console.error("Error al eliminar la vacante en el backend.");
        }
      } catch (error) {
        console.error("Error de conexión al backend:", error);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper
      sx={{
        overflow: "hidden",
        marginLeft: "60px",
        marginRight: "60px",
        borderRadius: "20px",
      }}
    >
      <TableContainer sx={{ maxHeight: 700, borderRadius: "20px" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {isLoading ? (
                <TableCell colSpan={9} align="center">
                  Cargando configuración...
                </TableCell>
              ) : error ? (
                <TableCell colSpan={9} align="center" style={{ color: "red" }}>
                  {error}
                </TableCell>
              ) : columns.length === 0 ? (
                <TableCell colSpan={9} align="center">
                  No se encontraron columnas configuradas
                </TableCell>
              ) : (
                <>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align="center"
                      style={{ fontWeight: "bold", backgroundColor: "#BDE0FF" }}
                    >
                      {column.displayName}
                    </TableCell>
                  ))}
                  {isAdmin && (
                    <TableCell
                      align="left"
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#BDE0FF",
                        textAlign: "center",
                      }}
                    >
                      Acciones
                    </TableCell>
                  )}
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {vacancies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((vacante, index) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={vacante.id}
                  sx={{
                    alingItems: "center",
                    backgroundColor:
                      editIndex === index ? "#FFF8DC" : "inherit",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.Nombre || ""}
                        onChange={(e) =>
                          handleInputChange("Nombre", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      vacante.Nombre
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.Vacante || ""}
                        onChange={(e) =>
                          handleInputChange("Vacante", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                      >
                        <span>{vacante.Vacante}</span>
                        {vacante.last_edited_by && vacante.last_edited_on && (
                          <Tooltip
                            title={`Última modificación por ${
                              vacante.last_edited_by
                            } el ${new Date(
                              vacante.last_edited_on
                            ).toLocaleString("es-ES", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}`}
                          >
                            <IconButton size="small">
                              <Info fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.manager_name || ""}
                        onChange={(e) =>
                          handleInputChange("manager_name", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      vacante.manager_name
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.Tiempo || ""}
                        onChange={(e) =>
                          handleInputChange("Tiempo", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      vacante.Tiempo
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.["Fecha de pedido"] || ""}
                        onChange={(e) =>
                          handleInputChange("Fecha de pedido", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      vacante["Fecha de pedido"]
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.["Fecha de inicio"] || ""}
                        onChange={(e) =>
                          handleInputChange("Fecha de inicio", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      vacante["Fecha de inicio"]
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editIndex === index ? (
                      <TextField
                        value={editedRow?.Seniority || ""}
                        onChange={(e) =>
                          handleInputChange("Seniority", e.target.value)
                        }
                        size="small"
                      />
                    ) : (
                      vacante.Seniority
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      {isAdmin || vacante.manager_name === currentUser ? ( // Validación específica
                        <>
                          <IconButton
                            onClick={
                              editIndex === index
                                ? handleSave
                                : () => handleEditClick(index)
                            }
                          >
                            {editIndex === index ? <Save /> : <Edit />}
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(vacante.id)}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#999" }}>
                          No permitido
                        </span>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage="Filas por página"
        rowsPerPageOptions={[4, 10, 20]}
        component="div"
        count={vacancies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
