import type { EmployeeProfile } from "@/types/profile.types";

export const display = (val: string | null | undefined): string =>
    val && val.trim() !== "" ? val : "...";

export const formatDate = (val: string | null | undefined): string => {
    if (!val) return "...";
    try {
        return new Date(val).toLocaleDateString("en-US", {
            month: "2-digit", day: "2-digit", year: "numeric",
        });
    } catch {
        return "...";
    }
};

export const getInitials = (profile: EmployeeProfile): string => {
    if (profile.firstName && profile.lastName)
        return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    if (profile.name) return profile.name.slice(0, 2).toUpperCase();
    return "??";
};

export const getDisplayName = (profile: EmployeeProfile): string => {
    if (profile.firstName && profile.lastName)
        return `${profile.firstName} ${profile.lastName}`;
    return display(profile.name);
};