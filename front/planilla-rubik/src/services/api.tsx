import { Vacante, ColumnConfig, Notification, Reader } from "@/types/interface";
import { FieldDef } from "@/components/configuration/CollaboratorSettings/types";
import {
  Project,
  Employee,
  ActuColaborador,
  RegisterProjectBody,
  Tecnologia,
  TecnologiA
} from "@/types/interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const fetchProjects = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/`
    );
    if (!response.ok) throw new Error("Error al obtener los datos");

    const result = await response.json();

    const proyectosActivos = result.data.filter(
      (proyecto: Project) => !proyecto.delete_at
    );

    return proyectosActivos;
  } catch (error) {
    console.error("Error al obtener los proyectos:", error);
    return [];
  }
};

export const fetchVacancies = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vacancie/`
    );
    if (!response.ok) throw new Error("Error al obtener los datos");
    const data: Vacante[] = await response.json();
    const vacantesActivas = data.filter((vacante) => !vacante.delete_at);
    return vacantesActivas;
    // // Inicializar buttonText con el nombre de cada vacante activa
    // const initialButtonText: { [key: string]: string } = {};
    // vacantesActivas.forEach((vacante) => {
    //   initialButtonText[vacante.Vacante] = vacante.Vacante;
    // });
    // setButtonText(initialButtonText);
  } catch (error) {
    console.error("Error al cargar las vacantes:", error);
  }
};

export const fetchVacancie = async (id: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vacancie/${id}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) throw new Error("Error al obtener los datos");
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error al cargar las vacantes:", error);
  }
};

export async function getColumns(entity: string): Promise<ColumnConfig[]> {
  const res = await fetch(`${API_URL}/configuration/columns/${entity}`);
  const data = await handleResponse<{ columns: ColumnConfig[] }>(res);
  return data.columns.sort((a, b) => a.order - b.order);
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/user/prueba`);
  return handleResponse<any[]>(res);
}

export async function getVacancies(search: string): Promise<Vacante[]> {
  const url = `${API_URL}/vacancie/?search=${encodeURIComponent(search)}`;
  const res = await fetch(url);
  const data = await handleResponse<Vacante[]>(res);
  return data.filter((v) => !v.delete_at);
}

export async function editVacancy(id: string, payload: Partial<Vacante>) {
  const res = await fetch(`${API_URL}/vacancie/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ vacancie: Vacante; status: string }>(res);
}

export async function deleteVacancy(id: string) {
  const res = await fetch(`${API_URL}/vacancie/${id}`, {
    method: "POST",
  });
  return handleResponse<{ status: string }>(res);
}
export const fetchCollaborators = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/`
    );
    if (!response.ok) throw new Error("Error al obtener los colaboradores");

    const data: Employee[] = await response.json();

    return data;
  } catch (error) {
    console.error("Error al obtener los colaboradores:", error);
  }
};
export const getColabById = async (id: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}`
    );
    if (!response.ok) throw new Error("Error al obtener los colaboradores");

    const data: Employee[] = await response.json();

    return data;
  } catch (error) {
    console.error("Error al obtener el colaborador:", error);
  }
};

export const fetchDeleteColabById = async (id: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error("Error de conexión al backend:" + error);
  }
}
 export const fetchAddColab = async (payload: any) => {
  try{
     const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/collaborator/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    const result = await resp.json();
    return result;
  } catch (error) {
    console.error("Error al agregar colaborador:", error);
  }
};


export const fetchTecnology = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/technology/tecnology`
    );
    if (!response.ok)
      throw new Error("Error en la carga de datos desde la API");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
};

export const fetchTableColumns = async (entity: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/configuration/columns/${entity}`
  );

  if (!response.ok) {
    throw new Error(
      `Error al obtener columnas de "${entity}": ${response.status}`
    );
  }

  const data = await response.json();
  const columnsData = data.columns || [];

  const sortedColumns = [...columnsData].sort((a, b) => a.order - b.order);
  return sortedColumns;
};

export const fetchProjectById = async (taxonId: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${taxonId}`
    );
    if (!response.ok) throw new Error("Error al obtener el proyecto");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el proyecto:", error);
  }
};

export const fetchDeleteProjectById = async (taxonId: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${taxonId}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error("Error de conexión al backend:" + error);
  }
};

export async function editProject(taxonId: number, payload: Partial<Project>) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${taxonId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<{ project: Project; status: string }>(response);
}

export async function registerVacanteService(payload: Vacante) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vacancie/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`400 Bad Request:`, text);
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

export async function updateCollaboratorService(id: Number, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("→ Cuerpo de la respuesta de error:", text);
    throw new Error(text);
  }

  return JSON.parse(text);
}

