import { Suspense } from "react";
import ClientViewProjectDetail from "@/app/pages/detail/project_detail/ProjectPageClient";
import {fetchProjectById } from "@/services/api";

export default async function ProjectDetailPage({
  params,
}: {
  params: { taxonId: number };
}) {
  const taxonId = (params.taxonId); 

  const resultProjectId = await fetchProjectById(taxonId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientViewProjectDetail
        projects={resultProjectId}
      />
    </Suspense>
  );
}
