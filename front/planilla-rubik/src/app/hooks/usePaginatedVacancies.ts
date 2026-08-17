import { useEffect, useState } from "react";
import { Vacante } from "@/types/interface";
import { getVacancies } from "@/services/api";

export function usePaginatedVacancies(searchTerm: string) {
  const [vacancies, setVacancies] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getVacancies(searchTerm);
        setVacancies(
          data.map(v => ({
            ...v,
            Nombre: v.Nombre ?? "",
            Vacante: v.Vacante?.trim() || "Vacante sin nombre",
            manager_name: v.manager_name ?? "",
            Seniority: v.Seniority ?? "Sin especificar",
            "Fecha de pedido": v["Fecha de pedido"] ?? "",
            "Fecha de inicio": v["Fecha de inicio"] ?? "",
          }))
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchTerm]);

  return { vacancies, loading, error, setVacancies };
}
