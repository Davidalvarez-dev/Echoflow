"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_ROLE, employeeOf, type Employee, type RoleId } from "@/lib/roles";

const STORAGE_KEY = "hostflow.role";

type RoleContextValue = {
  role: RoleId;
  employee: Employee;
  setRole: (role: RoleId) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleId>(DEFAULT_ROLE);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY) as RoleId | null;
      if (saved && employeeOf(saved).role === saved) setRoleState(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function setRole(next: RoleId) {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <RoleContext.Provider value={{ role, employee: employeeOf(role), setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole debe usarse dentro de RoleProvider");
  return context;
}
