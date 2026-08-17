import { Suspense } from "react";
import ProjectClientView from "./projectClientView";
import { fetchCollaborators, fetchProjects, getUsers} from "@/services/api";

export default async function Home({
  params,
}: {
  params: { taxon_id: number };
}) {
  const { taxon_id } = params;
  const resultProyjects = await fetchProjects();
  const resultColaboradore=await fetchCollaborators();
  const resultUsers = await getUsers();


  return (
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectClientView
          projects={resultProyjects}
          collaborators = {resultColaboradore}
          users={resultUsers}
        />
      </Suspense>
  );
}

