import { Suspense } from "react";
import EditClientView from "@/app/pages/edit/project/EditClientView";
import { fetchProjectById , getUsers } from "@/services/api"; 

export default async function ProjectEdit({ params }: { params: { taxonId: number } }) {
  const taxonId = (params.taxonId); 

  const resultProjectId = await fetchProjectById(taxonId);
  const users= await getUsers();

 

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditClientView
        projects={resultProjectId}
        users={users} 
      />
    </Suspense>
  );
}

