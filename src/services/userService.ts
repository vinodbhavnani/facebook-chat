import { User } from "@/types/user.types";
import { mockUsers, CURRENT_USER_ID } from "@/data/mockData";

/** Service for user data operations */
export const userService = {
  getAll: (): Record<string, User> => mockUsers,

  getById: (id: string): User | null => mockUsers[id] || null,

  getCurrentUser: (): User => mockUsers[CURRENT_USER_ID],

  search: (query: string): User[] => {
    const q = query.toLowerCase();
    return Object.values(mockUsers).filter(
      (u) =>
        u.id !== CURRENT_USER_ID &&
        (u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
    );
  },

  getOnlineUsers: (): User[] => {
    return Object.values(mockUsers).filter((u) => u.isOnline);
  },
};
