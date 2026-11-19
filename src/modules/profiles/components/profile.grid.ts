import type { ProfileType } from "../hooks/types";

export const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

export const getPersonaBadge = (persona: ProfileType["persona"]): string => {
  switch (persona.toLowerCase()) {
    case "admin":
      return "bg-rose-500/15 text-rose-600 border-rose-500/30";
    case "manager":
      return "bg-indigo-500/15 text-indigo-600 border-indigo-500/30";
    case "technician":
      return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    case "support":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "contractor":
      return "bg-purple-500/15 text-purple-600 border-purple-500/30";
    default:
      return "bg-base-300 text-base-content/80 border-base-300";
  }
};
