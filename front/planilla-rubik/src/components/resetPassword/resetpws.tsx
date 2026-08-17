"use client";
import { Suspense } from "react";
import React from "react";
import { Snackbar, Alert } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import { useRouter} from "next/navigation";
import Image from "next/image";

const ResetPasswordForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  useEffect(() => {
    const storedEmail = localStorage.getItem("recpws");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("No se encontró un email para recuperar la contraseña.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/auth/resetpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            newPassword: password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ocurrió un error");
      }

      setSuccessMsg(data.message || "Contraseña actualizada correctamente");
      setShowSuccess(true);

      setTimeout(() => {
        localStorage.removeItem("recpws");
        router.push("/"); // o a donde quieras redirigir
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const validateForm = () => {
    if (!password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "110vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        {/* Contenedor del formulario */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "850px",
            height: "500px",
            borderRadius: "10px",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Lado izquierdo */}
          <div
            style={{
              width: "40%", // Menos ancho que el lado derecho
              backgroundColor: "#0087FF",
              color: "#fff",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
            }}
          >
            {/* Contenedor para el logo y el título */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                position: "relative",
                top: "70px", // Ajusta para mover hacia arriba
              }}
            >
              <Image
                src="/images/Logo.svg"
                alt="Logo Rubik"
                width={200}
                height={200}
                style={{
                  marginBottom: "20px",
                }}
              />
            </div>
            <h2
              style={{
                position: "relative", // Para usar `top`
                top: "50px", // Baja más el texto
                fontSize: "40px", // Letra aún más grande
                fontWeight: "bold", // Texto en negrita
              }}
            >
              SIMPLIFICA TU EQUIPO,
            </h2>
            <h2
              style={{
                position: "relative", // Para usar `top`
                top: "50px", // Alineado con el de arriba
                fontSize: "40px", // Letra más grande
                color: "rgba(35, 255, 220, 1)", // Color verde
                fontWeight: "bold", // Texto en negrita
              }}
            >
              OPTIMIZA TU GESTIÓN
            </h2>
          </div>

          <div
            style={{
              width: "60%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <form
              action="#"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  marginBottom: "0.2rem",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                Cambia tu Contraseña
              </h3>

              {/* Contraseña */}
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 2.5rem 0.8rem 1rem",
                    border: "1px solid #000",
                    borderRadius: "20px",
                    fontSize: "16px",
                    backgroundColor: "#F8F8F8",
                    color: "#000",
                  }}
                />
                {showPassword ? (
                  <VisibilityIcon
                    onClick={() => setShowPassword(false)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <VisibilityOffIcon
                    onClick={() => setShowPassword(true)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>

              {/* Repetir Contraseña */}
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repetir Contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 2.5rem 0.8rem 1rem",
                    border: "1px solid #000",
                    borderRadius: "20px",
                    fontSize: "16px",
                    backgroundColor: "#F8F8F8",
                    color: "#000",
                  }}
                />
                {/* OJITO */}
                {showConfirmPassword ? (
                  <VisibilityIcon
                    onClick={() => setShowConfirmPassword(false)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <VisibilityOffIcon
                    onClick={() =>  setShowConfirmPassword(true)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>
              {/* Error */}
              {error && (
                <div
                  style={{
                    color: "red",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Botón Registrarme */}
              <Button
                variant="contained"
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  backgroundColor: "#002338",
                  color: "#23FFDC",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: "20px",
                }}
              >
                {loading ? "Procesando..." : "Cambiar Contraseña"}
              </Button>
            </form>
          </div>
        </div>
      </Suspense>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ marginTop: "20px" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ResetPasswordForm;
