import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ADMIN_PASSWORD = "Marvel";
const STORAGE_KEY = "knights_admin";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        /* noop */
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