export async function registerProjectService(
  body: RegisterProjectBody
): Promise<Project> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.missingFields
      ? `Faltan campos: ${data.missingFields.join(", ")}`
      : data.message || res.statusText;
    throw new Error(msg);
  }
  return data as Project;
}
export async function fetchAvailableTechnologies(): Promise<string[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/technology/tecnology`
  );
  if (!res.ok) {
    const txt = await res.text();
    console.error("Error al fetch de tecnologías:", txt);
    throw new Error("Error en la carga de tecnologías");
  }
  const data: Tecnologia[] = await res.json();

  // Unificamos y limpiamos la lista
  const techSet = new Set<string>();
  data.forEach((item) => {
    item.tecnologias
      ?.split(";")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => techSet.add(t));
  });

  return Array.from(techSet);
}

export const fetchManagers = () =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/prueba`)
    .then((res) => {
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json() as Promise<any[]>;
    })
    .then((users) =>
      users
        .filter((u) => {
          const rol = u.rol || u.role || u.Rol || u.Role;
          return (
            rol === "manager" ||
            rol === "Manager" ||
            (Array.isArray(rol) &&
              rol.some((r) => r.toLowerCase() === "manager"))
          );
        })
        .map((u) => ({
          manager_id: u.id || u._id || "",
          manager_name:
            `${u.first_name || u.nombre || u.name || ""} ${
              u.last_name || u.apellido || ""
            }`.trim() || "Manager sin nombre",
        }))
    );

export async function getBasicFields() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/basic-fields`);
  return res.json();
}

export async function getExtraFields() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extra-fields`);
  return res.json();
}

export async function deleteExtraField(id: string) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/extra-fields/${id}`, {
    method: "DELETE",
  });
}

export async function getPersonnel() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel`);
  return res.json();
}

export async function createExtraField(payload: Partial<FieldDef>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extra-fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateExtraField(id: string, payload: Partial<FieldDef>) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/extra-fields/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return res;
}

export async function createPersonnel(payload: any) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updatePersonnel(id: string, payload: any) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/personnel/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export const getAllNotifications = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/all`
    );
    if (!response.ok)
      throw new Error("Error en la carga de datos desde la API");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
};

export const getNotificationsByManagers = async (
  emails: string[]
): Promise<Notification[]> => {
  try {
    const query = emails.join(",");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/byManager?emails=${query}`
    );
    if (!response.ok) {
      throw new Error("Error al traer notificaciones");
    }
    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error("Error al obtener notificaciones por managers:", err);
    return [];
  }
};
export const getNotificationsByReadStatus = async (read: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/by-read-status?read=${read}`
    );
    if (!response.ok) throw new Error("Error al filtrar notificaciones");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al filtrar notificaciones:", error);
  }
};
export const getNotificationsByUser = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/byUser/${email}`
    );
    
    if (!response.ok) throw new Error("Error al filtrar notificaciones");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al filtrar notificaciones:", error);
  }
};
export const markNotificationAsRead = async (
  email: string,
  referenceId: string,
  type: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notification/markAsRead`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referenceId, type }),
    }
  );
  if (!response.ok) throw new Error("Error al marcar como leída");
  return await response.json();
};
export const markAllNotificationsAsRead = async (email: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notification/markAllAsRead`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );
  if (!response.ok) throw new Error("Error al marcar todas como leídas");
  return await response.json();
};

export const checkProjectExpiration = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/notiProjects`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error("Error al verificar la expiración");

    return data;
  } catch (error) {
    console.error("Error al verificar la expiración del proyecto:", error);
  }
};

export const checkContractExpiration = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notification/notiContracts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error("Error al verificar la expiración");

    return data;
  } catch (error) {
    console.error("Error al verificar la expiración del proyecto:", error);
  }
};

export const addAssignedPerson = async (
  taxonId: number,
  person: {
    name: string;
    id: number;
    rol: string;
    horasAsignadas: number;
    tecnologias: string[];
    seniority: string;
  }
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${taxonId}/assigned-persons`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const removeAssignedPerson = async (
  taxonId: number,
  id: number
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${taxonId}/assigned-persons`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id}),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
  } catch (error) {
    console.error("❌ Error eliminando persona:", error);
  }
};

export const updateAssignedPerson = async (
  taxonId: number ,
  dni: string,
  fieldsToUpdate: Record<string, any>
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${taxonId}/assigned-persons`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni, ...fieldsToUpdate }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const removeProyectoFromColaborador = async (
  id: number,
  proyecto: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/collaborator/${id}/proyectos`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Proyectos: proyecto }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const getAllTechnologies = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/technologies/`,
     {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const fetchProjectStates = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stateprojects/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error("Error al verificar la expiración");

    return data;
  } catch (error) {
    console.error("Error al verificar la expiración del proyecto:", error);
  }
};
export async function updateCollaboratorAfterProjectDeletion(
  collaboratorId: number,
  updatedData: any
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collaborator/${collaboratorId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error actualizando colaborador:", error);
    return { status: "error", error };
  }
}


export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    if (!response.ok) throw new Error("Error al iniciar sesión");
    return response.json();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

export const recoverPassword = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/auth/editpws`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    if (!response.ok) throw new Error("Error al recuperar la contraseña");
    return response.json();
  } catch (error) {
    console.error("Error al recuperar la contraseña:", error);
  }
};
export async function fetchTechnologies(): Promise<TecnologiA[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/technologies/`);
  if (!res.ok) throw new Error(`fetchTechnologies: ${res.statusText}`);
  const payload = await res.json();
  return Array.isArray(payload) ? payload : payload.data;
}