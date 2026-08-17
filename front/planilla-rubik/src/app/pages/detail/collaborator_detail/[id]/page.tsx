import { Suspense } from "react";
import { getColabById} from "@/services/api";
import CollaboratorDetailPageClient from "../CollaboratorDetailPageClient";
export default async  function CollaboratorDetail({
  params,
  }: { params: { id: string } }) {
  const { id } = params;
  const collaboratorId = await getColabById(id);
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <CollaboratorDetailPageClient
          colab={collaboratorId}
        />
      </Suspense>
  );
}
