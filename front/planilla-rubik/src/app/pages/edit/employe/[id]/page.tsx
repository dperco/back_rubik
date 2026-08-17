import { Suspense } from "react";
import EditClientView from "@/app/pages/edit/employe/EditClientView";
import { getColabById, getUsers, fetchProjects ,  getAllTechnologies} from "@/services/api";

export default async function ProjectEdit({
  params,
}: {
  params: { id:number };
}) {
  const id = params.id;
  const techn= await getAllTechnologies();
  const projects = await fetchProjects();
  const resultColabId = await getColabById(id);
  const users = await getUsers();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditClientView project={projects} colab={resultColabId} users={users} tech={techn} />
    </Suspense>
  );
}
