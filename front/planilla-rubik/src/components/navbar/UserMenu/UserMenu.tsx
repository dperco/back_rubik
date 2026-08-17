"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import WebIcon from "@mui/icons-material/Language";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Notification from "@/components/notification/notification";
import { useUser } from "@/app/UserContext";

const UserMenuWrapper = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  justifyContent: "flex-end",
  width: "100%",
});

const StyledAccountIcon = styled(AccountCircleIcon)({
  width: "30px",
  height: "48px",
  color: "white",
});

const CloseButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
  color: "black",
  backgroundColor: "#d3d3d3",
  padding: "4px",
  borderRadius: "50%",
  "&:hover": {
    backgroundColor: "#b0b0b0",
  },
});

const ModernDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#f4f7fc",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
  },
});

const YesButton = styled(Button)({
  textTransform: "none",
  fontWeight: "bold",
  padding: "8px 16px",
  borderRadius: "8px",
  backgroundColor: "#007bff",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#dc3545",
    color: "#fff",
  },
});

const NoButton = styled(Button)({
  textTransform: "none",
  fontWeight: "bold",
  padding: "8px 16px",
  borderRadius: "8px",
  backgroundColor: "#007bff",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#218838",
    color: "#000",
  },
});


const UserMenu: React.FC = () => {
  const { user, clearSession } = useUser();
  const [userName, setUserName] = useState("Usuario");
  const [avatarUrl, setAvatarUrl] = useState(""); // Valor por defecto
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [openLogoutPopup, setOpenLogoutPopup] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.name) setUserName(user.name);
    if (user?.rol === "manager") {
      setIsAdmin(false);
    } else if (user?.rol === "administrador") {
      setIsAdmin(true);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleLogoutPopupOpen = () => {
    setOpenLogoutPopup(true);
    handleClose();
  };
  const handleLogout = () => {
    setOpenLogoutPopup(false);
    clearSession();
    window.location.href = "https://rubik-dev.app.mindfactory.ar/";
  };

  const handleLogoutPopupClose = () => {
    setOpenLogoutPopup(false);
  };

  const handleOpenSettings = () => {
    router.push("/pages/configuration");
  };
  const renderAvatar = () => {
    if (!avatarUrl || imageError) {
      return <AccountCircleIcon sx={{ width: "100%", height: "100%" }} />;
    }
    return (
      <Image
        src={avatarUrl}
        alt={`${userName}'s avatar`}
        width={80}
        height={80}
        onError={handleImageError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  };

  const perfil = () => {
    if (!avatarUrl || imageError) {
      return <StyledAccountIcon />;
    }
    return (
      <Image
        src={avatarUrl}
        alt={`${userName}'s avatar`}
        width={40}
        height={40}
        onError={handleImageError}
        style={{
          width: "90px",
          height: "40px",
          objectFit: "cover",
        }}
      />
    );
  };

  const handleOpenWebsite = () => {
    window.open("https://www.youtube.com", "_blank");
  };

  return (
    <UserMenuWrapper>
      {/* Perfil y opciones */}
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          width: "100px",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            clipPath: "circle(50%)",
          }}
        >
          {perfil()}
        </Box>
        <Typography
          variant="body1"
          sx={{ color: "whiter", fontSize: "15px", display: "flex" }}
        >
          Perfil
          <Image
            src="/images/Group.svg"
            alt="Perfil"
            width={40}
            height={40}
            onError={handleImageError}
            style={{
              marginLeft: "2px",
              width: "15px",
              height: "",
              objectFit: "cover",
            }}
          />
        </Typography>
      </Box>
      <Box>
        <Notification />
      </Box>
      <Popover
        id={Boolean(anchorEl) ? "user-menu" : undefined}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
            width: "250px",
            position: "relative",
          },
        }}
      >
        <IconButtonOption
          icon={<WebIcon sx={{ color: "black", cursor: "pointer" }} />}
          label="Ir a la web"
          onClick={handleOpenWebsite}
        />
        {isAdmin && (
          <IconButtonOption
            icon={<SettingsIcon sx={{ color: "black", cursor: "pointer" }} />}
            label="Ajustes"
            onClick={handleOpenSettings}
          />
        )}
        <IconButtonOption
          icon={<LogoutIcon sx={{ color: "black", cursor: "pointer" }} />}
          label="Cerrar sesión"
          onClick={handleLogoutPopupOpen}
        />
      </Popover>

      {/* Logout Confirmation Popup */}
      <ModernDialog
        open={openLogoutPopup}
        onClose={handleLogoutPopupClose}
        aria-labelledby="confirm-logout-dialog"
      >
        <CloseButton
          onClick={handleLogoutPopupClose}
          size="small"
          aria-label="close logout popup"
        >
          <CloseIcon fontSize="small" />
        </CloseButton>

        <Box
          sx={{
            width: "90px",
            height: "80px",
            borderRadius: "50%",
            overflow: "hidden",
            mb: 2,
            mt: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          {renderAvatar()}
        </Box>

        <Typography variant="body1" sx={{ color: "#000", textAlign: "center" }}>
          {userName}
        </Typography>

        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            ¿Estás seguro de que quieres cerrar sesión?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <YesButton onClick={handleLogout}>Sí</YesButton>
          <NoButton onClick={handleLogoutPopupClose}>No</NoButton>
        </DialogActions>
      </ModernDialog>
    </UserMenuWrapper>
  );
};

interface IconButtonOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const IconButtonOption: React.FC<IconButtonOptionProps> = ({
  icon,
  label,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      p: 1,
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
    }}
  >
    {icon}
    <Typography variant="body1" sx={{ color: "#000" }}>
      {label}
    </Typography>
  </Box>
);

export default UserMenu;
