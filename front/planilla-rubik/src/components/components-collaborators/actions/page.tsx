import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Save,
  Delete,
  Visibility,
  AddCircle,
} from "@mui/icons-material";

interface EmployeeActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onAddProject: () => void;
  onDelete: () => void;
  employeeId: string;
  first_name: string;
  last_name: string;
  last_edited_on: string;
  initialObservation?: number;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  isEditing,
  onEdit,
  onAddProject,
  onDelete,
  employeeId,
  first_name,
  last_name,
  last_edited_on,
  initialObservation = 70,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [score, setScore] = useState(initialObservation.toString());

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

const addproject = () => {
  onAddProject();
};

  const handleSaveObservation = async () => {
    try {
      const authDataRaw = localStorage.getItem("authData");
      const authData = authDataRaw ? JSON.parse(authDataRaw) : null;
      const userName = authData?.user?.name;

      if (!userName) {
        console.error("No se encontró el nombre del usuario en authData.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/collaborator/editar/${employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            observacion: parseInt(score),
            last_edited_by: userName,
            last_edited_on: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al actualizar la observación: ${response.status}`
        );
      }

      const result = await response.json();
      if (result.status === "success") {
        handleClose();
      }
    } catch (error) {
      console.error("Error al guardar la observación:", error);
    }
  };

  const formattedLastEditedDate = last_edited_on
    ? new Date(last_edited_on).toLocaleString("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Sin fecha de edición";

  return (
    <Box display="flex" justifyContent="center">
      <Tooltip title="Editar" arrow placement="top">
        <IconButton onClick={onEdit}>
          {isEditing ? <Save fontSize="small" /> : <Edit fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Observaciones" arrow placement="top">
        <IconButton onClick={handleClickOpen}>
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Agregar puesto adicional" arrow placement="top">
        <IconButton color="primary"  onClick={addproject}>
          <AddCircle fontSize="small"/>
        </IconButton>
      </Tooltip>

      <Tooltip title="Borrar" arrow placement="top">
        <IconButton color="error" onClick={onDelete}>
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            background: "#fff",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: "#002338",
            paddingBottom: 1,
            borderBottom: "2px solid #002338",
          }}
        >
          Puntuación de Desempeño
        </DialogTitle>

        <DialogContent sx={{ padding: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              marginTop: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#002338",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {last_name}, {first_name}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#f0f8ff",
                padding: 2,
                borderRadius: "12px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Nota Actual:
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#002338",
                }}
              >
                {score} puntos
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Última modificación: {formattedLastEditedDate}
            </Typography>

            <TextField
              label="Editar Nota" // Mantener el label
              variant="outlined"
              fullWidth
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              inputProps={{
                min: 0,
                max: 100,
                style: {
                  textAlign: "center",
                  fontSize: "1.2rem",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#23FFDC",
                    borderWidth: 2,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#23FFDC",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                    color: "#23FFDC",
                  },
                },

                cursor: "text",
                "& input": {
                  cursor: "text",
                },
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "center",
                  color: "#002338",
                  fontStyle: "italic",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 3,
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: "#002338",
              color: "#002338",
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: "rgba(0,35,56,0.1)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveObservation}
            variant="contained"
            sx={{
              bgcolor: "#002338",
              color: "#fff",
              borderRadius: "12px",
              "&:hover": {
                bgcolor: "#014c8e",
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeActions;
