import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/api";

export function useCatalog() {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: ({ signal }) => fetchCatalog(signal),
    staleTime: 60_000,
    retry: 1,
  });
}
