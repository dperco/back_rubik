import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  IconButton,
  Collapse,
  Typography,
} from "@mui/material";
import { Edit, Delete, ExpandMore } from "@mui/icons-material";
import { Employee, ColumnConfigColaborador } from "@/types/interface";
import { useUser } from "@/app/UserContext";

const EmployeeTable = ({
  searchTerm,
  collaboratorProp,
  columnsprop,
}: {
  columnsprop: any;
  searchTerm: string;
  collaboratorProp: any;
}) => {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<Employee | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [columns, setColumns] = useState<ColumnConfigColaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [openTech, setOpenTech] = useState<Record<string, boolean>>({});
  const [openProj, setOpenProj] = useState<Record<string, boolean>>({});
 const [openRoles, setOpenRoles] = useState<Record<string, boolean>>({});
  const router = useRouter();
  useEffect(() => {
    if (user?.rol === "manager") {
      setIsAdmin(false);
    } else if (user?.rol === "administrador") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    setIsLoading(false);
    setColumns(columnsprop);
  }, [isAdmin, columnsprop]);

  useEffect(() => {
    const updatedEmployees = collaboratorProp
      .filter((employee: Employee) => !employee.delete_at)
      .map((employee: Employee) => ({
        ...employee,
        estado: employee.estado?.trim() || "",
      }));
    setEmployees(updatedEmployees);
  }, [collaboratorProp]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - (tableContainerRef.current?.offsetLeft || 0));
    setScrollLeft(tableContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (tableContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1;
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedRow({ ...employees[index] });
  };

  const handleSave = async () => {};

  const handleDelete = async (id: number) => {};

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const toggleTech = (id: number) =>
    setOpenTech((p) => ({ ...p, [id]: !p[id] }));

  const toggleProj = (id: number) =>
    setOpenProj((p) => ({ ...p, [id]: !p[id] }));
  return (
    <Paper
      sx={{
        overflow: "hidden",
        marginLeft: "60px",
        marginRight: "60px",
        borderRadius: "20px",
      }}
    >
      <TableContainer
        component={Paper}
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        sx={{ maxHeight: 700, borderRadius: "20px" }}
      >
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
                      sx={{
                        backgroundColor: "#BDE0FF",
                        textAlign: "center",
                        fontWeight: "500",
                        fontFamily: "Poppins",
                        fontSize: "16.16px",
                        color: "#000000DE",
                      }}
                    >
                      {column.displayName}
                    </TableCell>
                  ))}
                  {isAdmin && (
                    <TableCell
                      align="left"
                      sx={{
                        backgroundColor: "#BDE0FF",
                        textAlign: "center",
                        fontWeight: "500",
                        fontFamily: "Poppins",
                        fontSize: "16.16px",
                        color: "#000000DE",
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
            {employees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee, index) => (
                <TableRow key={employee.id}>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        Size: "16.16px",
                        fontFamily: "Roboto",
                        fontWeight: 400,
                        color: "#000000DE",
                        textAlign: "center",
                      }}
                    >
                      {employee.email}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ p: 0, minWidth: "220px", maxWidth: "320px" }}
                  >
                    {employee.Proyectos?.length ? (
                      <Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          sx={{
                            cursor: "pointer",
                          }}
                          justifyContent="center"
                          onClick={() => toggleProj(employee.id)}
                        >
                          <Typography
                            sx={{
                              fontSize: "16.16px",
                              fontFamily: "Roboto",
                              fontWeight: 400,
                              color: "#000000DE",
                              textAlign: "center",
                            }}
                          >
                            {employee.Proyectos[0]?.Proyectos || "-"}
                            {Array.isArray(employee.Proyectos) &&
                              employee.Proyectos.length > 1 && (
                                <ExpandMore
                                  sx={{
                                    ml: 0.5,
                                    transform: openProj[employee.id]
                                      ? "rotate(180deg)"
                                      : "none",
                                    transition: "transform .2s",
                                  }}
                                />
                              )}
                          </Typography>
                        </Box>

                        <Collapse in={openProj[employee.id]} unmountOnExit>
                          {Array.isArray(employee.Proyectos) &&
                          employee.Proyectos.length ? (
                            employee.Proyectos.slice(1).map(
                              ({ Proyectos: nombre }, i) => (
                                <Typography
                                  sx={{
                                    Size: "16.16px",
                                    fontFamily: "Roboto",
                                    fontWeight: 400,
                                    color: "#000000DE",
                                    textAlign: "center",
                                  }}
                                  key={i}
                                >
                                  {nombre}
                                </Typography>
                              )
                            )
                          ) : (
                            <p>-</p>
                          )}
                        </Collapse>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ p: 0, minWidth: "220px", maxWidth: "320px" }}
                  >
                    {employee.roles && employee.roles.length > 0 ? (
                      <Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          sx={{
                            cursor:
                              employee.roles.length > 1 ? "pointer" : "default",
                          }}
                          justifyContent="center"
                          onClick={
                            employee.roles.length > 1
                              ? () =>
                                  setOpenRoles((prev) => ({
                                    ...prev,
                                    [employee.id]: !prev[employee.id],
                                  }))
                              : undefined
                          }
                        >
                          <Typography
                            sx={{
                              fontSize: "16.16px",
                              fontFamily: "Roboto",
                              fontWeight: 400,
                              color: "#000000DE",
                              textAlign: "center",
                            }}
                          >
                            {employee.roles[0].rol} -{" "}
                            {employee.roles[0].seniority}
                            {employee.roles.length > 1 && (
                              <ExpandMore
                                sx={{
                                  ml: 0.5,
                                  transform: openRoles[employee.id]
                                    ? "rotate(180deg)"
                                    : "none",
                                  transition: "transform .2s",
                                }}
                              />
                            )}
                          </Typography>
                        </Box>
                        <Collapse in={openRoles[employee.id]} unmountOnExit>
                          {employee.roles.slice(1).map((r, i) => (
                            <Typography
                              sx={{
                                fontSize: "16.16px",
                                fontFamily: "Roboto",
                                fontWeight: 400,
                                color: "#000000DE",
                                textAlign: "center",
                              }}
                              key={i}
                            >
                              {r.rol} - {r.seniority}
                            </Typography>
                          ))}
                        </Collapse>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ p: 0 }}>
                    {employee.tecnologias?.length ? (
                      <Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          onClick={() => toggleTech(employee.id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <Typography
                            sx={{
                              fontSize: "16.16px",
                              fontFamily: "Roboto",
                              fontWeight: 400,
                              color: "#000000DE",
                              textAlign: "center",
                            }}
                          >
                            {employee.tecnologias[0]}
                            {Array.isArray(employee.tecnologias) &&
                              employee.tecnologias.length > 1 && (
                                <ExpandMore
                                  sx={{
                                    ml: 0.5,
                                    transform: openTech[employee.id]
                                      ? "rotate(180deg)"
                                      : "none",
                                    transition: "transform .2s",
                                  }}
                                />
                              )}
                          </Typography>
                        </Box>

                        <Collapse in={openTech[employee.id]} unmountOnExit>
                          {employee.tecnologias.slice(1).map((t) => (
                            <div key={t}>{t}</div>
                          ))}
                        </Collapse>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        Size: "16.16px",
                        fontFamily: "Roboto",
                        fontWeight: 400,
                        color: "#000000DE",
                        textAlign: "center",
                      }}
                    >
                      {employee.estado}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        Size: "16.16px",
                        fontFamily: "Roboto",
                        fontWeight: 400,
                        color: "#000000DE",
                        textAlign: "center",
                      }}
                    >
                      {employee.HorasAsignadas}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        Size: "16.16px",
                        fontFamily: "Roboto",
                        fontWeight: 400,
                        color: "#000000DE",
                        textAlign: "center",
                      }}
                    >
                      {employee.fin_contrato
                        ? typeof employee.fin_contrato === "string"
                          ? employee.fin_contrato
                          : employee.fin_contrato.toLocaleDateString()
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      <>
                        <IconButton
                          onClick={() => {
                            router.push(`/pages/edit/employe/${employee.id}`);
                          }}
                        >
                          {editIndex === index ? <Edit /> : <Edit />}
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
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
        count={employees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default EmployeeTable;
