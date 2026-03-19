import { User } from "@/types/user.types";

interface AvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const colors = [
  "bg-primary text-primary-foreground",
  "bg-destructive text-destructive-foreground",
  "bg-accent-foreground text-accent",
  "bg-muted-foreground text-muted",
];

/** Reusable avatar component with initials and online indicator */
const Avatar = ({ user, size = "md", showOnline = false }: AvatarProps) => {
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colorIndex = user.id.charCodeAt(user.id.length - 1) % colors.length;

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold select-none`}
        aria-label={`Avatar for ${user.displayName}`}
      >
        {initials}
      </div>
      {showOnline && user.isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-fb-online border-2 border-card" aria-label="Online" />
      )}
    </div>
  );
};

export default Avatar;
