import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  birthdate?: string;
  avatar_url?: string;
  height?: number;
  weight?: number;
}

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    setLoading(true);
    setError("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      setUser(null);
      setError("Usuário não autenticado.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, email, cpf, phone, birthdate, avatar_url, height, weight"
      )
      .eq("id", userId)
      .single();
    if (error) {
      setError(error.message);
      setUser(null);
    } else {
      setUser(data as UserInfo);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = fetchUser;

  const updateUser = async (updates: Partial<UserInfo>) => {
    if (!user) return;
    setLoading(true);
    setError("");
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);
    if (error) {
      setError(error.message);
    } else {
      await fetchUser();
    }
    setLoading(false);
  };

  return (
    <UserContext.Provider
      value={{ user, loading, error, refreshUser, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
