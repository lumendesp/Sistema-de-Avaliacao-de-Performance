import type { UserBadgeProps } from "../../types/DashboardCollaboratorTypes/userBadge";

const UserBadge = ({ name, initials }: UserBadgeProps) => {
  const defaultInitials = initials || name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
        {defaultInitials}
      </div>
    </div>
  );
};

export default UserBadge;
