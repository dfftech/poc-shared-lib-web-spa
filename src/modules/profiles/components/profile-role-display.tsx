interface ProfileRoleDisplayProps {
  roles: string[] | string | undefined;
}

export function ProfileRoleDisplay({ roles }: ProfileRoleDisplayProps) {
  const roleNames = (Array.isArray(roles) ? roles : roles ? [roles] : []).map((role) =>
    role.replaceAll("_", " "),
  );

  if (roleNames.length === 0) {
    return <span className="text-sm opacity-60">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roleNames.map((role) => (
        <span
          key={role}
          className="badge badge-sm badge-outline border-base-300 bg-base-200 text-base-content"
        >
          {role}
        </span>
      ))}
    </div>
  );
}
