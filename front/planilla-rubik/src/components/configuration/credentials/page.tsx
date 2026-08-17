"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Card,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Delete, Save, Edit } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {User} from "@/types/interface";

const Credentials: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<{ [email: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [email: string]: string }>({});
  const [anchorEls, setAnchorEls] = useState<{
    [email: string]: HTMLElement | null;
  }>({});
  const [statusAnchorEls, setStatusAnchorEls] = useState<{
    [email: string]: HTMLElement | null;
  }>({});
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/prueba`
        );
        if (!response.ok) throw new Error("Error al obtener los usuarios");
        const data: User[] = await response.json();
        const activeUser = data.filter((user) => !user.delete_at);

        setUsers(activeUser);

        const initialRoles: { [email: string]: string } = {};
        const initialStatuses: { [email: string]: string } = {};
        data.forEach((user) => {
          initialRoles[user.email] = user.rol;
          initialStatuses[user.email] = user.status;
        });

        setRoles(initialRoles);
        setStatuses(initialStatuses);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (email: string, newRole: string) => {
    setRoles((prev) => ({ ...prev, [email]: newRole }));
    handleCloseMenu(email);
  };

  const handleStatusChange = (email: string, newStatus: string) => {
    setStatuses((prev) => ({ ...prev, [email]: newStatus }));
    handleCloseStatusMenu(email);
  };

  const handleOpenMenu = (
    email: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEls((prev) => ({ ...prev, [email]: event.currentTarget }));
  };

  const handleOpenStatusMenu = (
    email: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setStatusAnchorEls((prev) => ({ ...prev, [email]: event.currentTarget }));
  };

  const handleCloseMenu = (email: string) => {
    setAnchorEls((prev) => ({ ...prev, [email]: null }));
  };

  const handleCloseStatusMenu = (email: string) => {
    setStatusAnchorEls((prev) => ({ ...prev, [email]: null }));
  };

  interface UpdateUserResponse {
    user: User;
    message: string;
  }

  const updateUser = async (
    email: string,
    newRole: string,
    newStatus: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update/${email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rol: newRole, status: newStatus }),
        }
      );

      const data: UpdateUserResponse = await response.json();

      if (response.ok) {
        console.log("Usuario actualizado con éxito:", data.user);

        // Mostrar el Snackbar con el mensaje de éxito
        setSnackbarSeverity("success");
        setSnackbarMessage("Guardado exitosamente");
        setOpenSnackbar(true);

        // Cerrar el Snackbar después de 3 segundos
        setTimeout(() => {
          setOpenSnackbar(false);
        }, 3000);
      } else {
        console.error("Error al actualizar usuario:", data);
        setSnackbarSeverity("error");
        setSnackbarMessage("Error al actualizar el usuario");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error en la solicitud");
      setOpenSnackbar(true);
    }
  };

  const deleteUser = async (email: string): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/delete/${email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado local eliminando el usuario
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.email !== email)
        );

        // Actualizar los estados de roles y status
        setRoles((prevRoles) => {
          const newRoles = { ...prevRoles };
          delete newRoles[email];
          return newRoles;
        });

        setStatuses((prevStatuses) => {
          const newStatuses = { ...prevStatuses };
          delete newStatuses[email];
          return newStatuses;
        });

        // Mostrar mensaje de éxito
        setSnackbarSeverity("success");
        setSnackbarMessage("Usuario eliminado con éxito");
        setOpenSnackbar(true);
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar usuario:", errorData);
        setSnackbarSeverity("error");
        setSnackbarMessage("Error al eliminar el usuario");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error en la solicitud de eliminación:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error en la solicitud de eliminación");
      setOpenSnackbar(true);
    }
  };

  const handleDeleteClick = (email: string) => {
    if (!isEditMode) return;
    setUserToDelete(email);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const saveAllChanges = () => {
    // Guardar todos los cambios para todos los usuarios
    users.forEach((user) => {
      updateUser(user.email, roles[user.email], statuses[user.email]);
    });
    setIsEditMode(false);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "Activo";
      case "pending":
        return "Pendiente";
      case "denied":
        return "Denegado";
      default:
        return status;
    }
  };

  return (
    <Card
      sx={{
        width: "96%",
        maxWidth: "1200px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        mt: "-20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Configura tus credenciales
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Usuarios y roles activos
          </Typography>
        </Box>

        {isEditMode ? (
          <Button
            variant="contained"
            onClick={saveAllChanges}
            sx={{
              bgcolor: "#002851",
              color: "white",
              borderRadius: "8px",
              textTransform: "none",
              padding: "8px 24px",
              fontWeight: "medium",
              "&:hover": { bgcolor: "#001c3d" },
            }}
          >
            Guardar
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={toggleEditMode}
            sx={{
              bgcolor: "#00ffcc",
              color: "black",
              borderRadius: "8px",
              textTransform: "none",
              padding: "8px 24px",
              fontWeight: "medium",
              "&:hover": { bgcolor: "#00e6b8" },
            }}
          >
            Editar
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ padding: "16px" }}>
          <Card
            sx={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
            }}
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ backgroundColor: "transparent" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#eaeaea" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#444",
                        padding: "16px",
                      }}
                    >
                      Nombre y apellido
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#444",
                        padding: "16px",
                      }}
                    >
                      Mail
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#444",
                        padding: "16px",
                      }}
                    >
                      Rol
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#444",
                        padding: "16px",
                      }}
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#444",
                        padding: "16px",
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index} sx={{ backgroundColor: "white" }}>
                      <TableCell sx={{ padding: "16px" }}>
                        {user.name}
                      </TableCell>
                      <TableCell sx={{ padding: "16px" }}>
                        {user.email}
                      </TableCell>
                      <TableCell sx={{ padding: "16px" }}>
                        {isEditMode ? (
                          <>
                            <Button
                              variant="outlined"
                              onClick={(e) => handleOpenMenu(user.email, e)}
                              endIcon={<ArrowDropDownIcon />}
                              sx={{
                                backgroundColor: "#ffffff",
                                borderColor: "#E0E0E0",
                                borderRadius: "8px",
                                textTransform: "none",
                                color: "#444",
                                "&:hover": {
                                  backgroundColor: "#f5f5f5",
                                  borderColor: "#BDBDBD",
                                },
                              }}
                            >
                              {roles[user.email]}
                            </Button>
                            <Menu
                              anchorEl={anchorEls[user.email]}
                              open={Boolean(anchorEls[user.email])}
                              onClose={() => handleCloseMenu(user.email)}
                            >
                              {["administrador", "manager", "visitante"].map(
                                (role) => (
                                  <MenuItem
                                    key={role}
                                    onClick={() =>
                                      handleRoleChange(user.email, role)
                                    }
                                    selected={roles[user.email] === role}
                                  >
                                    {role}
                                  </MenuItem>
                                )
                              )}
                            </Menu>
                          </>
                        ) : (
                          <Typography>{roles[user.email]}</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ padding: "16px" }}>
                        {isEditMode ? (
                          <>
                            <Button
                              variant="outlined"
                              onClick={(e) =>
                                handleOpenStatusMenu(user.email, e)
                              }
                              endIcon={<ArrowDropDownIcon />}
                              sx={{
                                backgroundColor: "#ffffff",
                                borderColor: "#E0E0E0",
                                borderRadius: "8px",
                                textTransform: "none",
                                color: "#444",
                                "&:hover": {
                                  backgroundColor: "#f5f5f5",
                                  borderColor: "#BDBDBD",
                                },
                              }}
                            >
                              {getStatusLabel(statuses[user.email])}
                            </Button>
                            <Menu
                              anchorEl={statusAnchorEls[user.email]}
                              open={Boolean(statusAnchorEls[user.email])}
                              onClose={() => handleCloseStatusMenu(user.email)}
                            >
                              {[
                                { value: "active", label: "Activo" },
                                { value: "pending", label: "Pendiente" },
                                { value: "denied", label: "Denegado" },
                              ].map((status) => (
                                <MenuItem
                                  key={status.value}
                                  onClick={() =>
                                    handleStatusChange(user.email, status.value)
                                  }
                                  selected={
                                    statuses[user.email] === status.value
                                  }
                                >
                                  {status.label}
                                </MenuItem>
                              ))}
                            </Menu>
                          </>
                        ) : (
                          <Typography>
                            {getStatusLabel(statuses[user.email])}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ padding: "16px" }}>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteClick(user.email)}
                          sx={{
                            color: isEditMode ? "red" : "#9e9e9e",
                            cursor: isEditMode ? "pointer" : "default",
                            "&:hover": {
                              backgroundColor: isEditMode
                                ? "rgba(255, 0, 0, 0.08)"
                                : "transparent",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* Dialog de confirmación para eliminar usuario */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar usuario?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas
            eliminar a este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{
              color: "#444",
              textTransform: "none",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              bgcolor: "#00ffcc",
              color: "#000",
              textTransform: "none",
              "&:hover": {
                bgcolor: "darkred",
              },
            }}
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {snackbarSeverity === "success" && (
              <Save sx={{ color: "green", marginRight: "10px" }} />
            )}
            <Typography>{snackbarMessage}</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default Credentials;
