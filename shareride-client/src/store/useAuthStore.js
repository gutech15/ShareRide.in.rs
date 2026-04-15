import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (userData) => set({ user: userData, token: userData.token }),

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem("auth-storage");
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
);
