import { Suspense } from "react";
import {
  fetchProjects,
  fetchVacancies,
  fetchCollaborators
} from "@/services/api";
import DashboardClientView from "./dashboardClientView";

export default async function Home() {
  const resultProyjects = await fetchProjects();
  const resultVacancies = await fetchVacancies();
  const resultCollaborators = await fetchCollaborators();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClientView projects={resultProyjects} collaborator={resultCollaborators} vacancie={resultVacancies}  />
    </Suspense>
  );
}
