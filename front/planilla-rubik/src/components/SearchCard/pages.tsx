"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Tooltip, Modal, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  GridView as GridViewIcon,
  TableView as TableViewIcon,
} from "@mui/icons-material";
// Importa los modales específicos para cada sección
import AddProyecto from "../add_cards/Proyecto/ProjectModal";
import AddColaborador from "../add_cards/colaboradores/page";
import AddVacante from "../add_cards/vacante/page";
import "./search.css";
import Shearch from "../shearch/pages";
import { SearchCardToggleProps } from "@/types/interface";
import { useUser } from "@/app/UserContext";

const SearchCardToggle: React.FC<SearchCardToggleProps> = ({
  viewMode,
  setViewMode,
  setSearchTerm,
  currentSection,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user?.rol === "manager") {
      setIsAdmin(false);
    } else if (user?.rol === "administrador") {
      setIsAdmin(true);
    }
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Función para renderizar el contenido del modal según la sección actual
  const renderModalContent = () => {
    if (currentSection === "proyecto") {
      return <AddProyecto onClose={handleCloseModal} />;
    } else if (currentSection === "colaboradores") {
      return <AddColaborador onClose={handleCloseModal} />;
    } else if (currentSection === "vacante") {
      return <AddVacante onClose={handleCloseModal} />;
    } else {
      return null;
    }
  };

  return (
    <Box className="search-card-toggle-container">
      {/* Caja de búsqueda */}
      <Box className="search-card-toggle-search-box">
        <Shearch onSearch={setSearchTerm} />
      </Box>
      {/* Botón de cambiar vista */}
      <Tooltip title={viewMode === "table" ? "Ver Cards" : "Ver Tabla"}>
        <Button
          variant="contained"
          onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
          startIcon={
            viewMode === "table" ? (
              <GridViewIcon sx={{ color: "white" }} />
            ) : (
              <TableViewIcon sx={{ color: "white" }} />
            )
          }
          className="search-card-toggle-btn"
        >
          {viewMode === "table" ? "Ver Cards" : "Ver Tabla"}
        </Button>
      </Tooltip>
      {/* Botón para abrir el modal (visible solo para admin) */}
      {isAdmin && (
        <Button
          variant="outlined"
          onClick={handleOpenModal}
          className="search-card-toggle-add-btn"
          startIcon={<AddIcon />}
        >
          Agregar
        </Button>
      )}
      {/* Modal que muestra el contenido según la sección actual */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "1042px",
            height: "auto",
            backgroundColor: "white",
            border: "2px solid #4f82ff",
            boxShadow: 24,
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {renderModalContent()}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default SearchCardToggle;
