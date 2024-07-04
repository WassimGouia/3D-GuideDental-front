import { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: undefined,
  isLoading: false,
  setUser: (user) => {}, // Ensure setUser takes a user object
});

export const useAuthContext = () => useContext(AuthContext);
