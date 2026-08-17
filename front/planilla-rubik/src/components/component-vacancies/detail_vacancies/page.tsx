"use client";
import { useState, useEffect} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
// import "./page.css";
import {Vacante} from "@/types/interface"; 

export default function CardDetalleVacante() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vacanteSeleccionada = searchParams?.get("vacante");

  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  console.log("Vacantes cargadas:", vacantes);
  const [vacanteDetalles, setVacanteDetalles] = useState<Vacante | null>(null);
  const [isClient, setIsClient] = useState(false); // Verificar si estamos en el cliente

  useEffect(() => {
    setIsClient(true); // Esto asegura que el componente se renderiza solo en el cliente

    const fetchVacante = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancie/vacancie`);
        const data: Vacante[] = await response.json();
        const proyectosActivos = data.filter((proyecto) => !proyecto.delete_at);
        setVacantes(proyectosActivos);

        if (vacanteSeleccionada) {
          const vacante = proyectosActivos.find(
            (proyecto) => proyecto.Vacante === vacanteSeleccionada
          );
          setVacanteDetalles(vacante || null);
        }
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
      }
    };

    fetchVacante();
  }, [vacanteSeleccionada]);

  const handleVolver = () => {
    router.push("/pages/vacancies");
  };

  if (!isClient) return null; // Evitar errores de prerenderizado

  return (
    <div>
      <button className="volver-button" onClick={handleVolver}>
        <KeyboardArrowLeftIcon className="arrow-icon" /> Volver
      </button>

      <main>
        <section className="contenedor">
          <div className="cardd">
            <div className="imanomedi">
              <div className="profile-picc">
                <Image
                  src="/images/Icono.svg"
                  alt="Ícono Vacante"
                  layout="fill"
                  objectFit="cover"
                  className="image-container"
                />
              </div>
              <div className="content">
                <span className="namee">{vacanteSeleccionada}</span>
              </div>
            </div>
            <div className="line"></div>
            <section className="bottomm">
              <section className="contentt">
                {vacanteDetalles ? (
                  <div>
                    <div className="about-ma">Proyecto: {vacanteDetalles.Nombre}</div>
                    <div className="about-ma">Horas requeridas: {vacanteDetalles.Tiempo}</div>
                    <div className="about-ma">Manager: {vacanteDetalles.manager_name}</div>
                    <div className="about-ma">Fecha de pedido: {vacanteDetalles["Fecha de pedido"]}</div>
                    <div className="about-ma">Fecha de inicio: {vacanteDetalles["Fecha de inicio"]}</div>
                  </div>
                ) : (
                  <p>No se encontraron detalles para esta vacante.</p>
                )}
              </section>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
