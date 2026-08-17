export interface Candidate {
    id: string;
    name: string;
    technology: string;
    assignedHours: number;
  
    /** true ⇒ “Candidato sugerido” y se lista primero (si existe)  */
    suggested?: boolean;
  
    /** true ⇒ candidato elegido por el usuario (max 1 por rol)  */
    selected?: boolean;
  }
  
  export interface Role {
    id: string;
    name: string;              
    candidates: Candidate[];
  }
  
  export interface Vacancy {
    id: string;
    role: string;             
    technology: string;
    weeklyHours: number;
  }
  
  export interface ProjectInfo {
    name: string;
    description: string;
    startDate: string;          // ISO
    endDate:   string;          // ISO
    roles: Role[];
    vacancies: Vacancy[];
  }
  