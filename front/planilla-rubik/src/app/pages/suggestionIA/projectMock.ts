import { ProjectInfo } from "../../../components/NewProject-Suggestion/types";

export const mockProject: ProjectInfo = {
  name: "Escribanía",
  description: "Proyecto generador de documentos legales automatizados.",
  startDate: "2024-05-30",
  endDate: "2025-06-01",

  /* ----------------------------------------------------------------- */
  roles: [
    {
      id: "role-frontend",
      name: "Frontend",

      candidates: [
        {
          id: "cand-fe-1",
          name: "Julieta Gonzales",
          technology: "React",
          assignedHours: 40,
          suggested: true,
        },
        {
          id: "cand-fe-2",
          name: "Mario Fernández",
          technology: "Angular",
          assignedHours: 40,
        },
        {
          id: "cand-fe-3",
          name: "Laura Pérez",
          technology: "Angular",
          assignedHours: 40,
        },
        {
          id: "cand-fe-4",
          name: "Diego Silva",
          technology: "Vue.js",
          assignedHours: 40,
        },
        {
          id: "cand-fe-5",
          name: "Carla López",
          technology: "React",
          assignedHours: 40,
        },
      ],
    },

    {
      id: "role-backend",
      name: "Backend",

      candidates: [
        {
          id: "cand-be-1",
          name: "Pedro Martínez",
          technology: "Node.js",
          assignedHours: 40,
          suggested: false,
        },
        {
          id: "cand-be-2",
          name: "Sofía Herrera",
          technology: "Python",
          assignedHours: 40,
        },
      ],
    },

    {
      id: "role-pm",
      name: "Project Manager",

      candidates: [
        {
          id: "cand-pm-1",
          name: "Luciana Rivas",
          technology: "Agile",
          assignedHours: 40,
          suggested: true,
        },
        {
          id: "cand-pm-2",
          name: "Jorge Díaz",
          technology: "Scrum",
          assignedHours: 40,
        },
      ],
    },
  ],

  /* ----------------------------------------------------------------- */
  vacancies: [
    {
      id: "vac-qa-1",
      role: "QA",
      technology: "Selenium",
      weeklyHours: 40,
    },
    {
      id: "vac-qa-2",
      role: "QA",
      technology: "Selenium",
      weeklyHours: 40,
    },
  ],
};
