"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  styled,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Project, Employee, Vacante } from "@/types/interface";
import ThreeSixtyIcon from "@mui/icons-material/ThreeSixty";

const Container1 = styled(Box)({
  userSelect: "none",
  top: "208px",
  right: "20%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "grab",
  position: "relative",
});

const CubeBox = styled(Box)({
  position: "relative",
  width: 370,
  height: 370,
  transformStyle: "preserve-3d",
  transformOrigin: "center center",
  transition: "transform 0.3s ease",
});

const CUBE_SIZE = 370;
const DEPTH = CUBE_SIZE / 2;

interface CardProps {
  face: "front" | "back" | "left" | "right" | "top" | "bottom";
  isSelected: boolean;
}

const Card = styled(Box, {
  shouldForwardProp: (prop) => !["face", "isSelected"].includes(prop as string),
})<CardProps>(({ face, isSelected }) => {
  const faceTransforms = {
    front: `rotateY(  0deg) translateZ(${DEPTH}px)`,
    back: `rotateY(180deg) translateZ(${DEPTH}px)`,
    left: `rotateY(-90deg) translateZ(${DEPTH}px)`,
    right: `rotateY( 90deg) translateZ(${DEPTH}px)`,
    top: `rotateX( 90deg) translateZ(${DEPTH}px)`,
    bottom: `rotateX(-90deg) translateZ(${DEPTH}px)`,
  };

  const selectedTransforms = {
    front: "rotateY(0deg) translateZ(190px) translate(-15%, -25%)",
    back: "rotateY(180deg) translateZ(190px) translate(26%, -25%)",
    left: "rotateY(-90deg) translateZ(320px) translate(5%, -25%)",
    right: "rotateY(90deg) translateZ(70px) translate(5%, -25%)",
    top: "rotateX(90deg) translateZ(320px) translate(-15%, -5%)",
    bottom: "rotateX(-90deg) translateZ(55px) translate(-15%, -5%)",
  };

  return {
    userSelect: "none",
    position: "absolute",
    transform: isSelected ? selectedTransforms[face] : faceTransforms[face],
    width: isSelected ? "630px" : "370px",
    height: isSelected ? "630px" : "370px",
    border: isSelected ? "none" : "10px solid white",
    borderRadius: isSelected ? "0px" : "1%",
    background: "linear-gradient(#23ffdc, #438ff9)",
    display: "flex",
    flexDirection: isSelected ? "column" : "row",
    justifyContent: isSelected ? "center" : "center",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ...(isSelected && {
      zIndex: 10,
      padding: "110px 123px",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      overflow: "hidden",
      color: "#000000",
      position: "absolute",
      top: "0%",
      left: "0%",
    }),
  };
});

const IconCards = styled(Box)(({ theme }) => ({
  display: "flex",
  paddingBottom: "0px",
  alignItems: "center",
  justifyContent: "center",
}));

const FaceContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}));

const ListContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "204px",
  left: "67%",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
}));

const FaceButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  width: "351px",
  height: "50px",
  color: "white",
  gap: "1px",
  fontSize: "24px",
  backgroundColor: "#002338",
  border: "4px solid transparent",
  borderRadius: "25px",
  cursor: "pointer",
  textTransform: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingLeft: "24px",
  paddingRight: "24px",
  textAlign: "left",
  fontFamily: "Poppins, sans-serif",

  ...(isSelected && {
    border: "4px solid transparent",
    backgroundImage:
      "linear-gradient(#002338, #002338), linear-gradient(45deg, #23ffdc, #438ff9)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    color: "#23ffdc",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",

  }),
  "&:hover": {
    border: "4px solid transparent",
    backgroundImage:
      "linear-gradient(#002338, #002338), linear-gradient(45deg, #23ffdc, #438ff9)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    color: "#23ffdc",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },
}));

const FaceTitle = styled(Box)(({ theme }) => ({
  marginTop: "15px",
  textAlign: "center",
  alignItems: "center",
  fontWeight: 600,
  fontSize: "32px",
  color: "#002338",
}));

