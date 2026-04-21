import useSWR from "swr";
import api from "@/lib/axios";
import type { EmployeeProfile } from "@/types/profile.types";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useProfile() {
    const { data, isLoading, error, mutate } = useSWR<EmployeeProfile>(
        "/auth/me",
        fetcher,
        { revalidateOnFocus: false }
    );

    return { profile: data, isLoading, fetchError: error, mutate };
}