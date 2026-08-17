import { Suspense } from "react";
import TecnologyPageClientView from "./tecnologyClientView";
import { fetchTecnology } from "@/services/api";

export default async function Home() {
  const resultTecnology = await fetchTecnology();

  return (
      <Suspense fallback={<div>Loading...</div>}>
        <TecnologyPageClientView
         tecnology={resultTecnology}
        />
      </Suspense>
  );
}

