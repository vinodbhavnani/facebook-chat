import { User } from "@/types/user.types";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const UserAvatar = ({ user, size = "md" }: UserAvatarProps) => {
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-primary text-primary-foreground",
    "bg-destructive text-destructive-foreground",
    "bg-accent-foreground text-accent",
    "bg-muted-foreground text-muted",
  ];
  const colorIndex = user.id.charCodeAt(user.id.length - 1) % colors.length;

  return (
    <div className="inline-flex shrink-0">
      <div
        className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold select-none`}
      >
        {initials}
      </div>
    </div>
  );
};

export default UserAvatar;
