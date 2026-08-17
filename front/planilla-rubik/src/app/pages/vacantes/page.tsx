import { Suspense } from "react";
import VacanciesPageClient from "./VacanciesPageClient";
import { fetchVacancies } from "@/services/api";
export default async function VacanciesPage() {
  const resultVacancies = await fetchVacancies();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VacanciesPageClient vacancies={resultVacancies} />
    </Suspense>
  );
}