const FaceLabel = styled(Box)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "24px",
  color: "#002338",
}));

export default function DashboardCube({
  projectsProp,
  collaboratorProp,
  vacanciesProp,
}: {
  projectsProp: Project[];
  collaboratorProp: Employee[];
  vacanciesProp: Vacante[];
}) {
  const [rotation, setRotation] = useState({ x: 45, y: -45 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    face: string | null;
    button: string | null;
  }>({
    face: null,
    button: null,
  });
  const [proyectos, setProyectos] = useState<Project[]>([]);
  const [colaboradores, setColaboradores] = useState<Employee[]>([]);
  const [vacantes, setVacantes] = useState<any[]>([]);
  const theme = useTheme();

  const prevMousePosition = useRef({ x: 0, y: 0 });
  const faceRotations = {
    front: { x: 0, y: 0 },
    back: { x: 0, y: 180 },
    left: { x: 0, y: 90 },
    right: { x: 0, y: -90 },
    top: { x: -90, y: 0 },
    bottom: { x: 90, y: 0 },
  };

  useEffect(() => {
    if (projectsProp && Array.isArray(projectsProp)) {
      setProyectos(projectsProp);
    } else {
      console.warn("projectsProp no tiene datos o no es un array");
    }
  }, [projectsProp]);

  useEffect(() => {
    if (collaboratorProp && Array.isArray(collaboratorProp)) {
      setColaboradores(collaboratorProp);
    } else {
      console.warn("collaboratorProp no tiene datos o no es un array");
    }
  }, [collaboratorProp]);

  useEffect(() => {
    if (vacanciesProp && Array.isArray(vacanciesProp)) {
      setVacantes(vacanciesProp);
      
    } else {
      console.warn("vacanciesProp no tiene datos o no es un array");
    }
  }, [vacanciesProp]);

  const handleButtonSelection = (label: string) => {
    const labelToFace: Record<string, keyof typeof faceRotations> = {
      Staff: "front",
      Proyectos: "back",
      Asignados: "left",
      "Sin Asignar": "right",
      "Sobre Asignados": "top",
      Vacantes: "bottom",
    };

    const face = labelToFace[label];

    if (selected.button === label) {
      setSelected({ face: null, button: null });
      setSelectedFace(null);
    } else {
      setSelected({ face, button: label });
      setSelectedFace(face);
      setRotation({
        x: faceRotations[face].x,
        y: faceRotations[face].y,
      });
    }
  };

  const faceLabels: {
    face: "front" | "back" | "left" | "right" | "top" | "bottom";
    label: string;
    icon: string;
  }[] = [
    {
      face: "front",
      label: "Staff",
      icon: "/images/iconocolab.svg",
    },
    {
      face: "back",
      label: "Proyectos",
      icon: "/images/iconoproyect.svg",
    },
    {
      face: "left",
      label: "Asignados",
      icon: "/images/iconoasignado.svg",
    },
    {
      face: "right",
      label: "Sin Asignar",
      icon: "/images/sinasignar.svg",
    },
    {
      face: "top",
      label: "Sobre Asignados",
      icon: "/images/sobreasignados.svg",
    },
    {
      face: "bottom",
      label: "Vacantes",
      icon: "/images/vacantes.svg",
    },
  ];

  const buttonLabels: {
    label: string;
    icon: string;
  }[] = [
    {
      label: "Staff",
      icon: "/images/iconocolab.svg",
    },
    {
      label: "Proyectos",
      icon: "/images/iconoproyect.svg",
    },
    {
      label: "Asignados",
      icon: "/images/iconoasignado.svg",
    },
    {
      label: "Sin Asignar",
      icon: "/images/sinasignar.svg",
    },
    {
      label: "Sobre Asignados",
      icon: "/images/sobreasignados.svg",
    },
    {
      label: "Vacantes",
      icon: "/images/vacantes.svg",
    },
  ];

  const handleClick = (url: string) => {
    window.location.href = url;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    prevMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || selectedFace) return;

    const deltaX = e.clientX - prevMousePosition.current.x;
    const deltaY = e.clientY - prevMousePosition.current.y;

    const rotationSpeed = 0.3;

    const newRotationX = rotation.x - deltaY * rotationSpeed;
    const clampedX = Math.max(-90, Math.min(90, newRotationX));

    const newRotationY = rotation.y + deltaX * rotationSpeed;

    setRotation({
      x: clampedX,
      y: newRotationY % 360,
    });

    prevMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const rotate360 = () => {
    if (selectedFace) {
      setSelectedFace(null);
      setSelected({ face: null, button: null });
  
      setTimeout(() => {
        setRotation({ x: 45, y: -45 }); 
  
        setTimeout(() => {
          setRotation((prevRotation) => ({
            x: prevRotation.x,
            y: prevRotation.y + 360, 
          }));
        }, 300); 
      }, 300); 
    } else {
      setRotation((prevRotation) => ({
        x: prevRotation.x,
        y: prevRotation.y + 360,
      }));
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "178px",
        }}
      >
        <Container1
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <CubeBox
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
          >
            {faceLabels.map(({ face, label, icon }) => (
              <Card
                key={face}
                face={face}
                isSelected={selectedFace === face}
                sx={{
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {face === "front" && selectedFace === "front" ? (
                  <ListContainer>
                    <IconCards>
                      <Image
                        src="/images/iconocolab.svg"
                        alt="Icono Colaborador"
                        width={122.5}
                        height={85.75}
                      />
                    </IconCards>
                    <FaceTitle
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceTitle>
                    <Box
                      sx={{
                        textAlign: "center",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "28px",
                        fontFamily: "Poppins, sans-serif",
                        color: "#002338",
                        marginTop: "15px",
                      }}
                    >
                      {`(somos ${colaboradores.length})`}
                    </Box>
                    <Box
                      component="ul"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          fontSize: "24px",
                          fontWeight: "light",
                          color: "#002338",
                          marginTop: "30px",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        Total de colaboradores registrados en la empresa
                      </Box>
                    </Box>
                  </ListContainer>
                ) : face === "back" && selectedFace === "back" ? (
                  <ListContainer>
                    <IconCards>
                      <Image
                        src="/images/iconoproyect.svg"
                        alt="Icono Colaborador"
                        width={85.55}
                        height={98.1}
                      />
                    </IconCards>
                    <FaceTitle
                      as="h3"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceTitle>
                    <Box
                      sx={{
                        textAlign: "center",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "28px",
                        fontFamily: "Poppins, sans-serif",
                        color: "#002338",
                        marginTop: "15px",
                      }}
                    >
                      {`(${proyectos.length} proyectos)`}
                    </Box>
                    <Box
                      component="ul"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          fontSize: "24px",
                          fontWeight: "light",
                          color: "#002338",
                          marginTop: "30px",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        Suma total de proyectos activos
                      </Box>
                    </Box>
                  </ListContainer>
                ) : face === "left" && selectedFace === "left" ? (
                  <ListContainer>
                    <IconCards>
                      <Image
                        src="/images/iconoasignado.svg"
                        alt="Icono Colaborador"
                        width={84}
                        height={91.62}
                      />
                    </IconCards>
                    <FaceTitle
                      as="h3"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceTitle>
                  </ListContainer>
                ) : face === "right" && selectedFace === "right" ? (
                  <ListContainer>
                    <IconCards>
                      <Image
                        src="/images/sinasignar.svg"
                        alt="Icono Colaborador"
                        width={89.85}
                        height={89.85}
                      />
                    </IconCards>
                    <FaceTitle
                      as="h3"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceTitle>
                    <Box
                      sx={{
                        textAlign: "center",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "28px",
                        fontFamily: "Poppins, sans-serif",
                        color: "#002338",
                        marginTop: "15px",
                      }}
                    >
                      {`(No hay sin asignar)`}
                    </Box>
                    <Box
                      component="ul"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          fontSize: "24px",
                          fontWeight: "light",
                          color: "#002338",
                          marginTop: "30px",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        Indica cuantos colaboradores se encuentran sin
                        asignación de proyectos
                      </Box>
                    </Box>
                  </ListContainer>
                ) : face === "top" && selectedFace === "top" ? (
                  <ListContainer>
                    <IconCards>
                      <Image
                        src="/images/sobreasignados.svg"
                        alt="Icono Colaborador"
                        width={91}
                        height={91}
                      />
                    </IconCards>
                    <FaceTitle
                      as="h3"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceTitle>
                    <Box
                      sx={{
                        textAlign: "center",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "28px",
                        fontFamily: "Poppins, sans-serif",
                        color: "#002338",
                        marginTop: "15px",
                      }}
                    >
                      {`(No hay sobre asignados)`}
                    </Box>
                    <Box
                      component="ul"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          fontSize: "24px",
                          fontWeight: "light",
                          color: "#002338",
                          marginTop: "30px",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        Colaboradores que realizan horas extras
                      </Box>
                    </Box>
                  </ListContainer>
                ) : face === "bottom" && selectedFace === "bottom" ? (
                  <ListContainer>
                    <IconCards>
                      <Image
                        src="/images/vacantes.svg"
                        alt="Icono Vacante"
                        width={92}
                        height={92}
                      />
                    </IconCards>
                    <FaceTitle
                      as="h3"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceTitle>
                    <Box
                      sx={{
                        textAlign: "center",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "28px",
                        fontFamily: "Poppins, sans-serif",
                        color: "#002338",
                        marginTop: "15px",
                      }}
                    >
                      {`( ${vacantes.length} vacantes)`}
                    </Box>
                    <Box
                      component="ul"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          fontSize: "24px",
                          fontWeight: "light",
                          color: "#002338",
                          marginTop: "30px",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        Vacantes disponibles para diferentes roles
                      </Box>
                    </Box>
                  </ListContainer>
                ) : (
                  <FaceContent>
                    <Image
                      src={icon}
                      alt={`Icono ${label}`}
                      width={100}
                      height={100}
                      draggable="false"
                      style={{
                        marginBottom: "10px",
                        display: "block",
                        margin: "0 auto",
                        position: "relative",
                        top: "-20px",
                      }}
                    />
                    <FaceLabel
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {label}
                    </FaceLabel>
                  </FaceContent>
                )}
              </Card>
            ))}
          </CubeBox>
        </Container1>
        <ButtonsContainer>
          {buttonLabels.map(({ label, icon }) => (
            <FaceButton
              key={label}
              isSelected={selected.button === label}
              onClick={() => handleButtonSelection(label)}
              sx={{
                color: selected.button === label ? "#23ffdc" : "white",
                "&:hover": {
                  color: "#23ffdc",
                  "& .icon": {
                    filter:
                      "invert(64%) sepia(83%) saturate(453%) hue-rotate(130deg) brightness(1.1) contrast(1.1)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                }}
              >
                <Box
                  component="img"
                  src={icon}
                  alt={`Icono ${label}`}
                  width={24}
                  height={24}
                  className="icon"
                  sx={{
                    filter:
                      selected.button === label
                        ? "invert(64%) sepia(83%) saturate(453%) hue-rotate(130deg) brightness(1.1) contrast(1.1)"
                        : "brightness(0) invert(1)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {label}
              </Box>
            </FaceButton>
          ))}
        </ButtonsContainer>
        <Box
          sx={{
            position: "absolute",
            left: "57px",
            top: "129.12%",
            transform: "translateY(-50%)",
            color: "#002338",
            textAlign: "center",
            bgcolor: "#002338",
            width: "50px",
            height: "50px",
            borderRadius: "25px",
            p: "4px",
            "&:hover": {
              boxShadow: "0 16px 16px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <Tooltip title="Rotar 360°" arrow placement="top">
            <IconButton
              onClick={() => {
                rotate360();
              }}
             
            >
              <ThreeSixtyIcon
                sx={{
                  fontSize: "24px",
                  color: "#23FFDC",
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}
