"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/utils";
import { JWTPayload } from "@/types/auth";
import { ROLES } from "@/lib/roles";

interface User {
  userId: string;
  name: string;
  email: string;
  token: string;
  role?: string;
  accountNo?: string;
  isAuthenticated: boolean;
}

// ... (AuthContextType remains same)

// ... (inside AuthProvider)



interface AuthContextType {
  user: User | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  updateUser: (data: { name?: string; accountNo?: string }) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("vault42_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Optional: Check token expiration here
        const decoded = parseJwt(parsedUser.token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser(parsedUser);
        } else {
          console.warn("Session expired");
          localStorage.removeItem("vault42_user");
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("vault42_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, email: string) => {
    const decoded: JWTPayload | null = parseJwt(token);

    if (!decoded || !decoded.sub) {
      console.error("Invalid token: missing subject (userId)");
      throw new Error("Invalid authentication token. Please contact support.");
    }

    const userId = decoded.sub;
    const roleId = decoded.role; // Assuming 'role' claim holds the UUID, or we might need to adjust if backend sends 'role_id'

    // Use email part as name until profile is fetched
    const name = email.split("@")[0];

    const newUser: User = {
      userId,
      name,
      email,
      token,
      role: roleId,
      isAuthenticated: true,
    };

    setUser(newUser);
    localStorage.setItem("vault42_user", JSON.stringify(newUser));

    // Redirect based on role ID
    console.log("Decoded Token:", decoded);
    console.log("Redirecting for role:", roleId);

    if (roleId === ROLES.CARE.id || roleId === ROLES.CARE.name) {
      router.push(ROLES.CARE.dashboard);
    } else if (roleId === ROLES.ANALYST.id || roleId === ROLES.ANALYST.name) {
      router.push(ROLES.ANALYST.dashboard);
    } else if (roleId === ROLES.CLERK.id || roleId === ROLES.CLERK.name) {
      router.push(ROLES.CLERK.dashboard);
    } else if (roleId === ROLES.CUSTOMER.id || roleId === ROLES.CUSTOMER.name) {
      console.log("Redirecting to Customer Dashboard (Explicit Check)");
      router.push(ROLES.CUSTOMER.dashboard);
    } else {
      // Default to Customer Dashboard
      console.log("Redirecting to Customer Dashboard (Fallback)");
      router.push("/dashboard");
    }
  };

  const updateUser = (data: { name?: string; accountNo?: string }) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("vault42_user", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vault42_user");
    localStorage.removeItem("chatbot_messages");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, isLoading: loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
